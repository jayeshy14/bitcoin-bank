import mongoose from 'mongoose';

const loanApplicationSchema = new mongoose.Schema({
    //borrower of loan
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  //amount in Satoshis
  amount: {
    type: Number,
    required: true,
    min: 10
  },
  //interest rate in percentage
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  //Risk factor
  riskFactor: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  //duration in months
  term: {
    type: Number,
    required: true,
    min: 1,
    max: 60
  },
  //collateral for loan
  collateral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collateral',
    required: true
  },
  //status of loan application
  status: {
    type: String,
    enum: ['pending', 'fulfilled'],
    default: 'pending'
  },
  //date of loan application
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const LoanApplication =  mongoose.model('LoanApplication', loanApplicationSchema);
export default LoanApplication;