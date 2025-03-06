import Loan from '../models/Loan.js';
import Collateral from '../models/Collateral.js';
import { sendLiquidationNotification } from './notificationService.js';

export const monitorLoansForLiquidation = async () => {
  try {
    const loans = await Loan.find({ status: 'active' });
    const currentDate = new Date();

    for (const loan of loans) {
      // Check if the loan is in default
      if (loan.dueDate < currentDate) {
        // Trigger liquidation process
        await liquidateCollateral(loan);
      }
    }
  } catch (error) {
    console.error('Error monitoring loans for liquidation:', error);
  }
};

const liquidateCollateral = async (loan) => {
  try {
    // Find the collateral associated with the loan
    const collateral = await Collateral.findById(loan.collateral);
    if (collateral) {
      // Update collateral status to liquidated
      collateral.status = 'liquidated';
      await collateral.save();

      // Notify the user about the liquidation
      await sendLiquidationNotification(collateral.owner, loan._id);

      console.log(`Collateral for loan ${loan._id} has been liquidated.`);
    }
  } catch (error) {
    console.error('Error liquidating collateral:', error);
  }
}; 