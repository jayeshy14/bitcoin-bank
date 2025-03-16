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
import LoanApplication from "../models/LoanApplication.js";
import Collateral from "../models/Collateral.js";
import { getPropertyValue, getGoldValue, getCryptoLatestPrice } from "../services/valuationService.js";

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
        const { loanId } = req.body;
        const lenderUserId = req.user.id;

        if (!loanId) {
            return res.status(400).json({ error: "Loan ID is required" });
        }

        // Find the loan application and populate collateral and borrower data
        const loanApplicationData = await LoanApplication.findById(loanId)
            .populate('collateral')
            .populate('borrower');

        if (!loanApplicationData) {
            return res.status(404).json({ error: "Loan application not found" });
        }

        // Extract data from the populated documents
        const collateralData = loanApplicationData.collateral;
        const borrowerData = loanApplicationData.borrower;

        if (!collateralData) {
            return res.status(404).json({ error: "Collateral not found" });
        }

        if (!borrowerData) {
            return res.status(404).json({ error: "Borrower not found" });
        }

        // Find borrower's wallet
        const borrowerWallet = await Wallet.findOne({ owner: borrowerData._id });
        if (!borrowerWallet) {
            return res.status(404).json({ error: "Borrower wallet not found" });
        }
        
        // Set collateral type and loan type
        const collateralType = collateralData.type === "gold" ? 1001 : 1002;
        const loanType = 0o1; // Changed from octal 0o1 to decimal 1
        console.log("collateralType: ", collateralType);
        console.log("loanType: ", loanType);

        // Get current BTC price for priceAtLoanTime if not provided
        const currentBtcPrice = await getCryptoLatestPrice()        
        // Ensure we have a valid collateral value - convert to integer
        const currentValue = Math.floor(collateralData.value) || 1000; // Fallback value if NaN
        console.log("currentValue: ", currentValue);
        
        // Get borrower address
        const borrowerAddress = borrowerWallet.address;
        
        // Get term (timeInMonth) from the loan application
        const term = Math.floor(loanApplicationData.term) || 12; // Fallback to 12 months if undefined
        
        // Get risk factor with fallback - convert to integer
        const riskFactor = Math.floor(loanApplicationData.riskFactor) || 5; // Fallback to 5% if undefined
        
        // Convert amount to integer
        const amountInBTC = loanApplicationData.amount / currentBtcPrice;
        
        // Convert interest rate to integer
        const interestRate = Math.floor(loanApplicationData.interestRate);
        
        // Convert BTC price to integer
        const priceAtLoanTime = Math.floor(currentBtcPrice);
        
        console.log("add: ", borrowerAddress, 
                   "amount", SBTC_AMOUNT(amountInBTC), 
                   "interestRate: ", interestRate, 
                   "loanType: ", loanType, 
                   "priceAtLoanTime", priceAtLoanTime, 
                   "term: ", term, 
                   "riskFactor: ", riskFactor,
                   "collateralType: ", collateralType, 
                   "colValue: ", currentValue);
        
        // Find lender's wallet
        const lenderWallet = await Wallet.findOne({ owner: lenderUserId });
        if (!lenderWallet) {
            return res.status(404).json({ error: "Lender wallet not found" });
        }

        // Make contract call
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
                uintCV(term),
                uintCV(riskFactor),
                uintCV(collateralType),
                uintCV(currentValue),
                stringAsciiCV(collateralData._id.toString())
            ],
            postConditionMode: PostConditionMode.Deny,
            senderKey: lenderWallet.stxPrivateKey,
            network: NETWORK,
        });

        // Broadcast transaction
        const response = await broadcastTransaction(transaction, NETWORK);
        console.log(response, "response");

        if (response.error) {
            return res.status(400).json({ error: "Transaction failed", message: response.error });
        }

        // Get total loan ID
        const totalLoanIdResult = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-total-loan-Id",
            functionArgs: [],
            network: NETWORK,
            senderAddress: lenderWallet.address,
        });

        // Create loan in database
        const loan = new Loan({
            lenderUserId: lenderUserId,
            borrowerUserId: borrowerData._id,
            loanId: Number(totalLoanIdResult.value),
            borrower: borrowerAddress,
            principalBtc: amountInBTC,
            interestRate: interestRate,
            loanType: loanType,
            priceAtLoanTime: priceAtLoanTime,
            riskFactor: riskFactor,
            timeInMonth: term,
            collateralType: collateralType,
            collateralValue: currentValue,
            collateralId: collateralData._id.toString(),
            nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: "open"
        });

        await loan.save();

        // Update loan application status
        loanApplicationData.status = "fulfilled";
        await loanApplicationData.save();

        // Update collateral status
        collateralData.status = "locked";
        collateralData.loanAssociation = loan._id;
        await collateralData.save();

        res.status(201).json({ response, loan, message: "Loan issued successfully" });
    } catch (e) {
        console.error("error in loan: ", e);
        res.status(500).json({ error: "Error issuing loan", message: e.message });
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
        console.log("Repay data:", req.body);
        const wallet = await Wallet.findOne({ owner: userId });

        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }

        const loan = await Loan.findById(loanID);

        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }


        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "repay",
            functionArgs: [
                uintCV(loan.loanId), 
                uintCV(Math.round(currentPrice)),
                uintCV(SBTC_AMOUNT(amountInBTC)) 
            ],
            postConditionMode: PostConditionMode.Deny,
            senderKey: wallet.stxPrivateKey,
            network: NETWORK,
        });

        const response = await broadcastTransaction(transaction, NETWORK);

        console.log("repay response: ", response);

        if (response.error) {
            return res.status(400).json({ error: "Transaction failed", message: response.error });
        }

        loan.nextDueDate = loan.calculateNextDueDate();
        await loan.save();

        res.status(201).json({ 
            response, 
            amountPaid: amountInBTC,
            message: "Repayment successful" 
        });

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

        const loan = await Loan.findOne({ loanId });
        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
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
        console.log("error fetching offchain Balance", e);
        res.status(500).json({ error: 'Error fetching off-chain balance', message: e.message });
    }
};

