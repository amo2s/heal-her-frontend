// ==============================================================================
// HUGGING FACE SPACE SECRET SYNCHRONIZATION & WIPE ORCHESTRATOR
// Standalone Operational Utility for Automated Space Vault Management
// ==============================================================================

use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::Path;
use std::time::Duration;
use serde::{Deserialize, Serialize};

// ------------------------------------------------------------------------------
// EXPLICIT CONFIGURATION PLACEHOLDERS
// (DO NOT COMMIT REAL CREDENTIALS - INJECT VIA CLI OR ENVIRONMENT VARIABLES)
// ------------------------------------------------------------------------------
pub const DEFAULT_HF_SPACE_ID_URL: &str = "{{HF_SPACE_ID_URL}}";
pub const DEFAULT_HF_API_TOKEN: &str = "{{HF_API_TOKEN}}";

/// Flexible deserializer for Hugging Face Space secrets endpoint response
#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum SecretEntry {
    ObjectWithKey { key: String },
    ObjectWithName { name: String },
    RawString(String),
}

impl SecretEntry {
    fn extract_key(self) -> String {
        match self {
            SecretEntry::ObjectWithKey { key } => key,
            SecretEntry::ObjectWithName { name } => name,
            SecretEntry::RawString(s) => s,
        }
    }
}

/// Secret creation payload conforming to Hugging Face Hub REST API specification
#[derive(Debug, Serialize)]
struct CreateSecretPayload<'a> {
    key: &'a str,
    value: &'a str,
    description: &'a str,
}

/// Normalizes various Space ID representations into a canonical API base URL
/// Formats supported:
/// - "username/space-name"
/// - "https://huggingface.co/spaces/username/space-name"
/// - "https://huggingface.co/api/spaces/username/space-name"
fn resolve_secrets_endpoint(raw: &str) -> Result<String, String> {
    let trimmed = raw.trim().trim_end_matches('/');

    if trimmed == "{{HF_SPACE_ID_URL}}" {
        return Err("Placeholder {{HF_SPACE_ID_URL}} is unconfigured. Provide a valid Space ID or URL via CLI or HF_SPACE_ID_URL env var.".to_string());
    }

    if trimmed.contains("/api/spaces/") {
        if trimmed.ends_with("/secrets") {
            Ok(trimmed.to_string())
        } else {
            Ok(format!("{}/secrets", trimmed))
        }
    } else if let Some(stripped) = trimmed.strip_prefix("https://huggingface.co/spaces/") {
        Ok(format!("https://huggingface.co/api/spaces/{}/secrets", stripped))
    } else if let Some(stripped) = trimmed.strip_prefix("http://huggingface.co/spaces/") {
        Ok(format!("https://huggingface.co/api/spaces/{}/secrets", stripped))
    } else if trimmed.contains('/') && !trimmed.contains("://") {
        Ok(format!("https://huggingface.co/api/spaces/{}/secrets", trimmed))
    } else {
        Err(format!("Unrecognized Hugging Face Space identifier: '{}'. Expected format: 'username/space-name' or 'https://huggingface.co/spaces/username/space-name'", trimmed))
    }
}

/// Safely masks secret values for terminal display (e.g., "******** [len=32]")
fn mask_value(val: &str) -> String {
    let len = val.len();
    if len == 0 {
        "EMPTY".to_string()
    } else {
        format!("******** (len: {} bytes)", len)
    }
}

