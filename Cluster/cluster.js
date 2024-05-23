// Importing required modules
const cluster = require("cluster"); // Module for managing multiple processes
const os = require("os"); // Module providing operating system-related utility methods and properties

// Function to start a cluster of processes
const startCluster = (startFunction) => {
  // Check if the current process is the master process
  if (cluster.isMaster) {
    // If it's the master process, log its PID (process identifier)
    console.log(`Master process ${process.pid} is running`);

    // Get the number of CPUs available on the current system
    const numsCPUs = os.cpus().length;

    // Fork a new process for each CPU
    for (let i = 0; i < numsCPUs; i++) {
      cluster.fork(); // Create a new worker process
    }

    // Event listener for when a worker process exits
    cluster.on("exit", (worker, code, signal) => {
      // Log information about the exited worker process
      console.log(
        `Worker process ${worker.process.pid} died. Restarting...Starting ${worker.process.pid}`
      );

      // Fork a new process to replace the exited one
      cluster.fork();
    });
  } else {
    // If it's not the master process, call the provided start function
    startFunction();
  }
};

// Export the startCluster function to make it available for use in other modules
module.exports = startCluster;
