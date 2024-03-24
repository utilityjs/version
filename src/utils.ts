import UserError from "./UserError.ts";



/*
 * Check if file or directory existing in given path.
 */
export async function exists(filePath: string): Promise<boolean> {
    try {
        await Deno.stat(filePath);
        // successful, file or directory must exist
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            // file or directory does not exist
            return false;
        } else {
            // unexpected error, maybe permissions, pass it along
            throw error;
        }
    }
}


async function _readTextFile(filePath: string): Promise<string> {
    return await Deno.readTextFile(filePath);
}

export async function readJsonFile(filePath: string): Promise<any> {
    return JSON.parse(await _readTextFile(filePath));
}

async function _writeTextFile(filePath: string, content: string): Promise<void> {
    await Deno.writeTextFile(filePath, content);
}


export async function writeJsonFile(filePath: string, object: any): Promise<void> {
    return _writeTextFile(filePath, JSON.stringify(object, null, 2));
}


/*
async function writeVersion(versionInput: string): Promise<void> {
  const normalizedVersion = clean(versionInput);

  if (!normalizedVersion) {
    throw new UserError(`${versionInput} is not a valid version string`);
  }

  await checkPrerequisites();

  await Deno.writeTextFile(fileName, normalizedVersion);
  await commitAndTag(normalizedVersion, fileName);
  console.log(normalizedVersion);
}
 */