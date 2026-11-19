/**
 * Starts the ad-hawk-local MCP server. The server itself is a release
 * archive pinned by runtime.json (version, url, sha256) next to this file.
 * On first start the archive is downloaded, checked against the pinned
 * sha256, unpacked into ~/.ad-hawk/runtime/<version>/ and reused afterwards.
 * stdout is the MCP channel, so everything this file prints goes to stderr.
 */
import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DONE = ".installed";
const DOWNLOAD_TIMEOUT_MS = 120_000;

const log = (message) => process.stderr.write(`ad-hawk: ${message}\n`);

export function readPin(file) {
  const pin = JSON.parse(readFileSync(file, "utf8"));
  if (
    typeof pin.version !== "string" ||
    !/^\d[0-9A-Za-z.+-]*$/.test(pin.version) ||
    typeof pin.url !== "string" ||
    !pin.url.startsWith("https://") ||
    typeof pin.sha256 !== "string" ||
    !/^[0-9a-f]{64}$/.test(pin.sha256)
  ) {
    throw new Error(`${file} is not a valid runtime pin.`);
  }
  return pin;
}

async function download(url, fetchImpl) {
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Make sure the pinned runtime is unpacked under `root` and return its folder.
 * The archive is checked before anything is written to disk, and the folder
 * appears under its final name only once it is complete.
 */
export async function ensureRuntime(pin, { root = join(homedir(), ".ad-hawk", "runtime"), fetchImpl = fetch } = {}) {
  const target = join(root, pin.version);
  if (existsSync(join(target, DONE))) return target;

  log(`installing the local server ${pin.version} (first start only)...`);
  const archive = await download(pin.url, fetchImpl);
  const actual = createHash("sha256").update(archive).digest("hex");
  if (actual !== pin.sha256) {
    throw new Error(`The downloaded server does not match its pinned checksum (got ${actual}). Nothing was installed.`);
  }

  mkdirSync(root, { recursive: true, mode: 0o700 });
  const work = join(root, `.tmp-${process.pid}-${randomBytes(6).toString("hex")}`);
  const unpacked = join(work, "runtime");
  try {
    mkdirSync(unpacked, { recursive: true });
    const file = join(work, "runtime.tar.gz");
    writeFileSync(file, archive);
    execFileSync("tar", ["-xzf", file, "-C", unpacked], { stdio: ["ignore", "ignore", "pipe"] });
    if (!existsSync(join(unpacked, "server.mjs"))) throw new Error("The server archive has no server.mjs.");
    writeFileSync(join(unpacked, DONE), `${pin.sha256}\n`);
    try {
      renameSync(unpacked, target);
    } catch (error) {
      // Another start finished the same install first: use that one.
      if (existsSync(join(target, DONE))) return target;
      if (!existsSync(target)) throw error;
      // An incomplete folder left by hand: replace it.
      rmSync(target, { recursive: true, force: true });
      renameSync(unpacked, target);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  log(`installed the local server ${pin.version}.`);
  return target;
}

async function main() {
  if (process.platform !== "darwin" || process.arch !== "arm64") {
    throw new Error("ad-hawk-local supports macOS on Apple silicon only for now.");
  }
  const pin = readPin(join(dirname(fileURLToPath(import.meta.url)), "runtime.json"));
  const dir = await ensureRuntime(pin);
  // The server reads its own arguments from process.argv, unchanged.
  await import(pathToFileURL(join(dir, "server.mjs")).href);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
