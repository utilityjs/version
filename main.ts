import { Command } from "@cliffy/command";
import denoJson from "./deno.json" assert { type: "json" };
import {
  defaultAction,
  getCommand,
  getVersionBumpCommand,
  initCommand,
} from "./src/commands.ts";

await new Command()
  .description(
    `
    A command line utility for managing your project version.
  `,
  )
  .version(denoJson.version)
  .name("version")
  .action(defaultAction)
  .command("init", initCommand)
  .command("get", getCommand)
  .command("pre", getVersionBumpCommand("pre"))
  .command("major", getVersionBumpCommand("major"))
  .command("premajor", getVersionBumpCommand("premajor"))
  .command("minor", getVersionBumpCommand("minor"))
  .command("preminor", getVersionBumpCommand("preminor"))
  .command("patch", getVersionBumpCommand("patch"))
  .command("prepatch", getVersionBumpCommand("prepatch"))
  .command("prerelease", getVersionBumpCommand("prerelease"))
  .parse(Deno.args);
