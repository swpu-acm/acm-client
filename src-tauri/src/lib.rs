use serde::{Deserialize, Serialize};
use std::fs;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

// Struct representing the latest versions of different release types
#[derive(Debug, Serialize)]
struct LatestVersions {
    nightly: Option<String>,
    stable: Option<String>,
    alpha: Option<String>,
    beta: Option<String>,
    rc: Option<String>,
    error: bool,
}

impl LatestVersions {
    // Constructor for LatestVersions, initializing all versions to None and setting the error flag
    fn new(error: bool) -> Self {
        Self {
            nightly: None,
            stable: None,
            alpha: None,
            beta: None,
            rc: None,
            error,
        }
    }
}

// Struct representing the tag response from the GitHub API
#[derive(Deserialize)]
struct TagResponse {
    pub r#ref: String,
}

#[tauri::command]
// Asynchronous function to fetch the latest versions from the GitHub API
async fn get_latest_versions() -> LatestVersions {
    let url = "https://api.github.com/repos/swpu-acm/algohub/git/refs/tags";
    let client = reqwest::Client::new();

    // Send a GET request to the GitHub API to get tag information
    let response = match client.get(url).header("User-Agent", "reqwest").send().await {
        Ok(resp) => resp,
        Err(_) => return LatestVersions::new(true), // If request fails, return LatestVersions with error flag set
    };

    // Parse the response as JSON and convert it into a vector of TagResponse
    let tags = match response.json::<Vec<TagResponse>>().await {
        Ok(json) => json,
        Err(_) => return LatestVersions::new(true), // If parsing fails, return LatestVersions with error flag set
    };

    let mut latest_versions = LatestVersions::new(false);

    // Iterate over the tags in reverse order
    for item in tags.into_iter().rev() {
        if let Some(tag) = item.r#ref.as_str().strip_prefix("refs/tags/") {
            // Determine the type of version and update the latest version if necessary
            if tag.contains("nightly") {
                if latest_versions.nightly.is_none() || latest_versions.nightly.as_deref().unwrap() < tag {
                    latest_versions.nightly = Some(tag.to_string());
                }
            } else if tag.contains("alpha") {
                if latest_versions.alpha.is_none() || latest_versions.alpha.as_deref().unwrap() < tag {
                    latest_versions.alpha = Some(tag.to_string());
                }
            } else if tag.contains("beta") {
                if latest_versions.beta.is_none() || latest_versions.beta.as_deref().unwrap() < tag {
                    latest_versions.beta = Some(tag.to_string());
                }
            } else if tag.contains("rc") {
                if latest_versions.rc.is_none() || latest_versions.rc.as_deref().unwrap() < tag {
                    latest_versions.rc = Some(tag.to_string());
                }
            } else {
                if latest_versions.stable.is_none() || latest_versions.stable.as_deref().unwrap() < tag {
                    latest_versions.stable = Some(tag.to_string());
                }
            }

            // If all versions are found, break out of the loop
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

    latest_versions
}

#[derive(Serialize)]
struct DownloadResult {
    error: bool,
    message: Option<String>,
}

impl DownloadResult {
    fn new(error: bool, message: Option<String>) -> Self {
        Self { error, message }
    }
}

#[tauri::command]
// Asynchronous function to download a specific release based on the version
async fn download_release(version: &str) -> Result<DownloadResult, String> {
    let os = std::env::consts::OS; // Get the operating system type
    let arch = std::env::consts::ARCH; // Get the architecture type

    // If the system is Arch Linux, provide a message to use AUR
    if os == "linux" {
        if let Ok(content) = fs::read_to_string("/etc/os-release") {
            if content.contains("Arch Linux") {
                return Ok(DownloadResult::new(true, Some("Please use paru or pacman to update".to_string())));
            }
        }
    }

    // Replace 'v' with '0' in the version string
    let version = version.replace("v", "0");

    // Determine the appropriate file name based on the OS and architecture
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
        ("linux", "aarch64") => format!("algohub_aarch64.app.tar.gz"),
        ("windows", "x86_64") => {
            if cfg!(target_env = "msvc") {
                format!("algohub_{}_x64_en-US.msi", version)
            } else {
                format!("algohub_{}_x64-setup.exe", version)
            }
        }
        _ => return Err("Unsupported OS or architecture".to_string()),
    };

    // Construct the download URL
    let url = format!(
        "https://github.com/swpu-acm/algohub/releases/download/{}/{}",
        version, file_name
    );

    let client = reqwest::Client::new();
    let response = match client.get(&url).header("User-Agent", "reqwest").send().await {
        Ok(resp) => resp,
        Err(_) => return Err("Failed to send request".to_string()),
    };

    // Check if the response status is successful
    if !response.status().is_success() {
        return Err(format!("Failed to download release: {}", version));
    }

    let content = match response.bytes().await {
        Ok(bytes) => bytes,
        Err(_) => return Err("Failed to read response content".to_string()),
    };

    // Write the downloaded content to a file
    let mut file = match File::create(&file_name).await {
        Ok(f) => f,
        Err(_) => return Err("Failed to create file".to_string()),
    };

    if let Err(_) = file.write_all(&content).await {
        return Err("Failed to write to file".to_string());
    }

    Ok(DownloadResult::new(false, Some(format!("Downloaded release: {}", file_name))))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
// Entry point for running the Tauri application
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_latest_versions, download_release])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}