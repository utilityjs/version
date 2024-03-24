import { exists, readJsonFile, writeJsonFile } from "./utils.ts";
import UserError from "./UserError.ts";
import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/command.ts";
import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/select.ts";
import { format, increment, parse, ReleaseType } from "jsr:@std/semver";
import { GITUtility } from "jsr:@utility/git";

const VERSION_FILE_NAME = "version.json";

type VersionConfig = {
  version: string;
  prerelease?: string;
  deno?: boolean;
  signGitTag?: boolean;
};

export async function defaultAction() {
  if (!(await _versionFileExists())) {
    throw new UserError(
      `Could not read ${VERSION_FILE_NAME} file. Run \`version init\` to create one`
    );
  }

  const release: string = await Select.prompt({
    message: "Pick release type",
    options: [
      { name: "pre", value: "pre" },
      { name: "major", value: "major" },
      { name: "premajor", value: "premajor" },
      { name: "minor", value: "minor" },
      { name: "preminor", value: "preminor" },
      { name: "patch", value: "patch" },
      { name: "prepatch", value: "prepatch" },
      { name: "prerelease", value: "prerelease" },
    ],
  });

  await _versionBump(release);
}

/*
 * Command to print version of project.
 *
 * @example
 * $> version get
 * => 1.0.0
 */
export const getCommand = new Command()
  .description("Prints version of project.")
  .action(async (options: any) => {
    console.log(await _readVersion());
  });

/*
 * Command creates version.json file in project root, with selected options.
 *
 * @example
 * $> version init
 */
export const initCommand = new Command()
  .description(
    "Creates version.json file in project root, with selected options."
  )
  .arguments("[initVersion]")
  .action(async (_options: any, initVersion) => {
    if (await new GITUtility().hasUncommittedChanges()) {
      throw new UserError("Cannot release with uncommitted changes");
    }

    const version = initVersion || "1.0.0";

    await writeJsonFile(VERSION_FILE_NAME, {
      version: version,
      deno: true,
      node: true,
      jsr: true,
      signGitTag: true,
    });

    _commitAndTag(version);

    console.log(`${version}`);
  });

export function getVersionBumpCommand(release: string) {
  return new Command()
    .description(`Bump version to \"${release}\" release`)
    .action(async () => {
      await _versionBump(release);
    });
}

// Helper functions
async function _versionFileExists() {
  return await exists(VERSION_FILE_NAME);
}

async function _versionBump(release: string) {
  if (await new GITUtility().hasUncommittedChanges()) {
    throw new UserError("Cannot release with uncommitted changes");
  }

  const versionConfig: VersionConfig = await _getVersionConfig();
  const oldVersion = versionConfig.version;
  const newVersion = format(
    increment(
      parse(versionConfig.version),
      <ReleaseType>release,
      versionConfig.prerelease || "pre"
    )
  );

  versionConfig.version = newVersion;
  await writeJsonFile(VERSION_FILE_NAME, versionConfig);

  if (versionConfig.deno && (await exists("deno.json"))) {
    console.log("deno.json found");
    const denoConfig: any = await readJsonFile("deno.json");
    console.log(denoConfig);
    if (denoConfig) {
      denoConfig.version = newVersion;
      await writeJsonFile("deno.json", denoConfig);
    }
  }

  _commitAndTag(newVersion);

  console.log(`${oldVersion} -> ${newVersion}`);
}

async function _getVersionConfig(): Promise<VersionConfig> {
  let content: VersionConfig;

  try {
    content = await readJsonFile(VERSION_FILE_NAME);
  } catch (err) {
    if (err instanceof Deno.errors.PermissionDenied) {
      throw err;
    } else {
      throw new UserError(
        `Could not read ${VERSION_FILE_NAME} file. Run \`version init\` to create one`
      );
    }
  }

  try {
    parse(content.version);
  } catch (e) {
    throw new UserError(
      `${VERSION_FILE_NAME} file contained "${content.version}", which is not a valid version string`
    );
  }

  return content;
}

async function _readVersion(): Promise<string> {
  return (await _getVersionConfig()).version;
}

export async function _commitAndTag(normalizedVersion: string) {
  const gitUtil = new GITUtility();
  await gitUtil.runCommand("add", "*");
  await gitUtil.runCommand("commit", "-m", normalizedVersion);
  await gitUtil.runCommand(
    "tag",
    "-s",
    `v${normalizedVersion}`,
    "-m",
    `v${normalizedVersion}`
  );
}
