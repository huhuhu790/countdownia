import type { ForgeConfig } from "@electron-forge/shared-types"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { MakerZIP } from "@electron-forge/maker-zip"
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives"
import { WebpackPlugin } from "@electron-forge/plugin-webpack"

import { mainConfig } from "./webpack.main.config"
import { rendererConfig } from "./webpack.renderer.config"

const config: ForgeConfig = {
  packagerConfig: {
    icon: "public/favicon",
    asar: true
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: "public/favicon",
      iconUrl: "public/favicon"
    }),
    new MakerZIP({}, ["darwin"]),
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
            js: "./src/app/startup/main.tsx",
            name: "startup"
          },
        ],
      },
    }),
  ],
}

export default config
