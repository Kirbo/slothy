const { override, fixBabelImports, addLessLoader } = require('customize-cra');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const { COLOR } = require('./src/assets/css/colors');

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { '@primary-color': COLOR['red'] },
  }),
  process.env.NODE_ENV === 'production'
    ? (config, env) => {
      if (!config.plugins) {
        config.plugins = [];
      }

      config.plugins.push(
        new CopyWebpackPlugin([
          { from: 'src/assets/icons', to: 'icons' },
          { from: 'src/assets/logo-text', to: 'logo-text' },
        ])
      );

      return config;
    }
    : config => config,
);
