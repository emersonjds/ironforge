const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ponytail: watchman daemon (LaunchAgent) has no TCC access to ~/Documents,
// so it fails with EPERM on this project. Node crawler is fine at this size.
// Remove once watchman gets Full Disk Access in System Settings.
config.resolver.useWatchman = false;

module.exports = withNativeWind(config, { input: "./global.css" });
