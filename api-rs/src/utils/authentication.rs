use std::ops::Add;
use chrono::{TimeDelta, Utc};
use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use mongodb::bson::doc;
use mongodb::Client;
use muddy::muddy;
use redis::AsyncCommands;
use crate::model::user::User;
use crate::state::AppState;

#[muddy]
static SECRET_KEY: &str = "56b0d4468a687801564a4541df91467cc869e78283cf15f552c6a48fb01a094f";

#[derive(Deserialize, Serialize, Debug)]
pub struct Claims {
    sub: String,
    exp: usize,
}

pub fn decode_jwt(token: &String) -> Result<Claims, anyhow::Error> {
    let token = decode::<Claims>(token, &DecodingKey::from_secret(SECRET_KEY.as_ref()), &Validation::default())?;
    Ok(token.claims)
}

pub async fn verify_jwt(state: &AppState, claims: &Claims, token: &String) -> Result<bool, anyhow::Error> {
    let cache_key = format!("u$srcache:{}:{}", &claims.sub, &token);
    let mut redis_conn = state.redis.get().await?;
    if redis_conn.exists(&cache_key).await? {
        Ok(true)
    } else {
        let res: Option<User> = state.db.database("aspint")
            .collection::<User>("service_users")
            .find_one(doc! {"username": &claims.sub})
            .await?;
        if res.is_some() {
            let _: () = redis_conn.set(&cache_key, &claims.sub).await?;
            let _: () = redis_conn.expire(&cache_key, claims.exp as i64 -  Utc::now().timestamp()).await?;
        }
        Ok(res.is_some())
    }
}

pub fn generate_jwt(user: &User) -> Result<String, anyhow::Error> {
    let claims = Claims { sub: user.username.clone(), exp: Utc::now().add(TimeDelta::days(1)).timestamp() as usize };
    let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(SECRET_KEY.as_ref()))?;
    Ok(token)
}
