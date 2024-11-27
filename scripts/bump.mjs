import { defineCommand, run } from "archons";
import { writeFileSync } from "fs";

const bump = defineCommand({
  meta: {
    name: "bump",
    styled: true,
  },
  options: {
    version: {
      type: "option",
      parser: "string",
    },
  },
  callback: (ctx) => {
    writeFileSync(".version", ctx.args.version);
  },
});

run(bump);
