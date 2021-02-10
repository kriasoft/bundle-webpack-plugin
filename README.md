# Bundle Webpack Plugin &middot; [![npm package][npm-v]][npm] [![npm package][npm-dm]][npm] [![Discord][discord-badge]][discord]

This [Webpack][webpack] plugin creates an additional application bundle for the
selected execution environment (Webpack `target`). This is often used for
scenarios such as server-side rendering / pre-rendering (SSR).

## Usage Example

#### `webpack.config.js`

```js
const { BundleWebpackPlugin } = require("bundle-webpack-plugin");

module.exports = {
  // The core application bundle for browsers.
  name: "app",
  entry: "./src/index",
  target: "browserslist:defaults",

  plugins: [
    new BundleWebpackPlugin({
      // Additional (reverse proxy) bundle for Cloudflare Workers.
      name: "proxy",
      entry: "./src/proxy",
      target: "browserslist:last 2 Chrome versions",
    }),
  ],
};
```

## Related Projects

- [Node.js API Starter](https://github.com/kriasoft/nodejs-api-starter) - Monorepo project template based on Yarn v2, GraphQL.js, React, and Relay.

## Copyright

Copyright © 2021-present Kriasoft. This source code is licensed under the MIT license found in the
[LICENSE](https://github.com/kriasoft/bundle-webpack-plugin/blob/main/LICENSE) file.

---

<sup>Made with ♥&nbsp; by Konstantin Tarkus ([@koistya](https://twitter.com/koistya), [blog](https://medium.com/@koistya))
and [contributors](https://github.com/kriasoft/bundle-webpack-plugin/graphs/contributors).</sup>

[npm]: https://www.npmjs.org/package/bundle-webpack-plugin
[npm-v]: https://img.shields.io/npm/v/bundle-webpack-plugin?style=flat-square
[npm-dm]: https://img.shields.io/npm/dm/bundle-webpack-plugin?style=flat-square
[webpack]: https://webpack.js.org/
[discord]: https://discord.gg/bSsv7XM
[discord-badge]: https://img.shields.io/static/v1?logo=discord&label=&message=Join+us+on+Discord!&color=033&style=flat-square
