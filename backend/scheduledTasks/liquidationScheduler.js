import { monitorLoansForLiquidation } from '../services/liquidationService.js';

const scheduleLiquidationMonitoring = () => {
  // Run the monitoring function every hour
  setInterval(async () => {
    console.log('Checking for loans to liquidate...');
    await monitorLoansForLiquidation();
  }, 3600000); // 3600000 ms = 1 hour
};

export default scheduleLiquidationMonitoring; 