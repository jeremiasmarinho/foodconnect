const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Configurações para resolver conflitos React
config.resolver.alias = {
  react: require.resolve("react"),
  "react-dom": require.resolve("react-dom"),
};

// Evitar duplicatas de React
config.resolver.platforms = ["web", "native", "ios", "android"];

// Configuração web específica
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = config;
