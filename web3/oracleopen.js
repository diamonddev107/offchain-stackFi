const { diamondAddress } = require('../constants/web3');
const OpenOracleContract = require('../blockchain/abis/OracleOpen.json');
const { sendTransaction, getWeb3, getValue } = require('./transaction');

const liquidationTrigger = (address, loanId) => {
    const web3 = getWeb3();
    let oracleOpenContract = new web3.eth.Contract(
        OpenOracleContract.abi,
        diamondAddress
    );
    return sendTransaction(diamondAddress, oracleOpenContract, "liquidationTrigger", address, loanId);
}

const seedFairPrice = (requestId, fairPrice, market, amount) => {
    const web3 = getWeb3();
    let oracleOpenContract = new web3.eth.Contract(
        OpenOracleContract.abi,
        diamondAddress
    );
    return sendTransaction(diamondAddress, oracleOpenContract, "seedFairPrice", requestId, fairPrice, market, amount);
}

const getFairPrice = (market) => {
    const web3 = getWeb3();
    let oracleOpenContract = new web3.eth.Contract(
        OpenOracleContract.abi,
        diamondAddress
    );
    return getValue(oracleOpenContract, "getFairPrice", market);
}

module.exports = {
    liquidationTrigger,
    seedFairPrice,
    getFairPrice
}