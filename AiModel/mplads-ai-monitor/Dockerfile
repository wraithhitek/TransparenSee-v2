# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — builder: install Python deps into a clean venv
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# System deps needed to compile some wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Create a virtual env and install only production deps (no pytest/httpx dev extras)
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --upgrade pip && \
    pip install --no-cache-dir \
        pandas>=2.2 \
        numpy>=1.26 \
        scipy>=1.11 \
        scikit-learn>=1.4 \
        pyarrow>=15.0 \
        sqlalchemy>=2.0 \
        fastapi>=0.110 \
        "uvicorn[standard]>=0.27" \
        pydantic>=2.6 \
        requests>=2.31 \
        pyyaml>=6.0 \
        joblib>=1.3

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — runtime: copy only what the server needs
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy venv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy source code (excluding dev files via .dockerignore)
COPY . .

# Create required directories
RUN mkdir -p data/processed data/raw data/cleaned data/analytical \
             outputs/models outputs/artifacts outputs/reports outputs/logs

# The pre-built SQLite DB and ML model are baked into the image
# so the container starts instantly without re-running the pipeline.
# They are generated locally once and committed (see DEPLOYMENT.md).

# Expose FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Run uvicorn pointing at the FastAPI app
CMD ["uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
