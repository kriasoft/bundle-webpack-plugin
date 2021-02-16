export type Compiler = webpack.Compiler;
export type Compilation = webpack.compilation.Compilation;
export type Configuration = webpack.Configuration;
export type JavascriptParser = any;
/**
 * Creates an additional application bundle for the selected execution
 * environment (Webpack `target`).
 */
export class BundleWebpackPlugin {
    /**
     * Creates a new instance of the plugin.
     *
     * @param {Configuration} config Webpack configuration to use for the bundle.
     * @param {string} [config.entry] The entry object (file path).
     */
    constructor(config?: Configuration);
    config: webpack.Configuration;
    /**
     * @param {Compiler} compiler
     */
    apply(compiler: Compiler): void;
    name: string;
    compiler: webpack.Compiler;
    /**
     * @param {Compilation} compilation
     */
    handleMake(compilation: Compilation, cb: any): void;
    /**
     * @param {JavascriptParser} parser
     */
    handleParser(parser: any, parserOptions: any): void;
}
import webpack = require("webpack");
