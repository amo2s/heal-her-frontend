# Hugging Face Space Secret Management Utility (`hf-secret-sync`)

A standalone, asynchronous Rust utility that automates the synchronization and lifecycle management of Hugging Face Space secrets via the Hugging Face Hub REST API.

## Core Capabilities

1. **Total Remote Credential Wipe**: Interrogates the active Space secrets vault and issues discrete HTTP `DELETE` calls to eliminate stale/compromised credentials.
2. **Deterministic Manifest Ingestion**: Parses local `.env` configuration manifests, safely discarding comments and formatting errors.
3. **Resilient Network Dispatch**: Asynchronously dispatches `POST` requests to create secrets, equipped with exponential backoff and retry handling for rate limits (`429`).
4. **Zero-Trust Information Masking**: Strictly masks secret values during execution logging to ensure zero credential leakage in terminal history or container logs.

## Build

Compile the release binary with Cargo:

```bash
cd scripts/hf-secret-sync
cargo build --release
```

## Usage

### Option 1: Command-Line Arguments
```bash
cargo run --release -- "<SPACE_ID>" "<HF_API_TOKEN>" [PATH_TO_ENV_FILE]
```
Example:
```bash
cargo run --release -- "amo2s/heal-her-backend" "hf_xxxx..." "../../caasify-env/auth.env"
```

### Option 2: Environment Variables
```bash
export HF_SPACE_ID_URL="amo2s/heal-her-backend"
export HF_API_TOKEN="hf_xxxx..."
export ENV_FILE_PATH="../../caasify-env/auth.env"

cargo run --release
```
