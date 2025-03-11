import mongoose from 'mongoose';

const collateralSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['property', 'gold'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0,
    lastValuationDate: Date
  },
  status: {
    type: String,
    enum: ['locked', 'unlocked'],
    default: 'unlocked'
  },
  loanAssociation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    sparse: true
  }
}, {
  timestamps: true
});

const Collateral = mongoose.model('Collateral', collateralSchema);
export default Collateral;
