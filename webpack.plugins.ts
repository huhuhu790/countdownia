import IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin"

export const plugins = [
  new IForkTsCheckerWebpackPlugin({
    logger: "webpack-infrastructure",
  })
]
