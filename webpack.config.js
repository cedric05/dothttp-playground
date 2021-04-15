const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
var HtmlWebpackSkipAssetsPlugin = require('html-webpack-skip-assets-plugin').HtmlWebpackSkipAssetsPlugin;


const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
	mode: 'development',
	entry: {
		app: './src/index.tsx',
		'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
		'dothttp.worker': "./src/worker/worker.ts"
	},
	devServer: {
		hot: true
	},
	resolve: {
		extensions: ['*', '.js', '.jsx', '.tsx', '.ts']
	},
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'docs')
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx|tsx|ts)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: require.resolve('babel-loader'),
						options: {
							presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
							plugins: []
						}
					}
				]
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.ttf$/,
				use: ['file-loader']
			}
		]
	},
	devtool: "source-map",
	plugins: [
		new HtmlWebPackPlugin({
			template: 'src/index.html',
		}),
		new HtmlWebpackSkipAssetsPlugin({
			skipAssets: [/dothttp.worker.*.js/]
		}),
		isDevelopment && new ReactRefreshWebpackPlugin()
	].filter(Boolean)
};
