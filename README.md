# Version

A simple semantic versioning tool.

- Creates and manages a file called `version.json` (storing the current version)
- Also updates version on `deno.json` or `package.json` or `jsr.json` if available on project root.
- Shells out to `git` to create commits and tags for version bumps

## Installation

```
$  deno install -g -f -n version -r -A jsr:@utility/version
```

Note: If you don't use `-A`, `--allow-read` and `--allow-write` are needed for
managing the `VERSION` file and `--allow-run` for Git actions.

## Usage

```
# Create a `version.json` file (defaults to 1.0.0 if not specified)
$ version init
$ version init 0.1.0

# Increment a version
$ version pre
$ version patch
$ version minor
$ version major
$ version prepatch
$ version preminor
$ version premajor

# Print out the current version if it exists
$ version get
```

If you prefer not to install the CLI locally, just substitute `$ version
[whatever]` with:

```
$ deno run -A https://deno.land/x/version/index.ts [whatever]
```

## License

MIT
