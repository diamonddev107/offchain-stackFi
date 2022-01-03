const Accounts = require("../models/Account");

exports.addAccount = async (req, res, next) => {
    try {
        const { address, whiteListed } = req.body;
        let accountDetails = {
            address,
            whiteListed,
            timestamp: new Date().getTime()
        }
        const account = await Accounts.create(accountDetails);
        return res.status(201).json({
            success: true,
            data: account
        })
    } catch (error) {
        console.log(req);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            })
        } else {
            return res.status(500).json({
                success: false,
                error: `Error Adding Account: ${error.message}`
            })
        }
    }
}

exports.whiteListAccount = async (req, res, next) => {
    try {
        const { address } = req.body;
        let account = await Accounts.findOneAndUpdate({ address: address }, { whiteListed: true }, {
            new: true
        });
        return res.status(201).json({
            success: true,
            data: account
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: `Error Getting Account ${req.body.address}: ${error.message}`
        })
    }
}