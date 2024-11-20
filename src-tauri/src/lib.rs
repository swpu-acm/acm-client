use serde::Deserialize;
use std::fs;


// 结构体，表示不同类型的最新版本
#[derive(Debug)]
struct LatestVersions {
    nightly: Option<String>,
    stable: Option<String>,
    alpha: Option<String>,
    beta: Option<String>,
    rc: Option<String>,
    error: bool,
}

impl LatestVersions {
    // LatestVersions 的构造函数，初始化所有版本为 None，并设置错误标志
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

// 结构体，表示来自 GitHub API 的标签响应
#[derive(Deserialize)]
struct TagResponse {
    pub r#ref: String,
}

// 异步函数，从 GitHub API 获取最新版本
async fn get_latest_versions() -> LatestVersions {
    let url = "https://api.github.com/repos/swpu-acm/algohub/git/refs/tags";
    let client = reqwest::Client::new();

    // 发送 GET 请求到 GitHub API 获取标签信息
    let response = match client.get(url).header("User-Agent", "reqwest").send().await {
        Ok(resp) => resp,
        Err(_) => return LatestVersions::new(true), // 如果请求失败，返回设置错误标志的 LatestVersions
    };

    // 将响应解析为 JSON 并转换为 TagResponse 的向量
    let tags = match response.json::<Vec<TagResponse>>().await {
        Ok(json) => json,
        Err(_) => return LatestVersions::new(true), // 如果解析失败，返回设置错误标志的 LatestVersions
    };

    let mut latest_versions = LatestVersions::new(false);

    // 反向遍历标签
    for item in tags.into_iter().rev() {
        if let Some(tag) = item.r#ref.as_str().strip_prefix("refs/tags/") {
            if tag.contains("nightly") {
                if latest_versions.nightly.is_none()
                    || latest_versions.nightly.as_deref().unwrap() < tag
                {
                    latest_versions.nightly = Some(tag.to_string());
                }
            } else if tag.contains("alpha") {
                if latest_versions.alpha.is_none()
                    || latest_versions.alpha.as_deref().unwrap() < tag
                {
                    latest_versions.alpha = Some(tag.to_string());
                }
            } else if tag.contains("beta") {
                if latest_versions.beta.is_none() || latest_versions.beta.as_deref().unwrap() < tag
                {
                    latest_versions.beta = Some(tag.to_string());
                }
            } else if tag.contains("rc") {
                if latest_versions.rc.is_none() || latest_versions.rc.as_deref().unwrap() < tag {
                    latest_versions.rc = Some(tag.to_string());
                }
            } else {
                if latest_versions.stable.is_none()
                    || latest_versions.stable.as_deref().unwrap() < tag
                {
                    latest_versions.stable = Some(tag.to_string());
                }
            }

            // 如果找到所有版本，退出循环
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

// 异步函数，下载指定版本的发布包
async fn download_release(version: &str) -> Result<(), Box<dyn std::error::Error>> {
    let os = std::env::consts::OS; // 获取操作系统类型
    let arch = std::env::consts::ARCH; // 获取架构类型

    // 如果系统是 Arch Linux，提示用户使用 AUR
    if os == "linux" {
        if let Ok(content) = fs::read_to_string("/etc/os-release") {
            if content.contains("Arch Linux") {
                println!("请使用 paru 或 pacman 进行更新");
                return Ok(());
            }
        }
    }

    // 将版本字符串中的 'v' 替换为 '0'
    let version = version.replace("v", "0");

    // 根据操作系统和架构确定合适的文件名
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
        _ => return Err("不支持的操作系统或架构".into()),
    };

    // 构造下载 URL
    let url = format!(
        "https://github.com/swpu-acm/algohub/releases/download/{}/{}",
        version, file_name
    );

    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .header("User-Agent", "reqwest")
        .send()
        .await?;

    // 检查响应状态是否成功
    if !response.status().is_success() {
        return Err(format!("下载发布包失败: {}", version).into());
    }

    let content = response.bytes().await?;

    // 将下载的内容写入文件
    let mut file = File::create(&file_name).await?;
    file.write_all(&content).await?;

    println!("下载完成: {}", file_name);

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
