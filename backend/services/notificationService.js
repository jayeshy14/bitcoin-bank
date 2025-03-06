import nodemailer from 'nodemailer';
import User from '../models/User.js';

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Replace with your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendLiquidationNotification = async (userId, loanId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Collateral Liquidation Notification',
      text: `Dear ${user.firstName},\n\nYour collateral for loan ID ${loanId} has been liquidated due to default. Please contact support for further assistance.\n\nBest regards,\nBitcoin Loan Bank`
    };

    await transporter.sendMail(mailOptions);
    console.log('Liquidation notification sent to:', user.email);
  } catch (error) {
    console.error('Error sending liquidation notification:', error);
  }
}; 