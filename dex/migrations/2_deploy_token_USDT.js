const USDT = artifacts.require("USDT.sol");

module.exports = async function (deployer) {
  await deployer.deploy(USDT);
};
