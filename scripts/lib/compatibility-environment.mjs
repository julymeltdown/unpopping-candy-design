import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const inheritedNames = [
  "COREPACK_HOME",
  "LANG",
  "LC_ALL",
  "PATH",
  "PNPM_HOME",
  "SOURCE_DATE_EPOCH",
  "SYSTEMROOT",
  "TMPDIR",
  "TEMP",
  "TMP",
];

export function createCompatibilityEnvironment(
  source = process.env,
  homeRoot = tmpdir(),
  cacheRoot = homeRoot,
) {
  const environment = Object.fromEntries(
    inheritedNames
      .filter((name) => typeof source?.[name] === "string")
      .map((name) => [name, source[name]]),
  );
  const isolatedHome = resolve(homeRoot);
  const sharedCache = resolve(cacheRoot);
  return {
    ...environment,
    CI: "1",
    COREPACK_ENABLE_DOWNLOAD_PROMPT: "0",
    COREPACK_HOME: join(sharedCache, "corepack"),
    HOME: isolatedHome,
    NPM_CONFIG_CACHE: join(sharedCache, "npm"),
    NPM_CONFIG_GLOBALCONFIG: join(isolatedHome, ".npm-globalrc"),
    NPM_CONFIG_USERCONFIG: join(isolatedHome, ".npmrc"),
    USERPROFILE: isolatedHome,
    XDG_CACHE_HOME: join(sharedCache, "xdg-cache"),
    XDG_CONFIG_HOME: join(isolatedHome, ".config"),
    XDG_DATA_HOME: join(sharedCache, "xdg-data"),
    XDG_STATE_HOME: join(isolatedHome, ".local/state"),
  };
}
