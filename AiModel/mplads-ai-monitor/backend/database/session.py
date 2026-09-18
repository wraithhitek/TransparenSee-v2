"""Engine / session factory and bulk-load helpers."""
from __future__ import annotations

import pandas as pd
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

from common.config import get_config
from common.logging_utils import get_logger
from backend.database.models import Base

log = get_logger("database.session")
_engine = None


def _ensure_sqlite_db(url: str) -> None:
    if not url.startswith("sqlite"):
        return
    import gzip
    import shutil
    from pathlib import Path

    raw_path = url.replace("sqlite:////", "/").replace("sqlite:///", "")
    db_path = Path(raw_path)
    if not db_path.is_absolute():
        from common.config import ROOT
        db_path = ROOT / raw_path

    is_invalid = False
    if db_path.exists():
        try:
            with open(db_path, "rb") as f:
                header = f.read(16)
                if not header.startswith(b"SQLite format 3"):
                    is_invalid = True
        except Exception:
            is_invalid = True
    else:
        is_invalid = True

    if is_invalid:
        gz_path = db_path.with_name(db_path.name + ".gz")
        if gz_path.exists():
            log.info("Extracting %s -> %s (database missing or invalid)...", gz_path, db_path)
            db_path.parent.mkdir(parents=True, exist_ok=True)
            with gzip.open(gz_path, "rb") as f_in, open(db_path, "wb") as f_out:
                shutil.copyfileobj(f_in, f_out)
            log.info("Database extracted successfully (%d bytes).", db_path.stat().st_size)


def get_engine():
    global _engine
    if _engine is None:
        url = get_config().db_url
        if url.startswith("sqlite"):
            _ensure_sqlite_db(url)
        kwargs = {"future": True}
        if url.startswith("sqlite"):
            kwargs["connect_args"] = {"check_same_thread": False}
        _engine = create_engine(url, **kwargs)
        if url.startswith("sqlite"):
            with _engine.begin() as conn:
                conn.execute(text("PRAGMA journal_mode=WAL"))
                conn.execute(text("PRAGMA synchronous=NORMAL"))
    return _engine


SessionLocal = sessionmaker(bind=get_engine(), autoflush=False, future=True)


def create_all(drop: bool = False) -> None:
    engine = get_engine()
    if drop:
        Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    log.info("Warehouse schema ready (%d tables)", len(Base.metadata.tables))


def table_columns(table: str) -> list[str]:
    return [c.name for c in Base.metadata.tables[table].columns]


def bulk_load(df: pd.DataFrame, table: str, replace: bool = True, chunksize: int = 5000) -> int:
    """Load a frame into a warehouse table, keeping only declared columns.

    SQLite has a hard limit of 32,766 bound variables per statement.
    With wide tables the default chunksize of 5000 rows easily exceeds this,
    so we cap it to floor(32766 / n_cols) to stay safely under the limit.
    """
    engine = get_engine()
    cols = table_columns(table)
    frame = df.copy()
    for col in cols:
        if col not in frame.columns:
            frame[col] = None
    frame = frame[cols]
    # SQLite has no native bool/timestamp-with-tz handling in pandas; normalise.
    for col in frame.columns:
        if pd.api.types.is_datetime64_any_dtype(frame[col]):
            frame[col] = pd.to_datetime(frame[col], utc=True, errors="coerce").dt.tz_localize(None)
        elif frame[col].dtype == "boolean":
            frame[col] = frame[col].astype("object").where(frame[col].notna(), None)
    if replace:
        with engine.begin() as conn:
            conn.execute(text(f"DELETE FROM {table}"))
    if "id" in cols and frame["id"].isna().all():
        frame = frame.drop(columns=["id"])
    # Compute safe chunksize: SQLite allows max 32,766 variables per INSERT.
    n_cols = len(frame.columns)
    safe_chunk = max(1, min(chunksize, 32766 // n_cols))
    frame.to_sql(table, engine, if_exists="append", index=False, chunksize=safe_chunk, method="multi")
    log.info("Loaded %-26s %7d rows", table, len(frame))
    return len(frame)


def query_df(sql: str, params: dict | None = None) -> pd.DataFrame:
    with get_engine().connect() as conn:
        return pd.read_sql(text(sql), conn, params=params or {})
