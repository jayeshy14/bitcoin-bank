import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['loan_disbursement', 'loan_repayment', 'investment', 'withdrawal', 'liquidation'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['BTC', 'SATS'],
    default: 'BTC'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    sparse: true
  },
  bitcoinTxId: {
    type: String,
    sparse: true
  },
  confirmations: {
    type: Number,
    default: 0
  },
  fee: {
    type: Number,
    default: 0
  },
  description: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for querying transactions by bitcoin transaction ID
transactionSchema.index({ bitcoinTxId: 1 }, { sparse: true });

// Method to check if transaction is confirmed
transactionSchema.methods.isConfirmed = function() {
  return this.confirmations >= 6; // Consider 6 confirmations as confirmed
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction; 