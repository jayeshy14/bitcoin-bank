import Loan from '../models/Loan.js';
import Transaction from '../models/Transaction.js';

export const getInvestmentOpportunities = async (req, res) => {
  try {
    const loans = await Loan.find({
      status: 'approved',
      lender: { $exists: false }
    })
      .populate('borrower', 'firstName lastName')
      .populate('collateral')
      .sort('-createdAt');

    res.json(loans);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching investment opportunities',
      message: error.message
    });
  }
};

export const investInLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId);

    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    if (loan.status !== 'approved' || loan.lender) {
      return res.status(400).json({ error: 'Loan is not available for investment' });
    }

    // Create investment transaction
    const transaction = await Transaction.create({
      type: 'investment',
      amount: loan.amount,
      sender: req.user.id,
      recipient: loan.borrower,
      loan: loan._id,
      status: 'pending'
    });

    // Update loan with investor details
    loan.lender = req.user.id;
    loan.status = 'active';
    await loan.save();

    res.json({ message: 'Investment successful', transaction, loan });
  } catch (error) {
    res.status(500).json({ error: 'Error processing investment', message: error.message });
  }
};

export const getMyInvestments = async (req, res) => {
  try {
    const loans = await Loan.find({ lender: req.user.id })
      .populate('borrower', 'firstName lastName')
      .populate('collateral')
      .sort('-createdAt');

    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching investments', message: error.message });
  }
};

export const withdrawInvestment = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId);

    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    if (loan.lender.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to withdraw from this loan' });
    }

    if (loan.status !== 'completed') {
      return res.status(400).json({ error: 'Cannot withdraw from an active loan' });
    }

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      type: 'withdrawal',
      amount: loan.totalRepayableAmount, // Assume this comes from the model or passed value
      sender: loan.borrower,
      recipient: req.user.id,
      loan: loan._id,
      status: 'pending'
    });

    res.json({ message: 'Withdrawal initiated', transaction });
  } catch (error) {
    res.status(500).json({ error: 'Error processing withdrawal', message: error.message });
  }
};
