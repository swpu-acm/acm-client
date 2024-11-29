# Changelog

## \[0.1.1-nightly.17]

### New Features

- [`2ad6c71`](https://github.com/swpu-acm/algohub.git/commit/2ad6c71098076385c1d281007af89673f94ba2f9) ([#19](https://github.com/swpu-acm/algohub.git/pull/19) by [@K0nnyaku](https://github.com/swpu-acm/algohub.git/../../K0nnyaku)) Support fetch released versions.
- [`2412d98`](https://github.com/swpu-acm/algohub.git/commit/2412d9821c2ecb5d5edeac6316d48993d5dcf598) ([#60](https://github.com/swpu-acm/algohub.git/pull/60) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Support to show the list of problems in the dashboard.
- [`2412d98`](https://github.com/swpu-acm/algohub.git/commit/2412d9821c2ecb5d5edeac6316d48993d5dcf598) ([#60](https://github.com/swpu-acm/algohub.git/pull/60) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Add pages for user profile and list user's problems.

### Bug Fixes

- [`75a8d4f`](https://github.com/swpu-acm/algohub.git/commit/75a8d4f43e60cd26cac11b08f17350b20b17fb91) ([#59](https://github.com/swpu-acm/algohub.git/pull/59) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Mark breadcurmb background as transparent.
- [`75a8d4f`](https://github.com/swpu-acm/algohub.git/commit/75a8d4f43e60cd26cac11b08f17350b20b17fb91) ([#59](https://github.com/swpu-acm/algohub.git/pull/59) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Fix the background color of the panel in the create page.

### Refactors

- [`75a8d4f`](https://github.com/swpu-acm/algohub.git/commit/75a8d4f43e60cd26cac11b08f17350b20b17fb91) ([#59](https://github.com/swpu-acm/algohub.git/pull/59) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) -   Refactor monaco editor to fit user webview size automatically.

  - Fixed monaco editor larger than browser window size.
- [`75a8d4f`](https://github.com/swpu-acm/algohub.git/commit/75a8d4f43e60cd26cac11b08f17350b20b17fb91) ([#59](https://github.com/swpu-acm/algohub.git/pull/59) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Resize toolbar to fit the user scenario.

## \[0.1.1-nightly.16]

### Bug Fixes

- [`4553c45`](https://github.com/swpu-acm/algohub.git/commit/4553c45ca3a44492c4b4c86e38f7a33c3646da41) ([#56](https://github.com/swpu-acm/algohub.git/pull/56) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Fix sha256 checksum while using `axios` to download files.

## \[0.1.1-nightly.15]

### New Features

- [`8851f19`](https://github.com/swpu-acm/algohub.git/commit/8851f1989d7bb68eae8938ff4eefa37360bb09a8) ([#54](https://github.com/swpu-acm/algohub.git/pull/54) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Support for breadcrumbs in the AlgoHub toolbar.

### Bug Fixes

- [`ae84180`](https://github.com/swpu-acm/algohub.git/commit/ae8418060ec6f9b45974dd255e0bc5da2c333205) ([#53](https://github.com/swpu-acm/algohub.git/pull/53) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Fix git ssh key read and write permission issue when publishing to AUR.

## \[0.1.1-nightly.14]

### Bug Fixes

- [`04080ce`](https://github.com/swpu-acm/algohub.git/commit/04080ce145e257f6e55e567e7bd3f9c3e9a15628) ([#51](https://github.com/swpu-acm/algohub.git/pull/51) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Fix windows semver compatibility, uses `nsis` only now.

## \[0.1.1-nightly.13]

### Bug Fixes

- [`f30f24e`](https://github.com/swpu-acm/algohub.git/commit/f30f24e95ded09eeb814e73fa855bf6003b97cd0) ([#48](https://github.com/swpu-acm/algohub.git/pull/48) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Automatic update of version for `tauri.conf.json`.

## \[0.1.1-nightly.12]

### New Features

- [`e1529bb`](https://github.com/swpu-acm/algohub.git/commit/e1529bb4ac8a966808f865f39e041549e9deea00) ([#46](https://github.com/swpu-acm/algohub.git/pull/46) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Release algohub to archlinux user repository (AUR).

## \[0.1.1-nightly.11]

### New Features

- [`ded0848`](https://github.com/swpu-acm/algohub.git/commit/ded0848add538f4a8a2b79fc76ded269121dcf48) ([#41](https://github.com/swpu-acm/algohub.git/pull/41) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Support create new algorithm problem and upload test cases.
- [`1ef441e`](https://github.com/swpu-acm/algohub.git/commit/1ef441e4a29c7c011797083cba20800992ddb11b) ([#43](https://github.com/swpu-acm/algohub.git/pull/43) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Add page for problem

  - Add support for microsoft Monaco editor and setup to run Monaco locally.
  - Initial commit for submit code with specific language.
  - Set `Rust` as default language for submit code.

## \[0.1.1-nightly.10]

### New Features

- [`c9bc23b`](https://github.com/swpu-acm/algohub.git/commit/c9bc23b87ee27752316ad04c05502cd93f1bec60) ([#39](https://github.com/swpu-acm/algohub.git/pull/39) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Add a menu for creating new components.

  For examples:

  - Create a new blog
  - Create a new organization
  - Create a new algorithm problem
- [`38d66c3`](https://github.com/swpu-acm/algohub.git/commit/38d66c3cdd0fffaed45c028e8c592be2357ff270) ([#37](https://github.com/swpu-acm/algohub.git/pull/37) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Add side panel for displaying user routes and basic information.
- [`4d0ea28`](https://github.com/swpu-acm/algohub.git/commit/4d0ea28e94eabe3ff555fd0cd6d2029240e6a758) ([#38](https://github.com/swpu-acm/algohub.git/pull/38) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Migrate to new icon design.

### Bug Fixes

- [`ef2c89c`](https://github.com/swpu-acm/algohub.git/commit/ef2c89ccfe1f053dd690d2edd68d0cbcd1c73f03) ([#35](https://github.com/swpu-acm/algohub.git/pull/35) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Fix login page can't cover full screen.
- [`c9bc23b`](https://github.com/swpu-acm/algohub.git/commit/c9bc23b87ee27752316ad04c05502cd93f1bec60) ([#39](https://github.com/swpu-acm/algohub.git/pull/39) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Fix toast message will be displayed larger that horizontal screen.

## \[0.1.1-nightly.9]

### New Features

- [`ece911a`](https://github.com/swpu-acm/algohub.git/commit/ece911a71d682ce8487ac0a76c1ea28a46b78e9e) ([#32](https://github.com/swpu-acm/algohub.git/pull/32) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Add api export for login.

### Bug Fixes

- [`ece911a`](https://github.com/swpu-acm/algohub.git/commit/ece911a71d682ce8487ac0a76c1ea28a46b78e9e) ([#32](https://github.com/swpu-acm/algohub.git/pull/32) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Fix sub vue layout for `100vh`.

## \[0.1.1-nightly.8]

### Refactors

- [`270073b`](https://github.com/swpu-acm/algohub.git/commit/270073bf7dda64da47dbe9da2a7de2a79cb0d4a6) ([#33](https://github.com/swpu-acm/algohub.git/pull/33) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Use Farm instead of Vite for compiling and bundling frontend code.

## \[0.1.1-nightly.7]

### New Features

- [`21e266d`](https://github.com/swpu-acm/algohub.git/commit/21e266da2898a71f2b2137719042edc53852a736) ([#26](https://github.com/swpu-acm/algohub.git/pull/26) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Add index page for AlgoHub.
- [`09e481f`](https://github.com/swpu-acm/algohub.git/commit/09e481f3ab147434ba823f597877ead61f167460) ([#25](https://github.com/swpu-acm/algohub.git/pull/25) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Optimize dark mode selector for tailwindcss.
- [`7266ef9`](https://github.com/swpu-acm/algohub.git/commit/7266ef9f0ae2eaa87e6ca947dd7021d231caa3e6) ([#22](https://github.com/swpu-acm/algohub.git/pull/22) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Support for updating profile information and account activation.

## \[0.1.1-nightly.6]

### New Features

- [`a38653a`](https://github.com/swpu-acm/algohub.git/commit/a38653aeeb0d2b349308ad716cf738b032d93cd7) ([#18](https://github.com/swpu-acm/algohub.git/pull/18) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Add sign up panel in `signup.vue`.

### Bug Fixes

- [`2ac269d`](https://github.com/swpu-acm/algohub.git/commit/2ac269d3d48b2aa16b5e3e16b1ea20fa9f52c818) ([#16](https://github.com/swpu-acm/algohub.git/pull/16) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Fix dark mode selector for fronted

## \[0.1.1-nightly.5]

### New Features

- [`496a065`](https://github.com/swpu-acm/algohub.git/commit/496a06552a3f0135a8b3f4e7c25f8986732b040a) ([#15](https://github.com/swpu-acm/algohub.git/pull/15)) Optimize login UI and add icon in login page
- [`af8ed4d`](https://github.com/swpu-acm/algohub.git/commit/af8ed4d906fb08e72b8c30c128330e32d9c21973) ([#13](https://github.com/swpu-acm/algohub.git/pull/13)) Refactor login page to `login.vue`.

## \[0.1.1-nightly.4]

### Chores

- [`d724b73`](https://github.com/swpu-acm/algohub.git/commit/d724b739eff3a11463f0827f3f2d289cc2d3da1a) Revert changes to use rust nightly in `rust-toolchain` file

## \[0.1.1-nightly.3]

### Chores

- [`4d6ae56`](https://github.com/swpu-acm/algohub.git/commit/4d6ae5633223dd93fc25357610ff20b75c9153dc) ([#8](https://github.com/swpu-acm/algohub.git/pull/8) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Use stable Rust version in CI

## \[0.1.1-nightly.2]

### Chores

- [`4d6ae56`](https://github.com/swpu-acm/algohub.git/commit/4d6ae5633223dd93fc25357610ff20b75c9153dc) ([#8](https://github.com/swpu-acm/algohub.git/pull/8) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Use stable Rust version in CI

## \[0.1.1-nightly.1]

### Bug Fixes

- [`50c0560`](https://github.com/swpu-acm/algohub.git/commit/50c0560c5cfb73605765f5086f4c5d7a2da181cd) ([#3](https://github.com/swpu-acm/algohub.git/pull/3) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Add rust nightly targets for windows workflow

## \[0.1.1-nightly.0]

### Chores

- [`a085020`](https://github.com/swpu-acm/algohub.git/commit/a0850202757ed5dc4eb793d7b68f90519885a9e1) ([#1](https://github.com/swpu-acm/algohub.git/pull/1) by [@fu050409](https://github.com/swpu-acm/algohub.git/../../fu050409)) Release for nightly build
