import { exists, readJsonFile, writeJsonFile } from "./utils.ts";
import UserError from "./UserError.ts";
import { Command } from "@codemonument/cliffy/command";
import { Select } from "@codemonument/cliffy/prompt";
import { format, increment, parse, ReleaseType } from "jsr:@std/semver@0.221.0";
import { GITUtility } from "@utility/git";

const VERSION_FILE_NAME = "version.json";

type VersionConfig = {
  version: string;
  prerelease?: string;
  deno?: boolean;
  signGitTag?: boolean;
};

/**
 * The default action to perform when no specific command is provided.
 * It checks for the existence of the version file and prompts the user to select a release type.
 * @throws {UserError} If the version file does not exist.
 */
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

/**
 * Command to print the current version of the project.
 * @example
 * $> version get
 * => 1.0.0
 */
export const getCommand = new Command()
  .description("Prints version of project.")
  .action(async (options: any) => {
    console.log(await _readVersion());
  });

/**
 * Command to initialize the versioning system by creating a version.json file.
 * @example
 * $> version init
 */
export const initCommand = new Command()
  .description(
    "Creates version.json file in project root, with selected options."
  )
  .arguments("[initVersion]")
  .action(async (_options: any, initVersion?: string) => {
    if (await new GITUtility().hasUncommittedChanges()) {
      throw new UserError("Cannot release with uncommitted changes");
    }

    // Set the initial version or use the provided version
    const version = initVersion || "0.1.0";

    const versionConfig = {
      version: version,
      deno: true,
      node: true,
      jsr: true,
      signGitTag: true,
    };

    await writeJsonFile(VERSION_FILE_NAME, versionConfig);

    _updateDENOJSON(versionConfig);
    _updatePACKAGEJSON(versionConfig);
    _updateJSRJSON(versionConfig);

    _commitAndTag(version);

    console.log(`${version}`);
  });

/**
 * Creates a new command that bumps the project version to the specified release type.
 * @param {string} release - The type of release to bump the version to.
 * @returns {Command} A new Command instance configured to perform the version bump.
 */
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

  _updateDENOJSON(versionConfig);
  _updatePACKAGEJSON(versionConfig);
  _updateJSRJSON(versionConfig);

  _commitAndTag(newVersion);

  console.log(`${oldVersion} -> ${newVersion}`);
}

async function _updateDENOJSON(versionConfig: VersionConfig): Promise<void> {
  if (versionConfig.deno && (await exists("deno.json"))) {
    const config: any = await readJsonFile("deno.json");
    if (config) {
      config.version = versionConfig.version;
      await writeJsonFile("deno.json", config);
    }
  }
}

async function _updatePACKAGEJSON(versionConfig: VersionConfig): Promise<void> {
  if (versionConfig.deno && (await exists("package.json"))) {
    const config: any = await readJsonFile("package.json");
    if (config) {
      config.version = versionConfig.version;
      await writeJsonFile("package.json", config);
    }
  }
}

async function _updateJSRJSON(versionConfig: VersionConfig): Promise<void> {
  if (versionConfig.deno && (await exists("jsr.json"))) {
    const config: any = await readJsonFile("jsr.json");
    if (config) {
      config.version = versionConfig.version;
      await writeJsonFile("jsr.json", config);
    }
  }
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

async function _commitAndTag(normalizedVersion: string) {
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
