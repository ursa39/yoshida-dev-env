module.exports = api => {
  api.cache(true);

  const presets = [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]];
  const plugins = ['@babel/plugin-proposal-optional-chaining', '@babel/plugin-proposal-nullish-coalescing-operator'];

  return { presets, plugins };
};
