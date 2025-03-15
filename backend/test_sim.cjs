// const { callSimulate } = require("./simulatorRustModel/sbtc_loan__rust_simulator_linux.node");
const { callSimulate } = require("./simulatorRustModel/sbtc_loan__rust_simulator_mac.node");

const result = callSimulate(1.0, 50000.0, 0.01, 0.05, 12);
console.log(result);
