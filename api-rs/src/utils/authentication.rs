use std::ops::Add;
use std::str::FromStr;
use anyhow::anyhow;
use chrono::{TimeDelta, Utc};
use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
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

pub fn decode_jwt(token: &str) -> Result<Claims, anyhow::Error> {
    let token = decode::<Claims>(token, &DecodingKey::from_secret(SECRET_KEY.as_ref()), &Validation::default())?;
    Ok(token.claims)
}

pub async fn verify_jwt(state: &AppState, claims: &Claims, token: &String) -> Result<Option<User>, anyhow::Error> {
    let cache_key = format!("userCacheV2.1:{}:{}", &claims.sub, &token);
    let mut redis_conn = state.redis.get().await?;
    if redis_conn.exists(&cache_key).await? {
        let raw: String = redis_conn.get(&cache_key).await?;
        Ok(Some(serde_json::from_str::<User>(&raw)?))
    } else {
        let res: Option<User> = state.db.database("aspint")
            .collection::<User>("service_users")
            .find_one(doc! {"_id": ObjectId::from_str(&claims.sub)?})
            .await?;
        let user = res.ok_or(anyhow!("User not found"))?;
        let _: () = redis_conn.set(&cache_key, serde_json::to_string(&user)?).await?;
        let _: () = redis_conn.expire(&cache_key, claims.exp as i64 -  Utc::now().timestamp()).await?;
        Ok(Some(user))
    }
}

pub fn generate_jwt(user: &User) -> Result<String, anyhow::Error> {
    let claims = Claims { sub: user.id.unwrap_or_default().to_string(), exp: Utc::now().add(TimeDelta::days(1)).timestamp() as usize };
    let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(SECRET_KEY.as_ref()))?;
    Ok(token)
}
