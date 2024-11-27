import { execSync } from "child_process";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { defineCommand, run } from "archons";
import { createHash } from "crypto";
import axios from "axios";

const PKGBUILD_TEMPLATE = `# Maintainer: 苏向夜 <fu050409@163.com>
# Contributor: 苏向夜 <fu050409@163.com>
pkgname=algohub
pkgver=<pkgver>
pkgrel=1
pkgdesc="ACM Algorithm Hub"
arch=('x86_64')
url="https://github.com/swpu-acm/algohub.git"
license=('agplv3')
depends=('cairo' 'desktop-file-utils' 'gdk-pixbuf2' 'glib2' 'gtk3' 'hicolor-icon-theme' 'libsoup' 'pango' 'webkit2gtk-4.1')
options=('!strip' '!emptydirs')
install=\${pkgname}.install
source_x86_64=("https://github.com/swpu-acm/algohub/releases/download/algohub-v<version>/algohub_<version>_amd64.deb")
sha256sums=('<sha256sums>')
package() {
  tar -xz -f data.tar.gz -C "\${pkgdir}"
}
`;

function generateSHA256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("data", (data) => {
      hash.update(data);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}

const releaseAur = defineCommand({
  meta: {
    name: "release-aur",
    styled: true,
  },
  options: {
    version: {
      type: "option",
      parser: "string",
      required: true,
    },
  },
  callback: async (ctx) => {
    if (!existsSync("aur")) {
      execSync(
        "git -c init.defaultBranch=master clone ssh://aur@aur.archlinux.org/algohub.git aur"
      );
    }

    const { version } = ctx.args;

    // const url = `https://github.com/swpu-acm/algohub/releases/download/algohub-v${version}/algohub_${version}_amd64.deb`;
    const url = `https://github.com/swpu-acm/algohub/releases/download/algohub-v${version}/algohub_0.1.0_amd64.deb`;
    try {
      console.log(`Downloading ${url}...`);
      const response = await axios.get(url, {
        responseType: "stream",
      });
      response.data.pipe(createWriteStream("aur/algohub.deb"));
      console.log("Download complete.");
    } catch (error) {
      console.error(error);
      return;
    }

    console.log("Generating SHA256 checksums...");
    const sha256sums = await generateSHA256("aur/algohub.deb");
    console.log(`SHA256 checksums: ${sha256sums}`);

    const PKGBUILD = PKGBUILD_TEMPLATE.replaceAll("<version>", version)
      .replaceAll("<pkgver>", version.replaceAll("-", "_"))
      .replaceAll("<sha256sums>", sha256sums);
    writeFileSync("aur/PKGBUILD", PKGBUILD);

    execSync("makepkg --printsrcinfo > .SRCINFO", {
      cwd: "aur",
      stdio: "inherit",
    });

    unlinkSync("aur/algohub.deb");

    const AUR_SSH_KEY = process.env.AUR_SSH_KEY;

    if (!AUR_SSH_KEY) {
      console.error("AUR_SSH_KEY environment variable is not set.");
      return;
    }

    writeFileSync(`${process.env.HOME}/.ssh/aur`, AUR_SSH_KEY + "\n");
    execSync("chmod 600 ~/.ssh/aur");
    execSync(`git -C aur config core.sshCommand "ssh -i ~/.ssh/aur"`);

    execSync("git -C aur add PKGBUILD .SRCINFO algohub.install", {
      stdio: "inherit",
    });
    execSync(`git -C aur commit -m "release: v${version}"`);

    execSync(`git -C aur push origin master`, {
      stdio: "inherit",
    });
  },
});

run(releaseAur);
