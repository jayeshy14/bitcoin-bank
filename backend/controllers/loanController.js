import Loan from '../models/Loan.js';
import Collateral from '../models/Collateral.js';
import LoanApplication from '../models/loanApplication.js';
export const createLoanApplication = async (req, res) => {
  try {
    const { amount, interestRate, riskFactor, term, collateralId } = req.body;
    console.log(req.body);

    // Verify collateral
    const collateral = await Collateral.findById(collateralId);
    if (!collateral) {
      return res.status(404).json({ error: 'Collateral not found' });
    }

    if (collateral.status !== 'unlocked' || collateral.loanAssociation) {
      return res.status(400).json({ error: 'Collateral is not available for loan' });
    }

    console.log("Borrower is: ", req.user._id);

    const loanApplicationFields = {
      borrower: req.user._id,
      amount: parseInt(amount),
      interestRate: parseInt(interestRate),
      riskFactor: parseInt(riskFactor),
      term: parseInt(term),
      collateral: collateralId,
      status: 'pending',
      createdAt: Date.now(),
    }
    console.log(loanApplicationFields);

    // Create loan application
    const loanApplication = await LoanApplication.create(
      loanApplicationFields
    );
    console.log(loanApplication._id);

    // Lock collateral
    collateral.status = 'locked';
    collateral.loanAssociation = loanApplication._id;
    await collateral.save();

    res.status(201).json({ loanApplication, message: 'Loan application created successfully' });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: 'Error creating loan application', message: error.message });
  }
};

export const getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ borrower: req.user.id }).populate('collateral').sort('-createdAt');
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching loans', message: error.message });
  }
};

export const getLoanDetails = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('borrower', 'firstName lastName email')
      .populate('collateral')
      .populate('lender', 'firstName lastName email');

    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    // Check authorization
    if (
      loan.borrower.toString() !== req.user.id &&
      loan.lender?.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Not authorized to view this loan' });
    }

    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching loan details', message: error.message });
  }
};

export const approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    if (loan.status !== 'pending') {
      return res.status(400).json({ error: 'Loan is not in pending status' });
    }

    loan.status = 'approved';
    loan.approvalDate = new Date();
    await loan.save();

    res.json({ message: 'Loan approved successfully', loan });
  } catch (error) {
    res.status(500).json({ error: 'Error approving loan', message: error.message });
  }
};

export const rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    if (loan.status !== 'pending') {
      return res.status(400).json({ error: 'Loan is not in pending status' });
    }

    loan.status = 'rejected';
    await loan.save();

    // Release collateral
    const collateral = await Collateral.findById(loan.collateral);
    if (collateral) {
      collateral.status = 'released';
      collateral.loanAssociation = null;
      await collateral.save();
    }

    res.json({ message: 'Loan rejected successfully', loan });
  } catch (error) {
    res.status(500).json({ error: 'Error rejecting loan', message: error.message });
  }
};

export const makeLoanPayment = async (req, res) => {
  try {
    const { amount, bitcoinTxId } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    if (loan.borrower.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to make payment for this loan' });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      type: 'loan_repayment',
      amount,
      sender: req.user.id,
      recipient: loan.lender || process.env.PLATFORM_WALLET,
      loan: loan._id,
      bitcoinTxId,
      status: 'pending'
    });

    // Update loan balance (assume loan model handles repayment logic)
    const isFullyPaid = await loan.processPayment(amount, transaction._id);
    await loan.save();

    res.json({
      message: 'Payment processed successfully',
      transaction,
      loan,
      status: isFullyPaid ? 'Loan fully repaid' : 'Partial payment made'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error processing payment', message: error.message });
  }
};
