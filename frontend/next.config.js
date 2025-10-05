const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  webpack: (config, { isServer }) => {
    // Add bundle analyzer in production mode
    if (process.env.ANALYZE === "true") {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }

    // Optimize chunks and code splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 10,
              chunks: "all",
            },
            common: {
              name: "common",
              minChunks: 2,
              priority: 5,
              chunks: "all",
              reuseExistingChunk: true,
            },
            screens: {
              test: /[\\/]src[\\/]screens[\\/]/,
              name: "screens",
              priority: 7,
              chunks: "all",
            },
            components: {
              test: /[\\/]src[\\/]components[\\/]/,
              name: "components",
              priority: 6,
              chunks: "all",
            },
          },
        },
      };
    }

    return config;
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["react-icons"],
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};
