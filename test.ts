import { format, increment, parse, ReleaseType } from "@std/semver";

console.log(format(increment(parse("1.0.0"), <ReleaseType>"major", "pre")));
