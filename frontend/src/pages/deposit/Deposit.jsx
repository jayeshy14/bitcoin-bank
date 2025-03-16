import React, { useEffect, useState } from "react";
import { getUserWallet } from "../../apis/loanApis";
import { depositAPI } from "../../apis/contractApis";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { getBTCvalueInUSD } from "../../apis/collateralApis";

function Deposit() {
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [btcPrice, setBtcPrice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch wallet address
                const walletAddress = await getUserWallet();
                setAddress(walletAddress);
                
                // Fetch BTC price
                const price = await getBTCvalueInUSD();
                setBtcPrice(price);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load wallet information. Please try again later.");
            }
        };
        fetchData();
    }, []);

    const handleDeposit = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await depositAPI(amount);
            setSuccess(`Successfully deposited ${amount} BTC to your account!`);
            setAmount("");
            
            // Wait 2 seconds before redirecting
            setTimeout(() => {
            navigate("/dashboard");
            }, 2000);
        } catch (error) {
            console.error("Deposit failed:", error);
            setError(error.message || "Deposit failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="relative mb-8 overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-600 opacity-90"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="relative z-10 px-8 py-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Deposit Bitcoin</h1>
                        <p className="text-yellow-100 max-w-2xl">
                            Add funds to your account to start borrowing or lending. Your deposits are securely stored and can be withdrawn at any time.
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-xl"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-400">{error}</p>
                            </div>
                        </div>
                    </Motion.div>
                )}

                {/* Success Message */}
                {success && (
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-400">{success}</p>
                            </div>
                        </div>
                    </Motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Wallet Address Card */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Your Wallet Address</h3>
                            <p className="text-gray-400 mb-4">
                                This is your unique Bitcoin wallet address. Use it to receive funds from external sources.
                            </p>
                            
                            <div className="bg-gray-700/50 p-4 rounded-lg mb-4">
                                {address ? (
                                    <div className="flex items-center justify-between">
                                        <div className="font-mono text-sm text-yellow-300 break-all">
                                            {address}
                                        </div>
                                        <button 
                                            onClick={copyToClipboard}
                                            className="ml-2 p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                                        >
                                            {copied ? (
                                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="animate-pulse flex space-x-4">
                                        <div className="flex-1 space-y-4 py-1">
                                            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-sm font-medium text-yellow-300">Important</h4>
                                        <p className="mt-1 text-sm text-gray-300">
                                            Only send Bitcoin (BTC) to this address. Sending any other cryptocurrency may result in permanent loss.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Deposit Form Card */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Deposit Bitcoin</h3>
                            <p className="text-gray-400 mb-6">
                                Enter the amount of Bitcoin you want to deposit to your account.
                            </p>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">Amount (BTC)</label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-yellow-500 sm:text-sm">₿</span>
                                        </div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            step="0.00000001"
                                            min="0"
                                            className="w-full pl-10 pr-20 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    aria-label="Deposit Amount"
                />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <span className="text-gray-400 sm:text-sm">BTC</span>
                                        </div>
                                    </div>
                                    
                                    {amount && btcPrice && (
                                        <p className="mt-2 text-sm text-gray-400">
                                            ≈ ${(parseFloat(amount) * btcPrice).toFixed(2)} USD
                                        </p>
                                    )}
                                </div>
                                
                                <button
                                    onClick={handleDeposit}
                                    disabled={loading || !amount}
                                    className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-lg transition-all duration-200 
                                        ${loading || !amount 
                                            ? 'bg-gray-600 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </div>
                                    ) : 'Deposit Bitcoin'}
                </button>
            </div>
                            
                            <div className="mt-6 bg-gray-700/30 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-white mb-2">How it works:</h4>
                                <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
                                    <li>Enter the amount of Bitcoin you want to deposit</li>
                                    <li>Click the "Deposit Bitcoin" button</li>
                                    <li>Confirm the transaction in your wallet</li>
                                    <li>Your balance will be updated once the transaction is confirmed</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
}

export default Deposit;
