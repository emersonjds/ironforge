// ponytail: the API 35 emulator image reports no physical keys, so `adb shell monkey`
// exits 251 and kills `expo start --android`. Expo Go's launch path hardcodes the
// monkey call (legacy workaround for expo/expo#7772), so we append --pct-syskeys 0.
// Drop this script when @expo/cli stops using monkey or the emulator image is fixed.
import { readFileSync, writeFileSync } from "node:fs";

const file = "node_modules/@expo/cli/build/src/start/platforms/android/adb.js";
const from = "'shell', 'monkey', '-p'";
const to = "'shell', 'monkey', '--pct-syskeys', '0', '-p'";

let src;
try {
  src = readFileSync(file, "utf8");
} catch {
  process.exit(0); // deps not installed yet
}

if (src.includes(to)) process.exit(0);
if (!src.includes(from)) {
  console.warn(`[patch-expo-monkey] pattern not found in ${file} — skipping`);
  process.exit(0);
}

writeFileSync(file, src.replace(from, to));
console.log("[patch-expo-monkey] applied --pct-syskeys 0");
