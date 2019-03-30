const { override, fixBabelImports, addLessLoader } = require('customize-cra');

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
);
