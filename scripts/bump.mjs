/*****************************************************************************
 * AlgoHub: Cross-platform online judge cilent based on Tauri
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

import { defineCommand, run } from "archons";
import { readFileSync, writeFileSync } from "fs";

const bump = defineCommand({
  meta: {
    name: "bump",
    styled: true,
  },
  options: {
    version: {
      type: "option",
      parser: "string",
      global: true,
    },
  },
  callback: (ctx) => {
    writeFileSync(".version", ctx.args.version);
  },
  subcommands: {
    tauri: {
      meta: {
        name: "tauri",
        styled: true,
      },
      options: {},
      callback: (ctx) => {
        const tauriConfig = JSON.parse(
          readFileSync("./src-tauri/tauri.conf.json", "utf-8")
        );
        tauriConfig.version = ctx.args.version;
        writeFileSync(
          "./src-tauri/tauri.conf.json",
          JSON.stringify(tauriConfig, null, 2)
        );
      },
    },
  },
});

run(bump);
