module.exports = new Proxy(
  {},
  {
    get: () => ({
      // Simple mock component
      __esModule: true,
      default: () => null,
    }),
  }
);
