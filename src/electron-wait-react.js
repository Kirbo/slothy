const net = require('net');
const port = process.env.PORT ? (process.env.PORT - 100) : 3000;

process.env.ELECTRON_START_URL = `http://localhost:${port}`;

const client = new net.Socket();

let startedElectron = false;
const tryConnection = () => client.connect({ port: port }, () => {
  client.end();
  if (!startedElectron) {
    console.log('starting electron');
    startedElectron = true;
    const spawn = require('child_process').spawn;
    let child;
    const { platform } = process;
    if (platform === 'win32') {
      child = spawn('yarn.cmd', ['electron-start']);
    } else {
      child = spawn('yarn', ['electron-start']);
    }

    child.stdout.on('data', data => { process.stdout.write(data.toString()); });
    child.stderr.on('data', data => { process.stdout.write(data.toString()); });

    child.on('close', code => {
      console.log(`Finished with code: ${code}`);
    });
  }
}
);

tryConnection();

client.on('error', (error) => {
  setTimeout(tryConnection, 1000);
});
