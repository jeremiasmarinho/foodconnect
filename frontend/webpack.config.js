const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Força resolver único do React
  config.resolve.alias = {
    ...config.resolve.alias,
    react: require.resolve("react"),
    "react-dom": require.resolve("react-dom"),
  };

  // Evita múltiplas instâncias do React
  config.externals = {
    ...config.externals,
    react: "React",
    "react-dom": "ReactDOM",
  };

  return config;
};
