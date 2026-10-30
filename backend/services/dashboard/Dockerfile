# ==============================================================================
# STAGE 1: Chef Base (Installs cargo-chef for dependency caching)
# ==============================================================================
FROM rust:1.80-slim-bullseye AS chef
RUN cargo install cargo-chef
WORKDIR /app

# ==============================================================================
# STAGE 2: Planner (Calculates dependency recipe lockfile)
# ==============================================================================
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# ==============================================================================
# STAGE 3: Builder (Cooks cached dependencies, then compiles release binary)
# ==============================================================================
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
ENV CARGO_PROFILE_RELEASE_STRIP=true
ENV CARGO_PROFILE_RELEASE_LTO=fat
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release --bin dashboard

# ==============================================================================
# STAGE 4: Distroless Runtime (Zero-shell, minimal attack surface)
# ==============================================================================
FROM gcr.io/distroless/cc-debian12
WORKDIR /app
COPY --from=builder /app/target/release/dashboard /app/dashboard

EXPOSE 8081
ENV HOST=0.0.0.0
ENV PORT=8081
ENTRYPOINT ["/app/dashboard"]

