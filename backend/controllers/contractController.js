import { 
    broadcastTransaction, 
    callReadOnlyFunction, 
    makeContractCall, 
    PostConditionMode, 
    principalCV, 
    uintCV, 
    stringAsciiCV, 
    Pc
} from "@stacks/transactions";
import Wallet from "../models/Wallet.js";
import Loan from "../models/loan.js";

const CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const CONTRACT_NAME = "bank";
const NETWORK = "devnet";
const DECIMAL = 8;
const SBTC_AMOUNT = (amount) => BigInt(Math.round(parseFloat(amount) * 10 ** DECIMAL));

// Deposit Function
export const deposit = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const senderPrivateKey = "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601";

        console.log("amount: ",amount, "wallet address:", wallet.address, "amount: ", SBTC_AMOUNT(amount));

        let pc = Pc.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")
            .willSendEq(SBTC_AMOUNT(amount))
            .ft("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token", "sbtc")
        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "deposit",
            functionArgs: [
                principalCV(wallet.address),
                uintCV(SBTC_AMOUNT(amount))
            ],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [pc],
            senderKey: senderPrivateKey,
            network: NETWORK,
        });

        const response = await broadcastTransaction(transaction, NETWORK);
        console.log("deposit response, ", response);
        res.status(201).json({ response, message: 'Deposit successful' });
    } catch (e) {
        console.error("error in deposit", e);
        res.status(500).json({ error: 'Error in deposit', message: e.message });
    }
};

// Get Balance Function
export const getBalance = async (req, res) => {
    try {
        console.log("fetching balance...");
        const userId = req.user.id;
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
            senderAddress: wallet.address
        });

        console.log("total balance: ", result);

        // Convert BigInt values to strings in the response
        const formattedResult = JSON.parse(
            JSON.stringify(result, (key, value) =>
                typeof value === "bigint" ? value.toString() : value
            )
        );

        res.status(200).json({ result: formattedResult, message: 'Balance fetched successfully' });
    } catch (e) {
        console.log("error getting balance", e);
        res.status(500).json({ error: 'Error fetching balance', message: e.message });
    }
};


// Loan Issuance Function
export const issueLoan = async (req, res) => {
    try {
        const { borrower, amountInBTC, interestRate, loanType, priceAtLoanTime, riskFactor, term, collateralType, collateralValue, collateral } = req.body;
        const lenderUserId = req.user.id;
        const borrowerData = await Wallet.findOne({ owner: borrower});
        if (!borrowerData) {
            return res.status(404).json({ error: "Borrower Wallet not found" });
        }
        
        const borrowerAddress = borrowerData.address;
        console.log("add: ", borrowerAddress, "amount", SBTC_AMOUNT(amountInBTC), "interestRate: ", interestRate, "loanType: ", loanType, "priceatLoanTime", priceAtLoanTime, "timeInMonth: ",term, "collateralType: ", collateralType, "colValue: ",collateralValue);
        const Lenderwallet = await Wallet.findOne({ owner: lenderUserId });
        if (!Lenderwallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        if (typeof collateral !== "string" || collateral.length > 50) {
            return res.status(400).json({ error: "Invalid collateralId. Must be an ASCII string with max length of 50." });
        }

        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "loan",
            functionArgs: [
                principalCV(borrowerAddress),
                uintCV(SBTC_AMOUNT(amountInBTC)),
                uintCV(interestRate),
                uintCV(loanType),
                uintCV(priceAtLoanTime),
                uintCV(riskFactor),
                uintCV(term),
                uintCV(collateralType),
                uintCV(collateralValue),
                stringAsciiCV(collateral) 
            ],
            postConditionMode: PostConditionMode.Deny,
            senderKey: Lenderwallet.stxPrivateKey,
            network: NETWORK,
        });

        const response = await broadcastTransaction(transaction, NETWORK);

        if (response.error) {
            return res.status(400).json({ error: "Transaction failed", message: response.error });
        }

        const result = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-total-loan-Id",
            functionArgs: [],
            network: NETWORK,
            senderAddress: Lenderwallet.address,
        });

        
        const nextDueDate = Loan.prototype.calculateNextDueDate();
        
        const loan = new Loan({
            lenderUserId,
            borrowerUserId: borrower,
            loanId: Number(result.value),
            borrower,
            principalBtc: amount,
            interestRate,
            loanType,
            priceAtLoanTime,
            riskFactor,
            timeInMonth,
            collateralType,
            collateralValue,
            collateralId: collateral,
            nextDueDate,
            status: "open",
        });

        await loan.save();

        res.status(201).json({ response, loan, message: "Loan issued successfully" });
    } catch (e) {
        console.log("error in loan: ", e);
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
        const userId = req.user.id;
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
        const userId = req.user.id;
        const { loanID, currentPrice, amountInBTC } = req.body;
        const wallet = await Wallet.findOne({ owner: userId });

        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const loan = await Loan.findOne({ loanId: loanID });

        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }

        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "repay",
            functionArgs: [
                uintCV(loanID), 
                uintCV(currentPrice),
                uintCV(SBTC_AMOUNT(amountInBTC)) 
            ],
            postConditionMode: PostConditionMode.Deny,
            senderKey: wallet.stxPrivateKey,
            network: NETWORK,
        });

        const response = await broadcastTransaction(transaction, NETWORK);

        if (response.error) {
            return res.status(400).json({ error: "Transaction failed", message: response.error });
        }

        loan.nextDueDate = loan.calculateNextDueDate();
        await loan.save();

        res.status(201).json({ response, adjustedAmount, message: "Repayment successful" });

    } catch (e) {
        res.status(500).json({ error: "Error in repayment", message: e.message });
    }
};


