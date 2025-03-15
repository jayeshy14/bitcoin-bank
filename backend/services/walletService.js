import Wallet from "../models/Wallet.js";
import { generateSecretKey, generateWallet } from "@stacks/wallet-sdk";
import { broadcastTransaction, getAddressFromPrivateKey, TransactionVersion, makeSTXTokenTransfer } from "@stacks/transactions"

export const walletService = async (userId) => {
    try {

        const senderPrivateKey = "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601";
        const senderAddress = getAddressFromPrivateKey(senderPrivateKey, TransactionVersion.Testnet);
        const amount = 10000000;

        const seedPhrase = generateSecretKey();

        const walletGenrated = await generateWallet({
            secretKey: seedPhrase,
            password: "bitcoin-bank"
        });
        const stxPrivateKey = walletGenrated.accounts[0].stxPrivateKey;
        const Address = getAddressFromPrivateKey(stxPrivateKey, TransactionVersion.Testnet);
        
        try {

            await sendSomeFaucet(Address, senderPrivateKey, amount);
        } catch (e) {
            console.error("error creating wallet", e);
        }

        const wallet = new Wallet({
            owner: userId,
            salt: walletGenrated.salt,
            rootKey: walletGenrated.rootKey,
            configPrivateKey: walletGenrated.configPrivateKey,
            encryptedSecretKey: walletGenrated.encryptedSecretKey,
            stxPrivateKey,
            dataPrivateKey: walletGenrated.accounts[0].dataPrivateKey,
            appsKey: walletGenrated.accounts[0].appsKey,
            accountSalt: walletGenrated.accounts[0].salt,
            index: walletGenrated.accounts[0].index,
            address: Address,
            onChainBalance: 0,
            offChainBalance: 0,
        })

        await wallet.save();

        return Address;
    } catch (e) {
        console.error("error creating wallet", e);
    }
}

const sendSomeFaucet = async (recipient, from, amount) => {
    try {
 
        const transaction = await makeSTXTokenTransfer({
            recipient,
            amount,
            senderKey: from,
            network: "devnet"
        })

        const response = await broadcastTransaction(transaction, "devnet");
        console.log("response", response)
    } catch (e) {
        console.log("error sending faucet", e);
    }
}