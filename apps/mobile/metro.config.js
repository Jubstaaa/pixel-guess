/* eslint-disable @typescript-eslint/no-require-imports */
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro')

// No watchFolders or nodeModulesPaths here: expo/metro-config detects the Bun
// workspace and sets them itself (SDK 52+), and Expo's monorepo guide says
// hand-written values should be removed.
const config = getDefaultConfig(__dirname)

module.exports = withUniwindConfig(config, {
    cssEntryFile: './global.css',
})
