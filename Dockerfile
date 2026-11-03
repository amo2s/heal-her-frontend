# ==============================================================================
# UNIFIED MULTI-SERVICE DOCKERFILE FOR HUGGING FACE SPACES
# Consolidated Architecture: Auth (Rust), Dashboard (Rust), TOS (Python), Nginx
# Optimized for Non-Root UID 1000 & Exposed Port 7860
# ==============================================================================

# ------------------------------------------------------------------------------
# BASE: Cargo-Chef with Modern Rust Toolchain (Tracks Latest Rust 1.x / >= 1.89)
# ------------------------------------------------------------------------------
FROM lukemathwalker/cargo-chef:latest-rust-1-bookworm AS chef
WORKDIR /app

# ------------------------------------------------------------------------------
# STAGE 1: Build Rust Authentication Microservice (Cargo-Chef Cache Acceleration)
# ------------------------------------------------------------------------------
FROM chef AS auth-planner
WORKDIR /app
COPY backend/services/auth .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS auth-builder
WORKDIR /app
COPY --from=auth-planner /app/recipe.json recipe.json
ENV CARGO_PROFILE_RELEASE_STRIP=true
ENV CARGO_PROFILE_RELEASE_LTO=fat
RUN cargo chef cook --release --recipe-path recipe.json
COPY backend/services/auth .
RUN cargo build --release --bin auth

# ------------------------------------------------------------------------------
# STAGE 2: Build Rust Multi-Schema Dashboard Microservice
# ------------------------------------------------------------------------------
FROM chef AS dashboard-planner
WORKDIR /app
COPY backend/services/dashboard .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS dashboard-builder
WORKDIR /app
COPY --from=dashboard-planner /app/recipe.json recipe.json
ENV CARGO_PROFILE_RELEASE_STRIP=true
ENV CARGO_PROFILE_RELEASE_LTO=fat
RUN cargo chef cook --release --recipe-path recipe.json
COPY backend/services/dashboard .
RUN cargo build --release --bin dashboard

# ------------------------------------------------------------------------------
# STAGE 3: Unified Runtime Environment (Debian Bookworm Slim + Python 3.12)
# ------------------------------------------------------------------------------
FROM python:3.12-slim-bookworm AS runtime

# Install system runtime dependencies: Nginx, Supervisor, WeasyPrint graphics stack, & fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    ca-certificates \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Install Astral uv for deterministic, ultra-fast Python package resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Create Hugging Face non-root user and group with exact UID/GID 1000
RUN groupadd -g 1000 appuser && \
    useradd -u 1000 -g 1000 -m -s /bin/bash appuser

# Install Python TOS (Legal Service) dependencies
WORKDIR /app/legal_service
COPY backend/legal_service/pyproject.toml .
COPY backend/legal_service/uv.lock* .
RUN uv pip install --system --no-cache -r pyproject.toml
COPY backend/legal_service/ .

# Install compiled Rust microservice binaries
WORKDIR /app/bin
COPY --from=auth-builder /app/target/release/auth /app/bin/auth
COPY --from=dashboard-builder /app/target/release/dashboard /app/bin/dashboard
RUN chmod +x /app/bin/auth /app/bin/dashboard

# Copy Nginx and Supervisord configurations
WORKDIR /app
COPY nginx.conf /app/config/nginx.conf
COPY supervisord.conf /app/config/supervisord.conf

# Create all required user-space directories for Nginx and Supervisor
RUN mkdir -p \
    /tmp/nginx/run \
    /tmp/nginx/logs \
    /tmp/nginx/client_body \
    /tmp/nginx/proxy \
    /tmp/nginx/fastcgi \
    /tmp/nginx/uwsgi \
    /tmp/nginx/scgi \
    /tmp/supervisor \
    /var/log/supervisor \
    /var/log/nginx \
    /var/lib/nginx \
    && chown -R 1000:1000 \
    /tmp/nginx \
    /tmp/supervisor \
    /var/log/supervisor \
    /var/log/nginx \
    /var/lib/nginx \
    /app

# Enforce non-root execution per Hugging Face Spaces requirements
USER 1000

# Hugging Face Spaces single ingress port
EXPOSE 7860

# Launch Supervisord as process master
CMD ["supervisord", "-c", "/app/config/supervisord.conf"]
