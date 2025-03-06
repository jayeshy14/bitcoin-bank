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
  description: {
    type: String,
    required: true
  },
  value: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true
    },
    lastValuationDate: Date
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'locked', 'liquidated', 'released'],
    default: 'pending'
  },
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
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
