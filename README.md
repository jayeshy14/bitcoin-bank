# Bitcoin Loan Bank

## Overview
Our centralized P2P lending platform allows users to borrow Bitcoin by using gold or property as collateral. The platform is built on the Stacks blockchain using Clarity smart contracts, ensuring transparency and security

## Repayment Mechanism
To mitigate Bitcoin's price volatility, our repayment system employs a risk-adjusted model that splits the loan into fixed and variable BTC portions based on a risk percentage (α).

## Loan Structure & Interest Calculation
The borrower receives a BTC loan, and its USD equivalent is determined at issuance.
Interest is compounded monthly over the loan period.

## Risk-Adjusted Repayment (α-Split Model)

The repayment amount is divided into:

Fixed BTC Portion (α% of the loan in USD)
This portion is locked in BTC at the original BTC/USD price.
Interest is applied in BTC terms, keeping the borrower’s obligation stable.
Variable BTC Portion ((1-α)% of the loan in USD)
This portion accrues interest in USD terms and is converted to BTC at the repayment-time BTC/USD rate.

## Advantages of This Model
- Protects lenders from BTC price drops by maintaining a USD-pegged portion.
- Gives borrowers stability with a fixed BTC obligation while allowing them to benefit from BTC price appreciation.
- Ensures fair interest application on both fixed and variable portions.

This approach creates a balanced and secure lending system, making Bitcoin-backed loans more practical and sustainable. 🚀



## Features

- 🏦 Borrow Bitcoin against physical collateral (Gold and Property)
- 💰 Lend Bitcoin and earn interest
- 📊 Real-time loan management and tracking
- 🔐 Secure wallet integration
- 💱 Automatic EMI calculations
- 📈 Real-time BTC price integration
- 🏠 Property and Gold valuation system

## Tech Stack

- **Frontend**: React.js with TailwindCSS
- **Backend**: Node.js with Express
- **Smart Contracts**: Clarity (Stacks blockchain)
- **Database**: MongoDB
- **APIs**: 
  - CoinMarketCap for BTC prices
  - Metal Price API for gold rates
  - Custom property valuation system

## Prerequisites

- Node.js (v22 or higher)
- MongoDB
- Rust (for EMI calculator module)
- Clarinet (for Clarity smart contract development)
- Docker (for running Clarinet Devnet)
- API Keys:
  - CoinMarketCap API key
  - Metal Price API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jayeshy14/bitcoin-loan-bank.git
cd bitcoin-loan-bank
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

Create a `.env` file in the backend directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
METAL_PRICE_API_KEY=your_metal_price_api_key
```

4. Set up the smart contract:
```bash
cd contracts
npm install
clarinet devnet start
```

```bash
clarinet deployments apply --devnet
 //(agree for both deployments)
node scripts/token-setup.js
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## Smart Contract Functions

- `deposit`: Deposit BTC into the contract
- `loan`: Issue a loan with collateral
- `repay`: Make loan repayments
- `withdraw`: Withdraw BTC from the contract
- `close-loan`: Close an active loan
- `open-loan`: Reopen a closed loan

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `GET /api/auth/me`: Get current user

### Loans
- `POST /api/loans/apply`: Create loan application
- `GET /api/loans/my-applications`: Get user's pending applications
- `GET /api/loans/my-active-loans`: Get user's active loans
- `GET /api/loans/my-closed-loans`: Get user's closed loans
- `POST /api/loans/calculate_emi/:id`: Calculate EMI for a loan

### Collateral
- `POST /api/collateral/create`: Create new collateral
- `GET /api/collateral/my-collaterals`: Get user's collaterals
- `DELETE /api/collateral/remove/:id`: Remove collateral