export const getTotalLoanId = async (req, res) => {
    try {
        const userId = req.user.id;
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
        console.log("user id", req.user.id);
        // Find all open loans for the logged-in user (borrower)
        const loans = await Loan.find({ borrowerUserId: req.user.id, status: "open" }).exec();
        if (!loans || loans.length === 0) {
            return res.status(404).json({ error: "Loan not found" });
        }
        
        // Find the wallet for the logged-in user
        const wallet = await Wallet.findOne({ owner: req.user.id });
        if (!wallet) {
            return res.status(404).json({ error: "Wallet not found" });
        }
        
        // Extract loan IDs from the loans array
        const loanIds = loans.map(loan => loan.loanId);
        
        // For each loanId, call the smart contract's read-only function
        const results = await Promise.all(
            loanIds.map(async (id) => {
                const functionParameters = {
                    contractAddress: CONTRACT_ADDRESS,
                    contractName: CONTRACT_NAME,
                    functionName: "get-by-loan-Id",
                    functionArgs: [uintCV(id)],
                    network: NETWORK,
                    senderAddress: wallet.address,
                };
                console.log("Fetching details for loanId:", id);
                const result = await callReadOnlyFunction(functionParameters);
                return result.value.data;
            })
        );
        
        // Serialize the results to handle BigInt values
        const serializedResults = results.map(result =>
            JSON.parse(JSON.stringify(result, (key, value) => {
                if (typeof value === "bigint") {
                    return value.toString();
                }
                return value;
            }))
        );
        
        res.status(200).json({ result: serializedResults, message: "Loan details fetched successfully" });
    } catch (e) {
        console.error("Error in getByLoanId:", e);
        res.status(500).json({ error: "Error fetching loan details", message: e.message });
    }
};