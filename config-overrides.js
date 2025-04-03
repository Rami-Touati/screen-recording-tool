const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  // Add the node polyfills
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "fs": false,
    "path": require.resolve("path-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "os": false,
    "process": require.resolve("process/browser")
  };

  // Add externals for electron
  config.externals = {
    ...config.externals,
    electron: 'require("electron")',
    'electron-is-dev': 'require("electron-is-dev")',
  };

  // Add plugins
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  ];

  // Configure module resolution
  config.resolve.extensions = [...config.resolve.extensions, '.ts', '.tsx'];
  
  // Set the output directory and public path
  config.output = {
    ...config.output,
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].chunk.js'
  };

  // Development specific settings
  if (env === 'development') {
    config.devServer = {
      port: 3001,
      host: 'localhost',
      hot: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      static: {
        directory: path.join(__dirname, 'public'),
        publicPath: '/'
      }
    };
  }

  return config;
}; 