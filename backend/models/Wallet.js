import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    salt: {
        type: String,
        required: true,
    },
    rootKey: {
        type: String,
        required: true
    },
    configPrivateKey: {
        type: String,
        required: true
    },
    encryptedSecretKey: {
        type: String,
        required: true
    },
    stxPrivateKey: {
        type: String,
        required: true
    },
    dataPrivateKey: {
        type: String,
        required: true
    },
    appsKey: {
        type: String,
        required: true
    },
    accountSalt: {
        type: String,
        required: true
    },
    index: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    onChainBalance: {
        type: Number,
        required: true,
    },
    offChainBalance: {
        type: Number,
        required: true
    }
})

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;