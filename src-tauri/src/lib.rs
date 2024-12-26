/*****************************************************************************
 * AlgoHub: Cross-platform online judge client based on Tauri
 * Copyright (C) 2024 Association of Computing Machinery affiliated SWPU
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *****************************************************************************/

use serde::{Deserialize, Serialize};
use std::fs;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

#[derive(Debug, Serialize)]
struct LatestVersions {
    nightly: Option<String>,
    stable: Option<String>,
    alpha: Option<String>,
    beta: Option<String>,
    rc: Option<String>,
    status: bool,
}

impl Default for LatestVersions {
    fn default() -> Self {
        Self {
            nightly: None,
            stable: None,
            alpha: None,
            beta: None,
            rc: None,
            status: true,
        }
    }
}

#[derive(Serialize)]
struct Error {
    status: bool,
    message: String,
}

impl<T: AsRef<str>> From<T> for Error {
    fn from(value: T) -> Self {
        Self {
            status: false,
            message: value.as_ref().to_string(),
        }
    }
}


#[derive(Deserialize)]
struct TagResponse {
    pub r#ref: String,
}


#[tauri::command]
async fn get_latest_versions() -> Result<LatestVersions, Error> {
    let url = "https://api.github.com/repos/swpu-acm/algohub/git/refs/tags";
    let client = reqwest::Client::new();

    // Send a GET request to the GitHub API to get tag information
    let response = client
        .get(url)
        .header("User-Agent", "AlgoHub")
        .send()
        .await
        .map_err(|e| e.to_string())?;


    let tags = response
        .json::<Vec<TagResponse>>()
        .await
        .map_err(|_| "Failed to parse response".to_string())?;

    let mut latest_versions = LatestVersions::default();


    for item in tags.into_iter().rev() {
        if let Some(tag) = item.r#ref.as_str().strip_prefix("refs/tags/algohub-v") {

            let tag = tag.to_string();
            if tag.contains("nightly") {
                if latest_versions.nightly.is_none()
                    || latest_versions.nightly.as_ref().unwrap() < &tag
                {
                    latest_versions.nightly = Some(tag.to_string());
                }
            } else if tag.contains("alpha") {
                if latest_versions.alpha.is_none()
                    || latest_versions.alpha.as_ref().unwrap() < &tag
                {
                    latest_versions.alpha = Some(tag.to_string());
                }
            } else if tag.contains("beta") {
                if latest_versions.beta.is_none() || latest_versions.beta.as_ref().unwrap() < &tag
                {
                    latest_versions.beta = Some(tag.to_string());
                }
            } else if tag.contains("rc") {
                if latest_versions.rc.is_none() || latest_versions.rc.as_ref().unwrap() < &tag {
                    latest_versions.rc = Some(tag.to_string());
                }
            } else if latest_versions.stable.is_none()
                    || latest_versions.stable.as_ref().unwrap() < &tag
                {
                    latest_versions.stable = Some(tag.to_string());
                }



            if latest_versions.nightly.is_some()
                && latest_versions.alpha.is_some()
                && latest_versions.stable.is_some()
                && latest_versions.beta.is_some()
                && latest_versions.rc.is_some()
            {
                break;
            }
        }
    }

    Ok(latest_versions)
}


#[derive(Serialize)]
struct DownloadResult {
    status: bool,
    message: Option<String>,
}

impl Default for DownloadResult {
    fn default() -> Self {
        Self {
            status: true,
            message: None,
        }
    }
}

#[tauri::command]
async fn download_release(version: &str) -> Result<DownloadResult, Error> {
    let os = std::env::consts::OS;
    let arch = std::env::consts::ARCH;

    let mut result = DownloadResult::default();

    if os == "linux" {
        if let Ok(content) = fs::read_to_string("/etc/os-release") {
            if content.contains("Arch Linux") {
                result.message=Some("Please install the latest version manually".to_string());
                return Ok(result)
            }
        }
    }


    let file_name = match (os, arch) {
        ("macos", "x86_64") => format!("algohub_{}_x64.dmg", version),
        ("macos", "aarch64") => format!("algohub_{}_aarch64.dmg", version),
        ("linux", "x86_64") => {
            if cfg!(target_env = "gnu") {
                format!("algohub-{}-1.x86_64.rpm", version)
            } else {
                format!("algohub_{}_amd64.deb", version)
            }
        }
        ("linux", "aarch64") => "algohub_aarch64.app.tar.gz".to_string(),
        ("windows", "x86_64") => {
            if cfg!(target_env = "msvc") {
                format!("algohub_{}_x64_en-US.msi", version)
            } else {
                format!("algohub_{}_x64-setup.exe", version)
            }
        }
        _ =>  {
            return Err(format!(
                "Unsupported OS or architecture: OS = {}, ARCH = {}",
                os, arch
            )
            .into())
        }

    };


    let url = format!(
        "https://github.com/swpu-acm/algohub/releases/download/{}/{}",
        version, file_name
    );

    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .header("User-Agent", "AlgoHub")
        .send()
        .await
        .map_err(|e| format!("Failed to send request to {}: {}", url, e).to_string())?;


    if !response.status().is_success() {
        return Err(format!(
            "Failed to download release from {}. HTTP Status: {}",
            url,
            response.status()
        )
        .into());
    }

    let content = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read response content: {}", e).to_string())?;



    let mut file = File::create(&file_name)
        .await
        .map_err(|e| format!("Failed to create file {}: {}", file_name, e).to_string())?;

    file.write_all(&content)
        .await
        .map_err(|e| format!("Failed to write to file {}: {}", file_name, e).to_string())?;

    Ok(DownloadResult {
        status: true,
        message: Some(format!("Successfully downloaded release: {}", file_name)),
    })
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_latest_versions,
            download_release
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
