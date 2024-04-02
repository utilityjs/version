# Version

A simple semantic versioning tool.

- Creates and manages a file called `version.json` (storing the current version)
- Also updates version on `deno.json` or `package.json` or `jsr.json` if available on project root.
- Shells out to `git` to create commits and tags for version bumps

## Installation

```shell
$  deno install -g -f -n version -r -A jsr:@utility/version
```

Note: If you don't use `-A`, `--allow-read` and `--allow-write` are needed for
managing the `VERSION` file and `--allow-run` for Git actions.

## Usage

### Create a `version.json` file (defaults to 0.1.0 if not specified)
```
$ version init
$ version init 0.5.0
```
### Increment a version
```
$ version
? Pick release type
> pre
  patch
  minor
  major
  prepatch
  preminor
  premajor

or

$ version <release>
```

### Print out the current version if it exists
```
$ version get
```


If you prefer not to install the CLI locally, just substitute `$ version
[whatever]` with:

```shell
$ deno run -A jsr:@utility/version [whatever]
```

## Code commit convention
https://www.conventionalcommits.org/


## License
MIT

------

Special mention to [@dylanpyle/version](https://github.com/dylanpyle/version). This tool is based out of it and with improvements.
