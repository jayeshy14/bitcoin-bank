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

export const getMyPendingApplicationsApi =  async(req, res) => {
  try {
    const loanApplications = await LoanApplication.find({borrower: req.user.id, status: pending})
    .sort('-createdAt');
    res.json(loanApplications);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching pending applications',
      message: error.message
    })
  }
}