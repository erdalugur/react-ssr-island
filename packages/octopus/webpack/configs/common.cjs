const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const generateScopedName = (localName, resourcePath) => {
	const getHash = (value) => crypto.createHash("sha256").update(value).digest("hex");
	const hash = getHash(`${resourcePath}${localName}`).slice(0, 5);
	return `${localName}__${hash}`;
};

const isDevelopment = process.env.NODE_ENV !== "production";

const entryLoader = (platform = "server") => {
	const pagesDir = path.join(process.cwd(), "pages");
	const entries = {};

	try {
		// Dizindeki dosyaları oku
		const files = fs.readdirSync(pagesDir);
		// if (platform === "client") {
		// 	for (const file of files) {
		// 		if (!file.startsWith("_")) entries[`/${file.toLocaleLowerCase()}`] = file;
		// 	}
		// 	return entries;
		// }

		for (const file of files) {
			const fullPath = path.join(pagesDir, file);
			if (file.startsWith("_")) {
				const ext = path.extname(file);
				const name = file.replace(ext, "").toLowerCase();
				entries[name] = fullPath;
			} else {
				entries[file] = file.startsWith("_") ? fullPath : `${fullPath}/index.${platform}.tsx`;
			}
		}

		return entries;
	} catch (error) {
		console.error("Hata oluştu:", error);
		throw error;
	}
};

const styleLoader = MiniCssExtractPlugin.loader;

const postcssLoader = {
	loader: "postcss-loader",
	options: {
		postcssOptions: {
			plugins: [
				[
					"postcss-preset-env",
					{
						// Options
					}
				]
			]
		}
	}
};

const cssLoader = {
	loader: "css-loader",
	options: {
		modules: {
			auto: true,
			exportOnlyLocals: false,
			getLocalIdent: ({ resourcePath }, _, localName) => generateScopedName(localName, resourcePath)
		},
		esModule: false
	}
};

const styleLoaders = [
	{
		test: /\.module\.css$/,
		use: [styleLoader, cssLoader, postcssLoader]
	},
	{
		test: /\.module\.scss$/,
		use: [styleLoader, cssLoader, postcssLoader, "sass-loader"]
	},
	{
		test: /\.css$/,
		exclude: /\.module\.css$/,
		use: [styleLoader, cssLoader]
	},
	{
		test: /\.scss$/,
		exclude: /\.module\.scss$/,
		use: [styleLoader, cssLoader, postcssLoader, "sass-loader"]
	},
	{
		test: /\.json$/,
		use: ["manifest-loader"],
		type: "javascript/auto" // Webpack'in json dosyasını doğru şekilde alabilmesi için
	}
];
const getStyleLoaders = () => {
	return styleLoaders;
};

const getJavascriptLoaders = () => {
	return {
		test: /\.(js|ts|tsx)$/,
		exclude: /node_modules/,
		use: {
			loader: "babel-loader",
			options: {
				presets: [
					[
						"@babel/preset-env",
						{
							targets: "> 0.25%, not dead",
							useBuiltIns: "usage",
							corejs: false
						}
					],
					["@babel/preset-react", { runtime: "automatic" }],
					"@babel/preset-typescript"
				],
				plugins: ["@babel/plugin-transform-runtime"]
			}
		}
	};
};

const getMiniCssExtractPlugin = (client = false) => {
	return new MiniCssExtractPlugin({
		filename: client ? "static/client/[name]/[name].css" : "static/css/[name]/[name].css",
		chunkFilename: client ? "static/client/[name]/[name].css" : "static/css/[name]/[name].css"
	});
};

const extensions = [".tsx", ".ts", ".js", ".css"];

const getManifest = () => {
	try {
		return JSON.parse(fs.readFileSync(path.resolve("dist", "manifest.json"), { encoding: "utf-8" }) || "{}");
	} catch (error) {
		return {};
	}
};

module.exports = {
	entryLoader,
	getJavascriptLoaders,
	getStyleLoaders,
	getMiniCssExtractPlugin,
	extensions,
	getManifest
};
