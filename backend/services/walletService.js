import Wallet from "../models/Wallet.js";
import { generateSecretKey, generateWallet } from "@stacks/wallet-sdk";
import { broadcastTransaction, getAddressFromPrivateKey, uintCV, principalCV, someCV,bufferCV, makeContractCall, TransactionVersion, Pc, PostConditionMode } from "@stacks/transactions"

export const walletService = async (userId) => {
    try {

        const senderPrivateKey = "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601";
        const senderAddress = getAddressFromPrivateKey(senderPrivateKey, TransactionVersion.Testnet);
        const amount = 1;

        const seedPhrase = generateSecretKey();

        const walletGenrated = await generateWallet({
            secretKey: seedPhrase,
            password: "bitcoin-bank"
        });
        const stxPrivateKey = walletGenrated.accounts[0].stxPrivateKey;
        const Address = getAddressFromPrivateKey(stxPrivateKey, TransactionVersion.Testnet);

        await sendSome_sbtcFaucet(Address, senderAddress, senderPrivateKey, amount);

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
            onChainBalance: amount,
            offChainBalance: 0,
        })

        await wallet.save();

        return Address;
    } catch (e) {
        console.error("error creating wallet", e);
    }
}

const sendSome_sbtcFaucet = async (recipient, from, privateKey, amount) => {

    try {
        const CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
        const CONTRACT_NAME = "sbtc-token"
        const CONTRACT_FUNCTION = "transfer"

        const NETWORK = "devnet";

        const DECIMAL = 8;
        const SBTC_AMOUNT =  (amount) => BigInt(amount) * BigInt(10 ** DECIMAL);

        let pc = Pc.principal(from)
            .willSendEq(SBTC_AMOUNT(amount))
            .ft("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token", "sbtc");

        const transaction = await makeContractCall({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: CONTRACT_FUNCTION,
            functionArgs: [
                uintCV(SBTC_AMOUNT(amount)),
                principalCV(from),
                principalCV(recipient),
                someCV(bufferCV(Buffer.from("for testing", "utf-8")))
            ],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [pc],
            senderKey: privateKey,
            network: NETWORK
        })

        const response = await broadcastTransaction(transaction, NETWORK);
        console.log("response", response)
    } catch (e) {
        console.log("error sending faucet", e);
    }
}