import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  term: {
    // Duration in months
    type: Number,
    required: true,
    min: 1
  },
  collateral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collateral',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'completed', 'defaulted', 'rejected'],
    default: 'pending'
  },
  paymentSchedule: [{
    dueDate: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'late', 'defaulted'],
      default: 'pending'
    },
    transactionId: String
  }],
  disbursementDetails: {
    bitcoinAddress: String,
    transactionId: String,
    disbursementDate: Date
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: Date,
  lastPaymentDate: Date,
  nextPaymentDate: Date,
  completionDate: Date,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property for loan amount calculation
loanSchema.virtual('loanAmount').get(function() {
  if (!this.collateral || !this.interestRate || !this.term) return 0;
  
  const valuationPrice = this.collateral.value.amount;
  return valuationPrice - (this.interestRate * this.term * valuationPrice);
});

// Middleware to update payment schedule when loan is approved
loanSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'approved') {
    const startDate = new Date();
    this.approvalDate = startDate;
    
    // Calculate loan amount dynamically
    const collateral = await mongoose.model('Collateral').findById(this.collateral);
    if (!collateral) return next(new Error('Collateral not found'));

    this.amount = collateral.value.amount - (this.interestRate * this.term * collateral.value.amount);

    // Generate payment schedule
    this.paymentSchedule = Array.from({ length: this.term }, (_, index) => {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + index + 1);
      
      return {
        dueDate,
        amount: this.amount / this.term,
        status: 'pending'
      };
    });

    this.nextPaymentDate = this.paymentSchedule[0].dueDate;
  }
  next();
});

const Loan = mongoose.model('Loan', loanSchema);
export default Loan;
