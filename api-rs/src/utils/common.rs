use anyhow::anyhow;

pub fn extract_issuer_from_center(center: String) -> Result<String, anyhow::Error> {
    if center.len() < 3 { return Err(anyhow!("Invalid center: {}", center)); }
    let issuer = center.chars().rev().take(2).collect();
    Ok(issuer)
}
