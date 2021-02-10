/**
 * @copyright 2021-present Kriasoft (https://git.io/JtoKE)
 *
 * @typedef {import("webpack").Compiler} Compiler
 * @typedef {import("webpack").Compilation} Compilation
 * @typedef {import("webpack").Configuration} Configuration
 * @typedef {import("webpack").javascript.JavascriptParser} JavascriptParser
 */

const path = require("path");
const { EntryPlugin } = require("webpack");

/**
 * Creates an additional application bundle for the selected execution
 * environment (Webpack `target`).
 */
class BundleWebpackPlugin {
  /**
   * Creates a new instance of the plugin.
   *
   * @param {Object} config Webpack configuration to use for the bundle.
   * @param {string} [config.name] The name of the bundle.
   * @param {string} [config.entry] The entry object (file path).
   * @param {Configuration["target"]} [config.target] The target execution environment.
   * @param {Configuration["output"]} [config.output] The bundle output options.
   * @param {Configuration["devtool"]} [config.devtool]
   * @param {Configuration["stats"]} [config.stats]
   * @param {Configuration["optimization"]} [config.optimization]
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

    const childCompiler = compilation.createChildCompiler(name, {
      ...this.config.output,
      // The output directory as an absolute path.
      path:
        (this.config.output && this.config.output.path) ||
        this.compiler.options.output.path,
      // The filename of the output bundle.
      filename:
        (this.config.output && this.config.output.filename) || `${name}.js`,
    });

    childCompiler.context = this.compiler.context;
    childCompiler.inputFileSystem = this.compiler.inputFileSystem;
    childCompiler.outputFileSystem = this.compiler.outputFileSystem;

    if (this.config.target !== undefined) {
      childCompiler.options.target = this.config.target;
    }

    if (this.config.devtool !== undefined) {
      childCompiler.options.devtool = this.config.devtool;
    }

    if (this.config.stats !== undefined) {
      childCompiler.options.stats = this.config.stats;
    }

    if (this.config.optimization !== undefined) {
      childCompiler.options.optimization = {
        ...childCompiler.optimization,
        ...this.config.optimization,
        splitChunks: {
          ...(childCompiler.optimization &&
            childCompiler.optimization.splitChunks),
          ...(this.config.optimization && this.config.optimization.splitChunks),
        },
      };
    }

    new EntryPlugin(this.compiler.context, srcPath, name).apply(childCompiler);

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
