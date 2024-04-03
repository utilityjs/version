import {
  afterAll,
  assert,
  beforeAll,
  describe,
  it,
  path,
} from "../test_deps.ts";

import { GITUtility } from "@utility/git";

const TMP_RESOURCES_PATH = path.normalize(
  import.meta.dirname + "/resources/.temp",
);

describe("version", function () {
  let runCommandTestRepo: GITUtility;

  beforeAll(async () => {
    await Deno.mkdir(TMP_RESOURCES_PATH, { recursive: true });
    await Deno.mkdir(path.normalize(TMP_RESOURCES_PATH + "/test_version"), {
      recursive: true,
    });
    runCommandTestRepo = new GITUtility(
      path.normalize(TMP_RESOURCES_PATH + "/test_version"),
    );
    await runCommandTestRepo.runCommand("init");
  });

  afterAll(async () => {
    await Deno.remove(TMP_RESOURCES_PATH, { recursive: true });
  });

  it("version installation test", async () => {
    const output = await _installVersionTestCommand();
    assert(output == "");
  });
});

//@ts-ignore
async function _runVersionTestCommand(args: string[], cwd: string) {
  const command = new Deno.Command("version", {
    args: args,
    cwd: cwd,
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();

  if (code !== 0) {
    throw new Error(
      `Failed to run \`version-test ${
        args.join(
          " ",
        )
      }\`: ${new TextDecoder().decode(stderr)}`,
    );
  }

  return new TextDecoder().decode(stdout);
}

async function _installVersionTestCommand() {
  const command = new Deno.Command("deno", {
    args: [
      "install",
      "-g",
      "-f",
      "--importmap",
      "../../../../deno.json",
      "-A",
      "-n",
      "version-test",
      "../../../../mod.ts",
    ],
    cwd: path.normalize(TMP_RESOURCES_PATH + "/test_version"),
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();

  if (code !== 0) {
    throw new Error(
      `Failed to run \`deno install\`: ${new TextDecoder().decode(stderr)}`,
    );
  }

  return new TextDecoder().decode(stdout);
}
