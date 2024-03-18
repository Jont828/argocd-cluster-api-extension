const path = require('path');

const extName = "Cluster-API";

module.exports = {
  entry: './src/index.js',
  externals: {
    react: "React",
    moment: "Moment",
  },
  output: {
    filename: 'extensions.js',
    path: __dirname + `/dist/resources/${extName}/ui`,
    libraryTarget: 'window',
    library: ['extensions', 'resources'],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'raw-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'raw-loader'],
      },
    ],
  },
};
