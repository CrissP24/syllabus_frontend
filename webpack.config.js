module.exports = {
  // ... existing configuration ...
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!<package-name>)/, // Include the linked package
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      // ... other rules ...
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  // ... existing configuration ...
}; 