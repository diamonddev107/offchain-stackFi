const mongoose = require('mongoose');

const LiquidationSchema = new mongoose.Schema({
    account: {
        type: String,
        required: true
    },
    id: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
});


const Liquidation = mongoose.model('Liquidation', LiquidationSchema);

module.exports = Liquidation;