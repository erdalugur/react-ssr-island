const path = require("path");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");

const {
	entryLoader,
	getJavascriptLoaders,
	getMiniCssExtractPlugin,
	getStyleLoaders,
	extensions,
	getManifest
} = require("./common.cjs");

const isDevelopment = process.env.NODE_ENV !== "production";

const entries = entryLoader("server");

/** @type { import('webpack').Configuration } */
const config = {
	name: "server",
	mode: isDevelopment ? "development" : "production",
	target: "node",

	entry: {
		...entries
	},
	optimization: {
		splitChunks: false // Split chunks özelliğini kapatır
	},
	output: {
		path: path.join(process.cwd(), "dist"),
		filename: "pages/[name].cjs",
		libraryTarget: "commonjs2"
	},
	resolve: {
		extensions: extensions,
		modules: ["node_modules"]
	},
	module: {
		rules: [...getStyleLoaders(), getJavascriptLoaders()]
	},
	plugins: [
		getMiniCssExtractPlugin(),
		new WebpackManifestPlugin({
			fileName: "pages-manifest.json",
			publicPath: "/",
			generate: (seed, files, entrypoints) => {
				const current = {};
				for (let index = 0; index < files.length; index++) {
					const item = files[index];
					const ext = path.extname(item.name);
					const route = `/${item.name.replace(ext, "")}`;
					if (!current[route]) {
						current[route] = {
							runtime: "",
							css: []
						};
					}
					if (ext === ".cjs") {
						current[route].runtime = item.path;
					}
					if (ext === ".css") {
						current[route].css.push(item.path);
					}
				}
				return current;
			}
		})
	],
	externals: [require("webpack-node-externals")()]
};
module.exports = config;
