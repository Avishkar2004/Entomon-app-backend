const cluster = require("cluster");
const os = require("os");

const startCluster = (startFunction) => {
  if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);
    const numsCPUs = os.cpus().length;
    for (let i = 0; i < numsCPUs; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker process ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } else {
    startFunction();
  }
};
module.exports = startCluster;
