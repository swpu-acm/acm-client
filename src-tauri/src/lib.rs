// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug)]
struct LatestVersions {
    nightly: Option<String>,
    stable: Option<String>,
    alpha: Option<String>,
    beta: Option<String>,
    flag: i32,
}

impl LatestVersions {
    fn new(flag: i32) -> Self {
        Self {
            nightly: None,
            stable: None,
            alpha: None,
            beta: None,
            flag,
        }
    }
}

#[derive(Debug)]
enum Release {
    Nightly(i32),
    Stable,
    Alpha,
    Beta,
}

#[derive(Debug)]
struct SeparateVersion {
    major: i32,
    minor: i32,
    patch: i32,
    name: Release,
}

impl FromStr for SeparateVersion {
    type Err = String;

    fn from_str(version: &str) -> Result<Self, Self::Err> {
        let version = version
            .strip_prefix("algohub-v")
            .ok_or("Invalid version format")?;
        let parts: Vec<&str> = version.split('-').collect();
        if parts.len() < 2 {
            return Err("Invalid version format".to_string());
        }

        let version_numbers: Vec<&str> = parts[0].split('.').collect();
        if version_numbers.len() != 3 {
            return Err("Invalid version numbers format".to_string());
        }

        let major = version_numbers[0]
            .parse::<i32>()
            .map_err(|_| "Invalid major version".to_string())?;
        let minor = version_numbers[1]
            .parse::<i32>()
            .map_err(|_| "Invalid minor version".to_string())?;
        let patch = version_numbers[2]
            .parse::<i32>()
            .map_err(|_| "Invalid patch version".to_string())?;

        let name = if parts.len() == 2 {
            match parts[1] {
                n if n.starts_with("nightly.") => {
                    let build = n[8..].parse::<i32>().unwrap_or(0);
                    Release::Nightly(build)
                }
                "alpha" => Release::Alpha,
                "beta" => Release::Beta,
                _ => Release::Stable,
            }
        } else {
            Release::Stable
        };

        Ok(SeparateVersion {
            major,
            minor,
            patch,
            name,
        })
    }
}

#[derive(Deserialize)]
struct TagResponse {
    pub r#ref: String,
}

async fn get_latest_versions() -> LatestVersions {
    let url = "https://api.github.com/repos/swpu-acm/algohub/git/refs/tags";
    let client = reqwest::Client::new();
    let response = match client.get(url).header("User-Agent", "reqwest").send().await {
        Ok(resp) => resp,
        Err(_) => return LatestVersions::new(1),
    };

    let tags = match response.json::<Vec<TagResponse>>().await {
        Ok(json) => json,
        Err(_) => return LatestVersions::new(1),
    };

    let mut latest_versions = LatestVersions::new(0);

    for item in tags.into_iter().rev() {
        if let Some(tag) = item.r#ref.as_str().strip_prefix("refs/tags/") {
            match tag {
                t if t.contains("nightly") => {
                    if latest_versions.nightly.is_none()
                        || latest_versions.nightly.as_deref().unwrap() < t
                    {
                        latest_versions.nightly = Some(t.to_string());
                    }
                }
                t if t.contains("alpha") => {
                    if latest_versions.alpha.is_none()
                        || latest_versions.alpha.as_deref().unwrap() < t
                    {
                        latest_versions.alpha = Some(t.to_string());
                    }
                }
                t if t.contains("beta") => {
                    if latest_versions.beta.is_none()
                        || latest_versions.beta.as_deref().unwrap() < t
                    {
                        latest_versions.beta = Some(t.to_string());
                    }
                }
                _ => {
                    if latest_versions.stable.is_none()
                        || latest_versions.stable.as_deref().unwrap() < tag
                    {
                        latest_versions.stable = Some(tag.to_string());
                    }
                }
            }

            if latest_versions.nightly.is_some()
                && latest_versions.alpha.is_some()
                && latest_versions.stable.is_some()
                && latest_versions.beta.is_some()
            {
                break;
            }
        }
    }

    latest_versions
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