/// Performs an HTTP operation with exponential backoff retry logic
async fn execute_with_retry<F, Fut, T>(
    operation_name: &str,
    max_retries: u32,
    base_delay_ms: u64,
    mut op: F,
) -> Result<T, String>
where
    F: FnMut() -> Fut,
    Fut: std::future::Future<Output = Result<T, reqwest::Error>>,
{
    let mut attempt = 0;
    loop {
        attempt += 1;
        match op().await {
            Ok(result) => return Ok(result),
            Err(err) => {
                let status = err.status();
                let is_retriable = status.map_or(true, |s| {
                    s == reqwest::StatusCode::TOO_MANY_REQUESTS || s.is_server_error()
                });

                if is_retriable && attempt <= max_retries {
                    let delay = Duration::from_millis(base_delay_ms * 2u64.pow(attempt - 1));
                    println!(
                        "  [RATE-LIMIT / RETRY] {} attempt {}/{} encountered: {}. Backing off {:?}...",
                        operation_name, attempt, max_retries, err, delay
                    );
                    tokio::time::sleep(delay).await;
                } else {
                    return Err(format!("{} failed after {} attempts: {}", operation_name, attempt, err));
                }
            }
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=================================================================");
    println!(" HUGGING FACE SPACE SECRET SYNCHRONIZATION UTILITY");
    println!(" Zero-Trust Credential Neutralization and Provisioning Engine");
    println!("=================================================================\n");

    // 1. Resolve Target Space Endpoint and Authentication Token
    let raw_space = std::env::args()
        .nth(1)
        .or_else(|| std::env::var("HF_SPACE_ID_URL").ok())
        .unwrap_or_else(|| DEFAULT_HF_SPACE_ID_URL.to_string());

    let token = std::env::args()
        .nth(2)
        .or_else(|| std::env::var("HF_API_TOKEN").ok())
        .unwrap_or_else(|| DEFAULT_HF_API_TOKEN.to_string());

    let env_file_path = std::env::args()
        .nth(3)
        .or_else(|| std::env::var("ENV_FILE_PATH").ok())
        .unwrap_or_else(|| ".env".to_string());

    if token == "{{HF_API_TOKEN}}" || token.trim().is_empty() {
        eprintln!("[FATAL ERROR] Placeholder {{{{HF_API_TOKEN}}}} is unconfigured.");
        eprintln!("Provide a valid Hugging Face User Access Token (with Write permissions) via:");
        eprintln!("  1. CLI Argument: cargo run -- <SPACE_ID> <HF_TOKEN> [ENV_FILE]");
        eprintln!("  2. Environment Variable: HF_API_TOKEN=\"hf_...\"");
        std::process::exit(1);
    }

    let secrets_endpoint = match resolve_secrets_endpoint(&raw_space) {
        Ok(ep) => ep,
        Err(err) => {
            eprintln!("[FATAL ERROR] {}", err);
            eprintln!("Provide a valid target Space via:");
            eprintln!("  1. CLI Argument: cargo run -- <SPACE_ID> <HF_TOKEN> [ENV_FILE]");
            eprintln!("  2. Environment Variable: HF_SPACE_ID_URL=\"username/space-name\"");
            std::process::exit(1);
        }
    };

    println!("[CONFIG] Target Secrets API Endpoint: {}", secrets_endpoint);
    println!("[CONFIG] Target Environment File Manifest: {}", env_file_path);
    println!("[CONFIG] Bearer Authorization Token: Bearer [REDACTED (len: {} chars)]\n", token.len());

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()?;

    // --------------------------------------------------------------------------
    // PHASE A: TOTAL CREDENTIAL WIPE
    // Query active Space secrets and issue discrete DELETE requests for each key
    // --------------------------------------------------------------------------
    println!("-----------------------------------------------------------------");
    println!(" PHASE A: REMOTE CREDENTIAL AUDIT & TOTAL WIPE");
    println!("-----------------------------------------------------------------");

    println!("[AUDIT] Querying active secrets from Hugging Face Space vault...");
    let list_response = client
        .get(&secrets_endpoint)
        .header("Authorization", format!("Bearer {}", token))
        .header("Accept", "application/json")
        .send()
        .await?;

    let list_status = list_response.status();
    if !list_status.is_success() {
        let err_body = list_response.text().await.unwrap_or_default();
        eprintln!("[ERROR] Failed to list existing Space secrets (HTTP {}): {}", list_status, err_body);
        eprintln!("Verify that the Space exists and that your Hugging Face Token has WRITE access to it.");
        std::process::exit(1);
    }

    let raw_json = list_response.text().await?;
    let active_secrets: Vec<SecretEntry> = match serde_json::from_str(&raw_json) {
        Ok(entries) => entries,
        Err(parse_err) => {
            println!("[AUDIT] Response payload is empty or not a list ({}); treating active secrets as 0.", parse_err);
            Vec::new()
        }
    };

    let keys_to_delete: Vec<String> = active_secrets
        .into_iter()
        .map(|entry| entry.extract_key())
        .collect();

    if keys_to_delete.is_empty() {
        println!("[AUDIT] No pre-existing secrets discovered on remote vault. Space is clean.\n");
    } else {
        println!("[AUDIT] Discovered {} active secret(s) slated for neutralization:\n", keys_to_delete.len());

        let mut wipe_success_count = 0;
        let mut wipe_fail_count = 0;

        for key in &keys_to_delete {
            let delete_url = format!("{}/{}", secrets_endpoint, key);
            print!("  [WIPE] Deleting remote secret '{}' ... ", key);

            let res = execute_with_retry(&format!("DELETE '{}'", key), 5, 1000, || {
                client
                    .delete(&delete_url)
                    .header("Authorization", format!("Bearer {}", token))
                    .send()
            })
            .await;

            match res {
                Ok(resp) => {
                    let status = resp.status();
                    if status.is_success() || status == reqwest::StatusCode::NOT_FOUND {
                        println!("SUCCESS (HTTP {})", status);
                        wipe_success_count += 1;
                    } else {
                        let text = resp.text().await.unwrap_or_default();
                        println!("FAILED (HTTP {}): {}", status, text);
                        wipe_fail_count += 1;
                    }
                }
                Err(e) => {
                    println!("ERROR: {}", e);
                    wipe_fail_count += 1;
                }
            }
        }

        println!("\n[AUDIT] Credential wipe complete: {} purged, {} failed.\n", wipe_success_count, wipe_fail_count);
    }

    // --------------------------------------------------------------------------
    // PHASE B: LOCAL CONFIGURATION MANIFEST INGESTION & SYNCHRONIZATION
    // Parse target .env manifest and dispatch POST requests for secret injection
    // --------------------------------------------------------------------------
    println!("-----------------------------------------------------------------");
    println!(" PHASE B: LOCAL MANIFEST INGESTION & SYNCHRONIZATION");
    println!("-----------------------------------------------------------------");

    let path = Path::new(&env_file_path);
    if !path.exists() {
        eprintln!("[FATAL ERROR] Environment manifest file not found at: {}", env_file_path);
        eprintln!("Specify the path to your .env file via command-line argument or ENV_FILE_PATH variable.");
        std::process::exit(1);
    }

    println!("[INGEST] Parsing key-value pairs from '{}'...", env_file_path);
    let file = File::open(path)?;
    let reader = BufReader::new(file);

    let mut secrets_to_push: Vec<(String, String)> = Vec::new();

    for (line_num, raw_line) in reader.lines().enumerate() {
        let line = raw_line?;
        let trimmed = line.trim();

        // Safely ignore comments and whitespace
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        if let Some(pos) = trimmed.find('=') {
            let key = trimmed[..pos].trim().to_string();
            let mut value = trimmed[pos + 1..].trim().to_string();

            // Strip surrounding double or single quotes if present
            if (value.starts_with('"') && value.ends_with('"'))
                || (value.starts_with('\'') && value.ends_with('\''))
            {
                if value.len() >= 2 {
                    value = value[1..value.len() - 1].to_string();
                }
            }

            if !key.is_empty() {
                secrets_to_push.push((key, value));
            }
        } else {
            println!("  [WARN] Line {} does not contain '=' delimiter; skipping.", line_num + 1);
        }
    }

    println!("[INGEST] Successfully extracted {} environment variable(s) for synchronization.\n", secrets_to_push.len());

    let mut sync_success_count = 0;
    let mut sync_fail_count = 0;

    for (key, val) in &secrets_to_push {
        print!("  [SYNC] Pushing secret: {:<32} [value: {}] ... ", key, mask_value(val));

        let payload = CreateSecretPayload {
            key,
            value: val,
            description: "Automated sync via heal-her-hf-secret-sync orchestrator",
        };

        let res = execute_with_retry(&format!("POST '{}'", key), 5, 1000, || {
            client
                .post(&secrets_endpoint)
                .header("Authorization", format!("Bearer {}", token))
                .header("Content-Type", "application/json")
                .json(&payload)
                .send()
        })
        .await;

        match res {
            Ok(resp) => {
                let status = resp.status();
                if status.is_success() {
                    println!("SUCCESS (HTTP {})", status);
                    sync_success_count += 1;
                } else {
                    let err_text = resp.text().await.unwrap_or_default();
                    println!("FAILED (HTTP {}): {}", status, err_text);
                    sync_fail_count += 1;
                }
            }
            Err(e) => {
                println!("ERROR: {}", e);
                sync_fail_count += 1;
            }
        }
    }

    println!("\n=================================================================");
    println!(" EXECUTION REPORT SUMMARY");
    println!("=================================================================");
    println!(" Target Space Endpoint   : {}", secrets_endpoint);
    println!(" Remote Secrets Purged   : {}", keys_to_delete.len());
    println!(" Local Secrets Parsed    : {}", secrets_to_push.len());
    println!(" Successfully Pushed     : {}", sync_success_count);
    println!(" Failed Synchronizations : {}", sync_fail_count);
    println!(" Security Posture        : Zero secrets leaked to console / log output.");
    println!("=================================================================\n");

    if sync_fail_count > 0 {
        std::process::exit(1);
    }

    Ok(())
}
