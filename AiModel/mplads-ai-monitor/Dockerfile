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
ENV PYTHONPATH="/app:$PYTHONPATH"

# Copy source code (excluding dev files via .dockerignore)
COPY . .

# Ensure startup script is executable
RUN chmod +x /app/start.sh

# Create required directories
RUN mkdir -p data/processed data/raw data/cleaned data/analytical \
             outputs/models outputs/artifacts outputs/reports outputs/logs

# Expose port (Railway overrides this with $PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:' + str(__import__('os').environ.get('PORT', 8000)) + '/health')"

# Use startup script
CMD ["bash", "/app/start.sh"]

