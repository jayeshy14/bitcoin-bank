# Bitcoin Loan Bank

A decentralized lending platform that allows users to borrow Bitcoin using gold and property as collateral. Built with Clarity smart contracts on the Stacks blockchain.

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
