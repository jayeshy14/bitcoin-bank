import { broadcastTransaction, makeContractCall, principalCV, uintCV, bufferCV, someCV, Pc, PostConditionMode} from "@stacks/transactions";

const NETWORK = "devnet";
const MINT_RECEIVER_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const SBTC_SENDER = MINT_RECEIVER_ADDRESS;
const SBTC_RECEIVER_ADDRESS = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
const SENDER_KEY = "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601";
const FUNCTION_NAME = "mint";

const CONTRACT_ADDRESS = MINT_RECEIVER_ADDRESS;
const CONTRACR_NAME = "sbtc-token";

const DECIMAL = 8;
const MINT_AMOUNT = 100;
const TRANSFER_AMOUNT = 1;
const SBTC_AMOUNT =  (amount) => BigInt(amount) * BigInt(10 ** DECIMAL);

async function mintSBTC() {
    try{
        console.log("Sending message...");


        // MINTING TOKEN
        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACR_NAME,
            functionName: FUNCTION_NAME,
            functionArgs: [
                uintCV(SBTC_AMOUNT(MINT_AMOUNT)),
                principalCV(MINT_RECEIVER_ADDRESS),
            ],
            senderKey: SENDER_KEY,
            network: NETWORK,
        }

        const transaction = await makeContractCall(txOptions);
        const response = await broadcastTransaction(transaction, NETWORK);
        console.log("tx id: ", response);

        // TESTING TOKEN TRANSFER
        console.log("transfering sBTC token...");
        let pc = Pc.principal(SBTC_SENDER)
            .willSendEq(SBTC_AMOUNT(TRANSFER_AMOUNT))
            .ft("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token", "sbtc")
        const transferTransaction = await makeContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACR_NAME,
        functionName: 'transfer',
        functionArgs: [
            uintCV(SBTC_AMOUNT(TRANSFER_AMOUNT)),
            principalCV(SBTC_SENDER),
            principalCV(SBTC_RECEIVER_ADDRESS),
            someCV(bufferCV(Buffer.from("Testing transfer", "utf-8")))
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [pc],
        senderKey: SENDER_KEY,
        network: NETWORK
       })

       const transferResponse = await broadcastTransaction(transferTransaction, NETWORK);
       console.log("transfer response ",transferResponse);

    } catch (err) {
        console.error("Error in minting sBTC: ", err);
    }
}

mintSBTC()