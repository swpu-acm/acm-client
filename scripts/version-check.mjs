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

import axios from "axios";

const compareVersion = (a, b) => {
  const aArr = a.split("-")[0].split(".").map(Number);
  const bArr = b.split("-")[0].split(".").map(Number);
  for (let i = 0; i < aArr.length; i++) {
    if (aArr[i] > bArr[i]) {
      return 1;
    } else if (aArr[i] < bArr[i]) {
      return -1;
    }
  }

  const preSet = ["nightly", "alpha", "beta", "rc"];
  try {
    const aPre = a.split("-")[1].split(".")[0];
    const bPre = b.split("-")[1].split(".")[0];
    if (preSet.indexOf(aPre) > preSet.indexOf(bPre)) {
      return 1;
    } else if (preSet.indexOf(aPre) < preSet.indexOf(bPre)) {
      return -1;
    } else {
      const aNum = parseInt(a.split("-")[1].split(".")[1]);
      const bNum = parseInt(b.split("-")[1].split(".")[1]);
      if (aNum > bNum) {
        return 1;
      } else if (aNum < bNum) {
        return -1;
      }
    }
  } catch {}

  return 0;
};

axios
  .get(`https://api.github.com/repos/swpu-acm/algohub/git/refs/tags/`)
  .then((response) => {
    let latestTag = "0.0.0";
    const data = response.data;
    data.forEach((item) => {
      const version = item.ref.split("-v")[1];
      if (compareVersion(version, latestTag) === 1) {
        latestTag = version;
      }
    });
    console.log(latestTag);
  })
  .catch((error) => {
    console.error(error.data);
  });
