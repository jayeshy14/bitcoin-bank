import Loan from '../models/Loan.js';
import Collateral from '../models/Collateral.js';
import Transaction from '../models/Transaction.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: 'active' });
    const totalCollateral = await Collateral.countDocuments();
    const totalInvestments = await Transaction.countDocuments({ type: 'investment' });
    const activeInvestments = await Transaction.countDocuments({ type: 'investment', status: 'pending' });

    res.json({
      totalLoans,
      activeLoans,
      totalCollateral,
      totalInvestments,
      activeInvestments
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dashboard stats', message: error.message });
  }
}; 