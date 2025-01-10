const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const {
	entryLoader,
	extensions,
	getJavascriptLoaders,
	getMiniCssExtractPlugin,
	getStyleLoaders,
	outdir
} = require("./common.cjs");

const isDevelopment = process.env.NODE_ENV !== "production";

const entries = entryLoader("client");

/** @type { import('webpack').Configuration } */
const config = {
	name: "client",
	mode: isDevelopment ? "development" : "production",
	target: "browserslist",
	entry: entries,
	output: {
		path: outdir,
		filename: "static/js/[name]/main.[chunkhash].js"
	},
	devtool: isDevelopment ? "eval-source-map" : false,
	resolve: {
		extensions: extensions,
		alias: {
			react: "preact/compat",
			"react-dom/test-utils": "preact/test-utils",
			"react-dom": "preact/compat", // Must be below test-utils
			"react/jsx-runtime": "preact/jsx-runtime"
		}
	},
	module: {
		rules: [...getStyleLoaders(), getJavascriptLoaders()]
	},
	...(isDevelopment
		? {}
		: {
				optimization: {
					nodeEnv: isDevelopment ? "development" : "production",
					runtimeChunk: false,
					minimize: true,
					usedExports: true,
					minimizer: [
						new TerserPlugin({
							terserOptions: {
								compress: {
									// drop_console: true,
									// drop_debugger: true,
									// dead_code: true
								}
							}
						})
					]
				}
		  }),
	plugins: [
		getMiniCssExtractPlugin(true),
		new WebpackManifestPlugin({
			fileName: "static-manifest.json",
			publicPath: "/",
			generate: (seed, files, entrypoints) => {
				const manifest = {};
				for (let index = 0; index < files.length; index++) {
					const item = files[index];
					const ext = path.extname(item.name);
					const route = item.name.replace(ext, "");
					const normalizeRoute = `/${route}`;
					const asset = ext.replace(".", "");
					if (!manifest[normalizeRoute]) {
						manifest[normalizeRoute] = {
							js: []
						};
					}
					if (ext === ".js") {
						manifest[normalizeRoute][asset].push(item.path);
					}
				}
				return manifest;
			}
		})
	]
};
module.exports = config;
