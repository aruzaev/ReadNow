module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"], // Or '@babel/preset-env' if not using Expo
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env", // The alias for your environment variables
          path: ".env",
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
