import type { Configuration } from "webpack"

import { rules } from "./webpack.rules"
import { plugins } from "./webpack.plugins"

rules.push({
  test: /\.(c|sa|sc)ss$/i,
  use: [
    { loader: "style-loader" },
    {
      loader: "css-loader",
      options: {
        modules: {
          auto: true
        }
      }
    },
    {
      loader: "postcss-loader"
    },
    {
      loader: "sass-loader"
    }
  ],
})

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".css",
      ".json",
      ".scss",
      ".sass",
    ],
  },
}
