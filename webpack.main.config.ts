import type { Configuration } from "webpack"
import { rules } from "./webpack.rules"
import CopyPlugin from "copy-webpack-plugin"
import path from "node:path"

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it"s the first file
   * that runs in the main process.
   */
  entry: "./src/index.ts",
  // Put your normal webpack config below here
  module: {
    rules
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./public"),
          to: "public"
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src')
    },
    extensions: [".js", ".ts"],
  },
}
