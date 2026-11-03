use serde_json::json;
use std::fs::File;
use std::io::{BufRead, BufReader};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let hf_token = std::env::var("HF_TOKEN")
        .unwrap_or_else(|_| "{{YOUR_HF_API_TOKEN}}".to_string());

    let space_id = std::env::var("SPACE_ID")
        .unwrap_or_else(|_| "Sliverboy/healher-backend".to_string());

    let endpoint = format!("https://huggingface.co/api/spaces/{}/secrets", space_id);
    let client = reqwest::blocking::Client::new();

    // Look for .env in candidate paths
    let env_paths = [
        std::path::PathBuf::from(".env"),
        std::path::PathBuf::from("scripts/hf-secrets-uploader/.env"),
        std::path::PathBuf::from("scripts/hf-secrets-uploader/src/.env"),
        std::path::PathBuf::from("../../.env"),
    ];

    let mut target_path = None;
    for path in &env_paths {
        if path.exists() {
            target_path = Some(path.clone());
            break;
        }
    }
    let target_path = target_path.ok_or("Could not find .env file in candidate paths")?;
    println!("Loading secrets from {:?}", target_path);

    let file = File::open(target_path)?;
    let reader = BufReader::new(file);

    let mut success_count = 0;
    let mut fail_count = 0;

    for line_result in reader.lines() {
        let line = line_result?;
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        if let Some((raw_key, raw_val)) = trimmed.split_once('=') {
            let key = raw_key.trim().to_string();
            let mut val = raw_val.trim().to_string();

            // Strip surrounding double or single quotes if present
            if (val.starts_with('"') && val.ends_with('"'))
                || (val.starts_with('\'') && val.ends_with('\''))
            {
                if val.len() >= 2 {
                    val = val[1..val.len() - 1].to_string();
                }
            }

            if key.is_empty() || val.is_empty() {
                continue;
            }

            let payload = json!({
                "key": key,
                "value": val
            });

            let response = client
                .post(&endpoint)
                .header("Authorization", format!("Bearer {}", hf_token))
                .header("Content-Type", "application/json")
                .json(&payload)
                .send()?;

            let status = response.status();
            if status.is_success() {
                println!("[{}] Successfully uploaded secret: {}", status, key);
                success_count += 1;
            } else {
                eprintln!(
                    "[{}] Failed to upload secret {}: {}",
                    status,
                    key,
                    response.text().unwrap_or_default()
                );
                fail_count += 1;
            }
        }
    }

    println!("\nUpload complete: {} succeeded, {} failed.", success_count, fail_count);

    if fail_count > 0 {
        return Err("Some secrets failed to upload.".into());
    }

    Ok(())
}
