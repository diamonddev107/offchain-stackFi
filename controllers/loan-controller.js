const { symbols, commitmentHash } = require('../constants/constants');
const Loan = require('../models/Loan');

exports.getLoanAPI = async (req, res, next) => {
    try {
        const loan = await Loan.find();

        return res.status(200).json({
            success: true,
            data: loan
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: `Error Getting Loan: ${error.message}`
        })
    }
}

exports.getLoansByAccountAPI = async (req, res, next) => {
    try {
        let loan = await Loan.find({account: req.params.account});
        loan["loanMarket"] = symbols[loan["loanMarket"]];
        loan["collateralMarket"] = symbols[loan["collateralMarket"]];
        loan["loanCommitment"] = commitmentHash[loan["loanCommitment"]];
        return res.status(200).json({
            success: true,
            data: loan
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: `Error Getting Loan: ${error.message}`
        })
    }
}

exports.getLoan = async () => {
    try {
        const loan = await Loan.find();
        return loan;
    } catch (error) {
        throw error;
    }
}

exports.getLoanByIdAPI = async (req, res, next) => {
    try {
        const loan = await Loan.findOne({id: req.params.id});
        if (!loan) {
            return res.status(404).json( {
                success: false,
                error: 'Loan Not Found'
            })
        }
        return res.status(200).json({
            success: true,
            data: loan
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: `Error Getting Loan ${req.params.id}: ${error.message}`
        })
    }
}

exports.getLoanById = async (loanId) => {
    try {
        const loan = await Loan.findOne({id: loanId});
        if (!loan) {
            console.log(`No loan with id: ${loanId} found!`)
            return;
        }
        return loan;
    } catch (error) {
        throw error;
    }
}

exports.updateLoanAmount = async (loanId, loanAmount) => {
    try {
        const loan = await Loan.findOneAndUpdate({id: loanId}, {loanAmount}, {new: true});
        console.log("loan updated with new price!", loan);
    } catch(error) {
        throw error;
    }
}

exports.addLoan = async (loanDetails) => {
    try {
        const loanAdded = await Loan.create(loanDetails);
        return loanAdded;
    } catch (error) {
        console.log(req);

        if(error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            throw new Error(messages)
        } else {
            throw error;
        }
    }
}