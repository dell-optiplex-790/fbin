const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production', // Set the mode to production for minification
  target: 'node', // Specify the Node.js platform
  entry: './index.js', // Your entry point
  output: {
    filename: 'fbin.js', // Output file name
    path: path.resolve(__dirname, 'tmp'), // Output directory
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
      {
        test: path.resolve(__dirname, 'build/fbin.js'), // Specify the exact file to ignore
        use: 'ignore-loader', // Use ignore-loader for that file
      },
    ],
  },
};
