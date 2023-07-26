import IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin"
import CopyPlugin from "copy-webpack-plugin"
import path from "node:path"

export const plugins = [
  new IForkTsCheckerWebpackPlugin({
    logger: "webpack-infrastructure",
  }),
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, "./assets"),
        to: "assets"
      },
    ],
  }),
]
