const { override, fixBabelImports, addLessLoader } = require('customize-cra');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const { COLOR } = require('./src/assets/css/colors');

module.exports = {
  webpack: (config, env) => (
    override(
      fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      }),
      addLessLoader({
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': COLOR.red,
        },
      }),
      process.env.NODE_ENV === 'production'
        ? () => {
          if (!config.plugins) {
            config.plugins = [];
          }

          config.plugins.push(
            new CopyWebpackPlugin([
              {
                from: 'src/assets/icons',
                to: 'icons',
              },
              {
                from: 'src/assets/logo-text',
                to: 'logo-text',
              },
            ]),
          );

          return config;
        }
        : config,
    )(config, env)
  ),
  jest: config => ({
    ...config,
    bail: false,
    notify: true,
    notifyMode: 'failure',
    verbose: !!process.env.verbose || false,
    silent: !!process.env.silent || false,
    collectCoverage: !!process.env.coverage || false,
    coverageReporters: [
      'text',
      'html',
      'json',
      'lcov',
      'text-summary',
    ],
    moduleNameMapper: {
    },
  }),
};
