import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import { defaultAction, getCommand, initCommand, getVersionBumpCommand } from "./src/commands.ts";

await new Command()
  .description(`
    A command line utility for managing your project version.
  `)
  .version("0.1.0")
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
