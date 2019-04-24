const electron = require('electron');

const packageJson = require('../../package.json');

const crashReporter = () => {
  electron.crashReporter.start({
    companyName: packageJson.author,
    productName: packageJson.productName,
    submitURL: packageJson.product.CrashReportUrl,
    uploadToServer: true,
  })
}

module.exports = {
  crashReporter,
};
