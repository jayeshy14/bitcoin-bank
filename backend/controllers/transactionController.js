
import Loan from '../models/Loan.js';

export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    })
      .populate('loan', 'amount term status')
      .sort('-createdAt');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching transactions',
      message: error.message
    });
  }
};

export const getTransactionDetails = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('sender', 'firstName lastName email')
      .populate('recipient', 'firstName lastName email')
      .populate('loan');

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found'
      });
    }

    // Check authorization
    if (transaction.sender.toString() !== req.user.id && 
        transaction.recipient.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Not authorized to view this transaction'
      });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching transaction details',
      message: error.message
    });
  }
};

export const updateTransactionStatus = async (req, res) => {
  try {
    const { status, confirmations } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found'
      });
    }

    // Update transaction status
    transaction.status = status;
    if (confirmations !== undefined) {
      transaction.confirmations = confirmations;
    }

    await transaction.save();

    // If transaction is completed and it's a loan payment, update loan status
    if (status === 'completed' && transaction.type === 'loan_repayment') {
      const loan = await Loan.findById(transaction.loan);
      if (loan) {
        await loan.processPayment(transaction.amount, transaction._id);
      }
    }

    res.json({
      transaction,
      message: 'Transaction status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error updating transaction status',
      message: error.message
    });
  }
}; 