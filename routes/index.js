const express = require('express');
const { addNewAccount, whiteListAddedAccount } = require('./account');
const router = express.Router();
const { fetchFairPriceAPI, seedTokenPriceToDB, getTokenPrice, fetchPairs, fetchOrderBookDepth, seedTokenPriceToContract } = require("./fairprice");
const { triggerLiquidation } = require("./oracleopen");
const { createWallet } = require("./wallet");

router.get('/', (req, res) => {
    res.status(200).send('Welcome to hashstack finance!');
});

router.get('/fairPrice', fetchFairPriceAPI);
router.get('/tokenPrice', seedTokenPriceToDB);
router.get('/seedTokenPrice', seedTokenPriceToContract);

router.get('/getTokenPrice', getTokenPrice)
router.get('/pairs', fetchPairs);

router.get('/createWallet', createWallet);
router.post('/addAccount', addNewAccount);
router.post('/whiteListAccount', whiteListAddedAccount)

router.post('/triggerLiquidation', triggerLiquidation);

router.get('/priceDepth', fetchOrderBookDepth)

module.exports = router;