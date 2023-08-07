import type { ForgeConfig } from "@electron-forge/shared-types"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { MakerZIP } from "@electron-forge/maker-zip"
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives"
import { WebpackPlugin } from "@electron-forge/plugin-webpack"

import { mainConfig } from "./webpack.main.config"
import { rendererConfig } from "./webpack.renderer.config"
import path from "node:path"

const icon = path.resolve(__dirname, "public", "favicon.ico")

const config: ForgeConfig = {
  packagerConfig: {
    icon: "./public/favicon",
    asar: true
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: icon,
      iconUrl: icon
    }),
    new MakerZIP(),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/index.html",
            js: "./src/app/countdown/main.tsx",
            name: "countdown",
            preload: {
              js: "./src/preload.ts",
            },
          },
          {
            html: "./src/index.html",
            js: "./src/app/config/main.tsx",
            name: "config",
            preload: {
              js: "./src/preload.ts",
            },
          },
          {
            html: "./src/index.html",
            js: "./src/app/loading/main.tsx",
            name: "loading"
          },
          {
            html: "./src/index.html",
            js: "./src/app/dialogs/main.tsx",
            name: "dialogs",
            preload: {
              js: "./src/preload.ts",
            },
          },
        ],
      },
    }),
  ],
}

export default config
