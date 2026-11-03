use serde_json::json;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let hf_token = "{{YOUR_HF_API_TOKEN}}";
    let space_id = "Sliverboy/heal-her-backend";

    let endpoint = format!("https://huggingface.co/api/spaces/{}/secrets", space_id);
    let client = reqwest::blocking::Client::new();

    // Load .env into iterator (supports running from repo root or project subdirectory)
    let iter = dotenvy::from_path_iter(".env")
        .or_else(|_| dotenvy::from_path_iter("../../.env"))?;

    for item in iter {
        let (key, value) = item?;
        let payload = json!({
            "key": key,
            "value": value
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
        } else {
            eprintln!(
                "[{}] Failed to upload secret {}: {}",
                status,
                key,
                response.text().unwrap_or_default()
            );
        }
    }

    Ok(())
}