export const closeLoan = async (req, res) => {
    try {
        const { loanId } = req.body;
        const userId = req.user.id;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const loan = await Loan.findOne({ loanId });

        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "close-loan",
            functionArgs: [uintCV(loanId)],
            postConditionMode: PostConditionMode.Deny,
            senderKey: wallet.stxPrivateKey,
            network: NETWORK,
        });

        loan.status = "close";
        await loan.save();

        const response = await broadcastTransaction(transaction, NETWORK);
        res.status(201).json({ response, message: 'Loan closed successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Error closing loan', message: e.message });
    }
};

export const openLoan = async (req, res) => {
    try {
        const { loanId } = req.body;
        const userId = req.user.id;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const loan = await Loan.findOne({ loanId: loanID });

        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "open-loan",
            functionArgs: [uintCV(loanId)],
            postConditionMode: PostConditionMode.Deny,
            senderKey: wallet.stxPrivateKey,
            network: NETWORK,
        });

        loan.status = "open";
        await loan.save();

        const response = await broadcastTransaction(transaction, NETWORK);
        res.status(201).json({ response, message: 'Loan opened successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Error opening loan', message: e.message });
    }
};

export const getOnChainBalance = async (req, res) => {
    try {
        const userId = req.user.id;
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
            senderAddress: wallet.address,
        });

        // Convert BigInt values to strings in the response
        const formattedResult = JSON.parse(
            JSON.stringify(result, (key, value) =>
                typeof value === "bigint" ? value.toString() : value
            )
        );

        res.status(201).json({ result:formattedResult, message: 'On-chain balance retrieved successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Error fetching on-chain balance', message: e.message });
    }
};

export const getOffChainBalance = async (req, res) => {
    try {
        console.log("fetching balance...");
        const userId = req.user.id;
        const wallet = await Wallet.findOne({ owner: userId });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const functionParameters = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-offChain-balance",
            functionArgs: [principalCV(wallet.address)],
            network: NETWORK,
            senderAddress: wallet.address
        }
        console.log("function parameters: ", functionParameters);


        const result = await callReadOnlyFunction(
            functionParameters
        );

        // Convert BigInt values to strings in the response
        const formattedResult = JSON.parse(
            JSON.stringify(result, (key, value) =>
                typeof value === "bigint" ? value.toString() : value
            )
        );

        res.status(201).json({ result:formattedResult, message: 'Off-chain balance retrieved successfully' });
    } catch (e) {
        console.log("error fetching offchain Balance", error);
        res.status(500).json({ error: 'Error fetching off-chain balance', message: e.message });
    }
};

export const getTotalLoanId = async (req, res) => {
    try {
        const userId = req.user.id;
        const { loanID, currentPrice, amountInBTC } = req.body;
        const wallet = await Wallet.findOne({ owner: userId });

        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const result = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-total-loan-Id",
            functionArgs: [],
            network: NETWORK,
            senderAddress: wallet.address,
        });

        res.status(200).json({ result, message: "Total Loan ID fetched successfully" });
    } catch (e) {
        res.status(500).json({ error: "Error fetching total loan ID", message: e.message });
    }
};

export const getByLoanId = async (req, res) => {
    try {
        const userId = req.user.id;
        const { loanID, currentPrice, amountInBTC } = req.body;
        const wallet = await Wallet.findOne({ owner: userId });

        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const { loanId } = req.body;
        const result = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-by-loan-Id",
            functionArgs: [uintCV(loanId)],
            network: NETWORK,
            senderAddress: wallet.address,
        });

        res.status(200).json({ result, message: "Loan details fetched successfully" });
    } catch (e) {
        res.status(500).json({ error: "Error fetching loan details", message: e.message });
    }
};