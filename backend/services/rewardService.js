import Transaction from '../models/Transaction.js';
import Loan from '../models/Loan.js';

export const calculateRewards = async (investorId) => {
  try {
    // Fetch all transactions related to the investor
    const transactions = await Transaction.find({ recipient: investorId, type: 'investment' });
    let totalRewards = 0;

    // Calculate rewards based on the transactions
    for (const transaction of transactions) {
      const loan = await Loan.findById(transaction.loan);
      if (loan && loan.status === 'completed') {
        // Assuming a reward of 5% of the loan amount for completed loans
        totalRewards += loan.amount * 0.05;
      }
    }

    return totalRewards;
  } catch (error) {
    console.error('Error calculating rewards:', error);
    throw new Error('Could not calculate rewards');
  }
}; 