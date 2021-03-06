const fetch = require("node-fetch");
const { addFairPrice, getLastRequestAPI, getLastRequest } = require("../controllers/fairprice-controller");
const { calculateMean, NumToBN } = require("../utils/maths");
const { setFairPrice } = require('../web3/oracleopen');

const fetchFairPriceAPI = async (req, res) => {
    try {
        let amount = req.query.amount;
        let market = req.query.market;
        let response = await calculateFairPrice(market, amount);
        return res.status(200).send(response);
    } catch (err) {
        return res.status(500).send(err);
    }
}
const seedTokenPriceToDB = async (req, res) => {
    try {
        const {requestId, market, fairPrice, amount, transactionHash } = req.body;
        await addFairPrice(req, res, {
            requestId,
            market, 
            fairPrice,
            amount,
            transactionHash
        })
    } catch (err) {
        console.log(err)
        return res.status(500).send(err.message);
    }
}

const getTokenPrice = async (req, res) => {
    await getLastRequestAPI(req, res)
}

const seedTokenPriceToContract = async (req, res) => {
    try {
        const { marketAddress, market, amount, baseToken, decimal } = req.query;
        let fairPrice = await calculateFairPrice(marketAddress, amount, baseToken);
        let fairPriceToSend = NumToBN(fairPrice, Number(decimal));
        let lastRequestId = await getLastRequest(market);
        console.log("Last requestId in the db: ", lastRequestId)
        let requestId = lastRequestId + 1;
        const tx = await setFairPrice(requestId, fairPriceToSend, market, amount);
        console.log("Fair Price set: RequestId: ", requestId, "Transaction Hash: ", tx, "FairPrice: ", fairPrice, "Market: ", market, "Amount", amount);
        await addFairPrice(req, res, {
            requestId: requestId,
            market,
            fairPrice: fairPriceToSend,
            amount,
            transactionHash: tx
        })
    } catch (err) {
        console.error(err)
        return res.status(500).send(err.message);
    }
}

//http://localhost:3000/pairs?token1=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c&token2=0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56
const fetchPairs = async (req, res) => {
    try {
        let data = await getFairPriceData(req.query.token1, req.query.token2);
        return res.status(200).send(data);
    } catch (err) {
        return res.status(500).send(err);
    }
}

//http://localhost:3000/priceDepth?symbol=ETHBUSD&limit=5
const fetchOrderBookDepth = async (req, res) => {
    try {
        let response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${req.query.symbol}&limit=${req.query.limit}`)
        let data = await response.json();
        let askMean = calculateMean(data["asks"]);
        let bidMean = calculateMean(data["bids"]);
        data = {
            askMeanPrice: askMean["priceMean"],
            askMeanQuantity: askMean["quantityMean"],
            bidsMeanPrice: bidMean["priceMean"],
            bidsMeanQuantity: bidMean["quantityMean"]
        }
        return res.status(200).send(data);
    } catch (err) {
        return res.status(500).send(err);
    }
}

const calculateFairPrice = async (market, amount, baseToken = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56") => {
    try {
        let fairPriceData = await getFairPriceData(market, baseToken);
        let delta = fairPriceData["quote_volume"] - Number(amount);
        let tradePrice = fairPriceData["k_value"] / (delta * fairPriceData["y"]);

        // Add pancake swap txn price (0.25%)
        let fairPrice = tradePrice + (tradePrice * 0.25 / 100);
        return fairPrice;
    } catch (err) {
        throw err
    }
}

const getFairPriceData = async (token1, token2) => {
    try {
        let response = await fetch(`https://api.pancakeswap.info/api/v2/pairs`)
        let data = await response.json();
        data = data.data[`${token1}_${token2}`];

        // For calculation refer: https://research.paradigm.xyz/amm-price-impact
        let x = (Number(data["price"]) * Number(data["quote_volume"]));
        let y = (Number(data["base_volume"]) * 1)
        data["k_value"] = x * y; // 1 because of USDT
        data["x"] = x;
        data["y"] = y;
        return data;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    fetchFairPriceAPI,
    calculateFairPrice,
    seedTokenPriceToDB,
    fetchPairs,
    fetchOrderBookDepth,
    getTokenPrice,
    seedTokenPriceToContract
}