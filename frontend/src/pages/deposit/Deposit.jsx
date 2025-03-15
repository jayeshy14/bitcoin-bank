import React, { useEffect, useState } from "react";
import { getUserWallet } from "../../apis/loanApis";
import { depositAPI } from "../../apis/contractApis";
import { useNavigate } from "react-router-dom";

function Deposit() {
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchWalletAddress = async () => {
            try {
                const walletAddress = await getUserWallet();
                console.log(walletAddress);
                setAddress(walletAddress);
            } catch (error) {
                console.error("Error fetching wallet address:", error);
            }
        };
        fetchWalletAddress();
    }, []);

    const handleDeposit = async ()  => {
        try {
            await depositAPI(amount);
            navigate("/dashboard");
        } catch (error) {
            console.error("Deposit failed:", error);
        }
    }

    return (
        <div className="flex flex-col gap-10 p-4">
            <h1 className="font-bold text-3xl text-center">Deposit the sBTC</h1>
            <div className="flex flex-col items-center justify-center gap-4">
                <p className="text-lg font-semibold">{address || "Loading address..."}</p>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="p-2 border rounded w-64"
                    aria-label="Deposit Amount"
                />
                <button onClick={() => handleDeposit()} className="cursor-pointer p-2 bg-yellow-400 rounded hover:bg-yellow-500 transition">
                    Deposit
                </button>
            </div>
        </div>
    );
}

export default Deposit;
