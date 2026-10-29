# ==============================================================================
# STAGE 1: The Builder (Compiles the Rust Microservice with Layer Caching)
# ==============================================================================
FROM rust:1.80-slim-bookworm AS builder

WORKDIR /usr/src/app

# Install system compilation packages (pkg-config, OpenSSL headers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests
COPY Cargo.toml Cargo.lock ./

# Cache dependencies using a dummy entrypoint
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Copy genuine source code and Askama compile-time templates
COPY src ./src
COPY templates ./templates

# Force timestamp refresh on main.rs and compile final release binary
RUN touch src/main.rs && cargo build --release

# ==============================================================================
# STAGE 2: The Minimal Production Runner (Zero Toolchain, Non-Root Execution)
# ==============================================================================
FROM debian:bookworm-slim AS runner

WORKDIR /app

# Install CA certificates for secure TLS handshakes (reqwest -> Google Mailer Webhook)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated unprivileged user and group for hardened defense-in-depth
RUN groupadd -r appgroup && useradd -r -g appgroup -s /sbin/nologin appuser

# Copy isolated binary from builder stage
COPY --from=builder /usr/src/app/target/release/auth /usr/local/bin/auth

# Ensure executable permissions and switch to unprivileged user
RUN chmod +x /usr/local/bin/auth
USER appuser

# Expose internal microservice port
EXPOSE 8080

# Default execution entrypoint
CMD ["auth"]
