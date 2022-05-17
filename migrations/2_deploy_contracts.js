const Token = artifacts.require("./Token.sol");
require('dotenv').config();

module.exports = function(deployer) {
    deployer.deploy(Token,  process.env.TOKEN_NAME, process.env.TOKEN_SYMBOL, process.env.TOTAL_SUPPLY);
};