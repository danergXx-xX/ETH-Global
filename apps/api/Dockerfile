# AI Treasury Council - Backend production image
# Multi-stage build dla szczuplego runtime image (<200 MB)

# === Stage 1: Builder ===
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONUSERBASE=/install

WORKDIR /app

# Build deps (lxml/cryptography wymagaja gcc + libffi)
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libffi-dev \
        libxml2-dev \
        libxslt-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# PYTHONUSERBASE=/install zapewnia przewidywalna sciezke (nie zalezy od HOME usera w builderze)
RUN pip install --user --no-cache-dir -r requirements.txt

# === Stage 2: Runtime ===
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/home/app/.local/bin:$PATH" \
    PORT=8000

# Runtime libs (lxml runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
        libxml2 \
        libxslt1.1 \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user (security baseline)
RUN useradd --create-home --shell /bin/bash app

WORKDIR /app

COPY --from=builder --chown=app:app /install /home/app/.local
COPY --chown=app:app . .

USER app

EXPOSE 8000

# Healthcheck wbudowany - Railway respektuje
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -fsS "http://localhost:${PORT}/health" || exit 1

# uvicorn z --proxy-headers (Railway za Cloudflare proxy)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT} --proxy-headers --forwarded-allow-ips '*'"]
