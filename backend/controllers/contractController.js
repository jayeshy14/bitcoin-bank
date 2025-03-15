import { 
    broadcastTransaction, 
    callReadOnlyFunction, 
    makeContractCall, 
    PostConditionMode, 
    principalCV, 
    uintCV, 
    stringAsciiCV 
} from "@stacks/transactions";
import Wallet from "../models/Wallet.js";

const CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const CONTRACT_NAME = "bank";
const NETWORK = "devnet";
const DECIMAL = 8;
const SBTC_AMOUNT = (amount) => BigInt(amount) * BigInt(10 ** DECIMAL);

// Deposit Function
export const deposit = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount } = req.body;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "deposit",
            functionArgs: [
                principalCV(wallet.address),
                uintCV(SBTC_AMOUNT(amount))
            ],
            postConditionMode: PostConditionMode.Deny,
            senderKey: wallet.stxPrivateKey,
            network: NETWORK,
        });

        const response = await broadcastTransaction(transaction, NETWORK);
        res.status(201).json({ response, message: 'Deposit successful' });
    } catch (e) {
        res.status(500).json({ error: 'Error in deposit', message: e.message });
    }
};

// Get Balance Function
export const getBalance = async (req, res) => {
    try {
        const userId = req.user._id;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const result = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-balance",
            functionArgs: [
                principalCV(wallet.address)
            ],
            network: NETWORK,
            senderAddress: who
        });

        res.status(201).json({ result, message: 'Balance fetched successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Error fetching balance', message: e.message });
    }
};

// Loan Issuance Function
export const issueLoan = async (req, res) => {
    try {
        const { borrower, amount, interestRate, loanType, priceAtLoanTime, riskFactor, timeInMonth, collateralType, collateralValue, collateralId } = req.body;
        const userId = req.user._id;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        if (typeof collateralId !== "string" || collateralId.length > 50) {
            return res.status(400).json({ error: "Invalid collateralId. Must be an ASCII string with max length of 50." });
        }

        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "loan",
            functionArgs: [
                principalCV(borrower),
                uintCV(SBTC_AMOUNT(amount)),
                uintCV(interestRate),
                uintCV(loanType),
                uintCV(priceAtLoanTime),
                uintCV(riskFactor),
                uintCV(timeInMonth),
                uintCV(collateralType),
                uintCV(collateralValue),
                stringAsciiCV(collateralId) 
            ],
            postConditionMode: PostConditionMode.Deny,
            senderKey: wallet.stxPrivateKey,
            network: NETWORK,
        });

        const response = await broadcastTransaction(transaction, NETWORK);
        res.status(201).json({ response, message: 'Loan issued successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Error issuing loan', message: e.message });
    }
};

// Get Loan Status
export const getLoanStatus = async (req, res) => {
    try {
        const result = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-loan-status",
            functionArgs: [
                uintCV(req.loanId)
            ],
            network: NETWORK,
            senderAddress: req.user.address
        });

        res.status(201).json({ result, message: 'Loan status retrieved successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Error fetching loan status', message: e.message });
    }
};

export const withdraw = async (req, res) => {
    try {
        const userId = req.user._id;
        const { to, amount} = req.body;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "withdraw",
            functionArgs: [
                principalCV(to),
                uintCV(SBTC_AMOUNT(amount))
            ],
            postConditionMode: PostConditionMode.Deny,
            senderKey: wallet.stxPrivateKey,
            network: NETWORK,
        });

        const response = await broadcastTransaction(transaction, NETWORK);
        res.status(201).json({ response, message: 'Withdrawal successful' });
    } catch (e) {
        res.status(500).json({ error: 'Error in withdrawal', message: e.message });
    }
};

export const repay = async (req, res) => {
    try {
        const userId = req.user._id;
        const { loanID, currentPrice, amountInBTC } = req.body;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "repay",
            functionArgs: [
                uintCV(loanID), 
                uintCV(currentPrice),
                uintCV(SBTC_AMOUNT(amountInBTC))],
            postConditionMode: PostConditionMode.Deny,
            senderKey: wallet.stxPrivateKey,
            network: NETWORK,
        });

        const response = await broadcastTransaction(transaction, NETWORK);
        res.status(201).json({ response, message: 'Repayment successful' });
    } catch (e) {
        res.status(500).json({ error: 'Error in repayment', message: e.message });
    }
};

export const closeLoan = async (req, res) => {
    try {
        const { loanId } = req.body;
        const userId = req.user._id;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "close-loan",
            functionArgs: [uintCV(loanId)],
            postConditionMode: PostConditionMode.Deny,
            senderKey: wallet.stxPrivateKey,
            network: NETWORK,
        });

        const response = await broadcastTransaction(transaction, NETWORK);
        res.status(201).json({ response, message: 'Loan closed successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Error closing loan', message: e.message });
    }
};

export const openLoan = async (req, res) => {
    try {
        const { loanId } = req.body;
        const userId = req.user._id;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "open-loan",
            functionArgs: [uintCV(loanId)],
            postConditionMode: PostConditionMode.Deny,
            senderKey: wallet.stxPrivateKey,
            network: NETWORK,
        });

        const response = await broadcastTransaction(transaction, NETWORK);
        res.status(201).json({ response, message: 'Loan opened successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Error opening loan', message: e.message });
    }
};

export const getOnChainBalance = async (req, res) => {
    try {
        const userId = req.user._id;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const result = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-onChain-balance",
            functionArgs: [principalCV(wallet.address)],
            network: NETWORK,
            senderAddress: req.who
        });

        res.status(201).json({ result, message: 'On-chain balance retrieved successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Error fetching on-chain balance', message: e.message });
    }
};

export const getOffChainBalance = async (req, res) => {
    try {
        const userId = req.user._id;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const result = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-offChain-balance",
            functionArgs: [principalCV(wallet.address)],
            network: NETWORK,
            senderAddress: req.who
        });

        res.status(201).json({ result, message: 'Off-chain balance retrieved successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Error fetching off-chain balance', message: e.message });
    }
};

export const getTotalLoanId = async (req, res) => {
    try {
        const result = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-total-loan-Id",
            functionArgs: [],
            network: NETWORK,
            senderAddress: req.user.address,
        });

        res.status(200).json({ result, message: "Total Loan ID fetched successfully" });
    } catch (e) {
        res.status(500).json({ error: "Error fetching total loan ID", message: e.message });
    }
};

export const getByLoanId = async (req, res) => {
    try {
        const { loanId } = req.body;
        const result = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-by-loan-Id",
            functionArgs: [uintCV(loanId)],
            network: NETWORK,
            senderAddress: req.user.address,
        });

        res.status(200).json({ result, message: "Loan details fetched successfully" });
    } catch (e) {
        res.status(500).json({ error: "Error fetching loan details", message: e.message });
    }
};