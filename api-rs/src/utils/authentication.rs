use std::ops::Add;
use chrono::{DateTime, TimeDelta, Utc};
use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use mongodb::bson::doc;
use mongodb::Client;
use muddy::muddy;
use crate::model::user::User;

#[muddy]
static SECRET_KEY: &str = "56b0d4468a687801564a4541df91467cc869e78283cf15f552c6a48fb01a094f";

#[derive(Deserialize, Serialize, Debug)]
pub struct Claims {
    sub: String,
    exp: usize,
}

pub fn decode_jwt(token: String) -> Result<Claims, anyhow::Error> {
    let token = decode::<Claims>(&token, &DecodingKey::from_secret(SECRET_KEY.as_ref()), &Validation::default())?;
    Ok(token.claims)
}

pub async fn verify_jwt(db: &Client, claims: &Claims) -> Result<bool, anyhow::Error> {
    // todo: caching
    let res: Option<User> = db.database("aspint")
        .collection::<User>("service_users")
        .find_one(doc! {"username": &claims.sub})
        .await?;
    Ok(res.is_some())
}

pub fn generate_jwt(user: &User) -> Result<String, anyhow::Error> {
    let claims = Claims { sub: user.username.clone(), exp: Utc::now().add(TimeDelta::days(1)).timestamp() as usize };
    let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(SECRET_KEY.as_ref()))?;
    Ok(token)
}
