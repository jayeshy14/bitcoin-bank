import mongoose from 'mongoose';

const loanApplicationSchema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 10
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  riskFactor: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  term: {
    type: Number,
    required: true,
    min: 1,
    max: 60
  },
  collateral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collateral',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'fulfilled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent OverwriteModelError
const LoanApplication = mongoose.models.LoanApplication || mongoose.model('LoanApplication', loanApplicationSchema);

export default LoanApplication;
