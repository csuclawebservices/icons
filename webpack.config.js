const path = require('path');

module.exports = {
	entry: './src/index.js',
	mode: 'none',
	module: {
		rules: [
			{
				test: /\.(js)$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			}
		]
	},
	resolve: {
		extensions: ['*', '.js']
	},
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'build')
	}
};