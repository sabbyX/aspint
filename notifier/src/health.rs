use std::collections::HashMap;

use chrono::TimeDelta;
use indexmap::IndexMap;
use serde::Deserialize;
use teloxide::{prelude::*, types::ParseMode, Bot};

use crate::{error::Error, utils::{GBSupportedCenters, SupportedCountries}};

#[derive(Debug, Deserialize)]
struct HealthCheckModel {
    message: String,
    status: String,
    last_fail: f64,
    fail_rate: i64,
    worker_id: Option<String>,
    proxy: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ProxyHealthCheckModel {
    status: String,
    ipdata: Option<IndexMap<String, String>>,
}

fn build_text(data: IndexMap<SupportedCountries, IndexMap<String, HealthCheckModel>>) -> String {
    let mut msg = String::from("Worker health status\n\n");

    for (country, center_data) in data {
        msg.push_str(&format!("<b>{}</b>\n", &country.to_text()));
        for (r_center, health) in center_data {
            let status = match health.status.as_str() {
                "error" => "🔴",
                "warning" => "🟡",
                "intermediate" => "🔵",
                "running" => "🟢",
                _ => "🔴"
            };

            let mut is_assistive = false;
            let mut center_code = r_center.as_str();
            if r_center.contains('-') {
                is_assistive = true;
                center_code = r_center.split('-').next().unwrap();
            }

            if let (Some(center), _) = GBSupportedCenters::from_code(center_code) {
                msg.push_str(&format!("    {} <b>{}</b>", status, center.to_text()));
                if is_assistive {
                    msg.push_str(&format!(" ({} - {})", 
                        health.worker_id.unwrap_or(String::from("Unknown")), health.proxy.unwrap_or(String::from("no-proxy")))
                    );
                    if health.status != "running" {
                        msg.push_str("\n        ");
                    }
                }
                if health.status == "running" {
                    msg.push('\n');
                } else {
                    msg.push_str(&format!(" - {} \n", health.message));
                }

                if health.fail_rate > 0 && TimeDelta::seconds(health.last_fail as i64) < TimeDelta::hours(1){
                    msg.push_str(&format!("        <i>fail rate</i>: {}\n", health.fail_rate));
                    let td = TimeDelta::seconds(health.last_fail as i64);
                    let td_str = format!("{} minutes ago",td.num_minutes());
                    msg.push_str(&format!("        <i>last fail</i>: {}\n", td_str));
                }
            }
        }
        msg.push('\n');
    }
    msg
}


fn build_text_proxy_status(data: IndexMap<String, ProxyHealthCheckModel>, server_details: HashMap<&str, &str>) -> String {
    let mut msg = String::from("Proxy server health\n");

    for (prxyn, health) in data {
        let status = match health.status.as_str() {
            "running" => "🟢",
            _ => "🔴"
        };
        msg.push_str(&format!("{} <b>{}</b>\n", status, &server_details.get(prxyn.as_str()).unwrap_or(&"unknown proxy")));

        if let Some(ip) = health.ipdata {
            msg.push_str(&format!("    <b>IP</b>: {}\n", &ip.get("public_ip").unwrap_or(&String::from("can't retrieve IP"))));
        }
    }

    msg
}

pub async fn healthcheck_command_handler(msg: Message, bot: Bot) -> Result<(), Error> {

    let worker_health = reqwest::get(
        "http://localhost:8000/health/worker"
    )
        .await?
        .json::<IndexMap<SupportedCountries, IndexMap<String, HealthCheckModel>>>()
        .await?;

    let hardcoded_d = HashMap::from([
        (("1"), "Marsielle, France"),
        ("2", "East London, UK"),
        ("3", "Wembley, UK"),
        ("4", "Paris, France"),
    ]);

    let proxy_health = reqwest::get(
        "http://localhost:8000/health/proxy"
    )
        .await?
        .json::<IndexMap<String, ProxyHealthCheckModel>>()
        .await?;

    let text = build_text(worker_health);

    bot.send_message(msg.chat.id, text)
        .parse_mode(ParseMode::Html)
        .await?;

    let text = build_text_proxy_status(proxy_health, hardcoded_d);
    bot.send_message(msg.chat.id, text)
    .parse_mode(ParseMode::Html)
    .await?;

    Ok(())
}
