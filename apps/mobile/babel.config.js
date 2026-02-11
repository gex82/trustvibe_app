module.exports = function (api) {
  api.cache(true);

  // Force preset resolution from apps/mobile so expo/config resolves from this workspace.
  const expoPreset = require.resolve('babel-preset-expo', { paths: [__dirname] });

  return {
    presets: [expoPreset],
  };
};
