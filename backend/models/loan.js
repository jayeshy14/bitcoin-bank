import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
    lenderUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    borrowerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    loanId: { 
        type: Number,
        unique: true,
        required: true
    },
    borrower: { 
        type: String,
        required: true
    },
    principalBtc: { 
        type: Number,
        required: true
    },
    interestRate: { 
        type: Number,
        required: true
    },
    loanType: { 
        type: Number,
        required: true
    },
    priceAtLoanTime: { 
        type: Number,
        required: true
    },
    riskFactor: { 
        type: Number,
        required: true
    },
    timeInMonth: { 
        type: Number,
        required: true
    },
    collateralType: { 
        type: Number,
        required: true
    },
    collateralValue: { 
        type: Number,
        required: true
    },
    collateralId: { 
        type: String,
        required: true,
        maxlength: 50
    },
    nextDueDate: { 
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        maxlength: 50,
        enum: ["open", "closed"]
    },
    createdAt: { 
        type: Date,
        default: Date.now
    }
});


loanSchema.methods.calculateNextDueDate = function () {
    let nextDue = new Date(this.nextDueDate);

    // Move to the next month
    nextDue.setMonth(nextDue.getMonth() + 1);

    // Ensure due date is between 1st and 5th of next month
    if (nextDue.getDate() > 5) {
        nextDue.setDate(5);
    } else if (nextDue.getDate() < 1) {
        nextDue.setDate(1);
    }

    return nextDue;
};

loanSchema.methods.calculateLateFee = function (currentDate) {
    if (!this.nextDueDate || currentDate <= this.nextDueDate) {
        return 0; // No late fee if paid on time
    }

    const daysLate = Math.floor((currentDate - this.nextDueDate) / (1000 * 60 * 60 * 24));
    const gracePeriod = 3; // 3-day grace period
    const penaltyRate = 0.02; // 2% of EMI per day after grace period

    if (daysLate <= gracePeriod) return 0;

    const lateDays = daysLate - gracePeriod;
    const emi = getEmi(
        this.principalBtc,
        this.priceAtLoanTime,
        this.interestRate,
        this.riskFactor,
        this.timeInMonth,
        this.collateralValue
    );

    return lateDays * penaltyRate * emi; // Late fee calculation
};


const Loan = mongoose.model('Loan', loanSchema);
export default Loan;
