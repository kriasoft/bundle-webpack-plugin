/**
 * @copyright 2021-present Kriasoft (https://git.io/JtoKE)
 *
 * @typedef {import("webpack").Compiler} Compiler
 * @typedef {import("webpack").compilation.Compilation} Compilation
 * @typedef {import("webpack").Configuration} Configuration
 * @typedef {import("webpack").javascript.JavascriptParser} JavascriptParser
 */

const path = require("path");
const webpack = require("webpack");

/**
 * Creates an additional application bundle for the selected execution
 * environment (Webpack `target`).
 */
class BundleWebpackPlugin {
  /**
   * Creates a new instance of the plugin.
   *
   * @param {Configuration} config Webpack configuration to use for the bundle.
   * @param {string} [config.entry] The entry object (file path).
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * @param {Compiler} compiler
   */
  apply(compiler) {
    this.name = this.constructor.name;
    this.compiler = compiler;

    compiler.hooks.make.tapAsync(this.name, this.handleMake.bind(this));
    compiler.hooks.compilation.tap(
      this.name,
      (compilation, { normalModuleFactory }) => {
        normalModuleFactory.hooks.parser
          .for("javascript/auto")
          .tap(this.name, this.handleParser.bind(this));
      }
    );
  }

  /**
   * @param {Compilation} compilation
   */
  handleMake(compilation, cb) {
    const name = this.config.name;
    const srcPath = path.resolve(this.config.entry);
    compilation.fileDependencies.add(srcPath);

    const baseOptions = webpack.config.getNormalizedWebpackOptions(this.config);
    webpack.config.applyWebpackOptionsDefaults(baseOptions);

    /** @type {Compiler} */
    const childCompiler = compilation.createChildCompiler(
      name,
      webpack.util.cleverMerge(
        {
          path: this.compiler.options.output.path,
          filename: `${name}.js`,
          environment: baseOptions.output.environment,
          iife: false,
        },
        this.config.output
      )
    );

    childCompiler.name = name;
    childCompiler.context = this.compiler.context;
    childCompiler.inputFileSystem = this.compiler.inputFileSystem;
    childCompiler.outputFileSystem = this.compiler.outputFileSystem;
    childCompiler.options.mode = this.compiler.options.mode;
    childCompiler.options.externalsPresets = baseOptions.externalsPresets;
    delete childCompiler.options.devServer;

    // Apply the known Webpack options to the child compiler configuration.
    [
      "bail",
      "target",
      "devtool",
      "experiments",
      "externalPresets",
      "mode",
      "module",
      "name",
      "node",
      "optimization",
      "parallelism",
      "performance",
      "profile",
      "recordsInputPath",
      "recordsOutputPath",
      "target",
      "watch",
      "stats",
    ]
      .filter((key) => this.config[key] !== undefined)
      .forEach((key) => {
        childCompiler.options[key] = webpack.util.cleverMerge(
          childCompiler.options[key],
          this.config[key]
        );
      });

    new webpack.EntryPlugin(this.compiler.context, srcPath, name).apply(
      childCompiler
    );

    childCompiler.runAsChild((error, entries, childCompilation) => {
      if (error) {
        cb(error);
      } else {
        compilation.warnings = [
          ...compilation.warnings,
          ...childCompilation.warnings,
        ];
        compilation.errors = [
          ...compilation.errors,
          ...childCompilation.errors,
        ];
        for (const [key, value] of childCompilation.entrypoints) {
          if (!compilation.entrypoints.has(key)) {
            compilation.entrypoints.set(key, value);
          }
        }
        cb();
      }
    });
  }

  /**
   * @param {JavascriptParser} parser
   */
  handleParser(parser, parserOptions) {
    if (parserOptions.import !== undefined && !parserOptions.import) {
      return;
    }

    // Exclude dynamically imported dependencies.
    parser.hooks.importCall.tap(this.name, () => {
      if (parser.state.compilation.name === this.config.name) {
        return false;
      }
    });
  }
}

module.exports = { BundleWebpackPlugin };
