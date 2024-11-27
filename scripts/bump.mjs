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
