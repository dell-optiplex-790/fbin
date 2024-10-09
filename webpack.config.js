const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production', // Set the mode to production for minification
  target: 'node', // Specify the Node.js platform
  entry: './index.js', // Your entry point
  output: {
    filename: 'fbin.js', // Output file name
    path: path.resolve(__dirname, 'build'), // Output directory
    libraryTarget: 'commonjs2', // Support Node.js module format
  },
  optimization: {
    minimize: true, // Enable minimization
    minimizer: [new TerserPlugin()], // Use Terser for minification
  },
  resolve: {
    extensions: ['.js'], // Resolve .js files
  },
  module: {
    rules: [
      // You can add loaders here if needed in the future
    ],
  },
};
