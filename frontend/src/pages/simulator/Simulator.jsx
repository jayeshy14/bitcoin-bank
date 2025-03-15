import React, { useState } from "react";
import { simulateEmi } from "../../apis/loanApis";


function Simulator() {
  const [formData, setFormData] = useState({
    principalBtc: "",
    priceAtLoanTime: "",
    monthlyInterestRate: "",
    riskPercentage: "",
    loanTimeInMonths: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const numericFormData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, parseFloat(value)])
    );

    const result = await simulateEmi(numericFormData);
    setResult(result);
    setLoading(false);
  };

  return (
    <div className="container flex flex-col items-center justify-center mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Loan Simulator</h2>

      <form onSubmit={handleSubmit} className="space-y-4 w-1/2 flex flex-col bg-gray-300 p-5 text-black rounded">
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium">{key}</label>
            <input
              type="number"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Simulate Loan"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Simulation Result</h3>
          <pre className=" p-4 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Simulator;
