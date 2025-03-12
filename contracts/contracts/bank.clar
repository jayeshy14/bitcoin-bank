;; BITCOIN BANK MAIN CONTRACT

;; ERRORS
(define-constant BANK_ERR_ZERO-ADDRESS u104)         ;; error thrown for zero address
(define-constant BANK_ERR_ZERO-AMOUNT u105)            ;; error thrown for zero amount
(define-constant BANK_ERR_ZERO-sBTC_PRICE u106)        ;; error thrown for zero sBTC price
(define-constant BANK_ERR_ZERO-riskFactor u107)        ;; error thrown for zero risk factor
(define-constant BANK_ERR_ZERO-time u108)              ;; error thrown for zero time
(define-constant BANK_ERR_TRANSFER-FAILED u201)        ;; error thrown for failed transfer
(define-constant BANK_ERR_INVALID-INTEREST u301)       ;; error thrown for invalid interest rate
(define-constant BANK_ERR_INVALID-LOAN-TYPE u302)      ;; error thrown for invalid loan type
(define-constant BANK_ERR_INVALID-DEADLINE u303)       ;; error thrown for invalid deadline
(define-constant BANK_ERR_INSUFFICIENT-FUNDS u304)     ;; error when total funds are insufficient
(define-constant BANK_ERR_ONCHAIN_INSUFFICIENT-FUNDS u305) ;; error when onchain balance is 0 and withdraw is attempted
(define-constant BANK_ERR_LOAN_ID u306)                ;; error for invalid loan ID

;; CONSTANTS
(define-constant ZEROADDRESS 'SP000000000000000000002Q6VF78)  ;; zero address in Clarity
(define-constant BANK_LOAN_TYPE-EMI u001)            ;; loan type EMI
(define-constant BANK_LOAN_TYPE-INDEPENDENT u002)      ;; loan type independent
(define-constant TOKEN_DECIMALS u100000000)

;; VARIABLES
(define-data-var loadID uint u0)

;; MAPPINGS
;; On-chain balance is stored as unsigned integer.
(define-map BANK_onchain-balance
    { owner: principal }
    { balance: uint }
)

;; Off-chain balance is stored as signed integer (to allow negatives).
(define-map BANK_offchain-balance 
    { owner: principal } 
    { balance: int }
)

;; Loan details mapping. All amounts are in INR and prices in INR per BTC.
(define-map BANK_loan-details
    { loan_ID: uint }
    {
        lender: principal,
        borrower: principal,
        loanType: uint,
        amount: uint,
        interestRate: uint,
        totalRepayement: uint,
        priceAtLoanTime: uint,
        riskFactor: uint,
        timeInMonth: uint
    }
)

;; PUBLIC FUNCTIONS

;; deposit function: called by user to deposit minted sBTC to the specified address.
(define-public (deposit (user_wallet principal) (sBTC_amount uint))
    (begin
        (asserts! (not (is-eq user_wallet ZEROADDRESS)) (err BANK_ERR_ZERO-ADDRESS))
        (asserts! (not (is-eq sBTC_amount u0)) (err BANK_ERR_ZERO-AMOUNT))
        (let ((current-onchain (default-to u0 (get balance (map-get? BANK_onchain-balance { owner: contract-caller })))))
          (begin
            (unwrap!
              (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token
                transfer 
                sBTC_amount 
                contract-caller 
                user_wallet 
                (some 0x42414e4b5f4445504f53495445)  ;; "BANK_DEPOSITE" as hex memo
              )
              (err BANK_ERR_TRANSFER-FAILED)
            )
            (map-set BANK_onchain-balance
              { owner: user_wallet }
              { balance: (+ current-onchain sBTC_amount) }
            )
            (ok "Deposit successful")
          )
        )
    )
)

;; loan function: called by lender to give a loan.
(define-public (loan 
        (borrower principal)
        (amount uint)              ;; amount in BTC
        (interestRate uint)
        (loanType uint)
        (priceAtLoanTime uint)     ;; USD per BTC
        (riskFactor uint)
        (timeInMonth uint)
    ) 
    (begin 
        (asserts! (not (is-eq borrower ZEROADDRESS)) (err BANK_ERR_ZERO-ADDRESS))
        (asserts! (not (is-eq amount u0)) (err BANK_ERR_ZERO-AMOUNT))
        (asserts! (not (is-eq priceAtLoanTime u0)) (err BANK_ERR_ZERO-sBTC_PRICE))
        (asserts! (not (is-eq riskFactor u0)) (err BANK_ERR_ZERO-riskFactor))
        (asserts! (not (is-eq timeInMonth u0)) (err BANK_ERR_ZERO-time))
        (asserts! (and (>= interestRate u1) (<= interestRate u5)) (err BANK_ERR_INVALID-INTEREST))
        (asserts! (or (is-eq loanType BANK_LOAN_TYPE-EMI)
                      (is-eq loanType BANK_LOAN_TYPE-INDEPENDENT))
                  (err BANK_ERR_INVALID-LOAN-TYPE))
        (let (
              ;; Convert the amount from BTC to USD using priceAtLoanTime.
              (loan-amount (/ (* amount priceAtLoanTime) TOKEN_DECIMALS))
              (lender-total (total-balance contract-caller))
              (lender-offchain (default-to 0 (get balance (map-get? BANK_offchain-balance { owner: contract-caller }))))
              (borrower-offchain (default-to 0 (get balance (map-get? BANK_offchain-balance { owner: borrower }))))
         )
         (begin
            (asserts! (>= lender-total (to-int amount)) (err BANK_ERR_INSUFFICIENT-FUNDS))
            (map-set BANK_offchain-balance
              { owner: contract-caller }
              { balance: (- lender-offchain (to-int amount)) }
            )
            (map-set BANK_offchain-balance
              { owner: borrower }
              { balance: (+ borrower-offchain (to-int amount)) }
            )
            (map-set BANK_loan-details
                { loan_ID: (var-get loadID) }
                {
                    lender: contract-caller,
                    borrower: borrower,
                    loanType: loanType,
                    amount: loan-amount,  ;; Stored in USD
                    interestRate: interestRate,
                    totalRepayement: u0,
                    priceAtLoanTime: priceAtLoanTime,
                    riskFactor: riskFactor,
                    timeInMonth: timeInMonth
                }
            )
            (var-set loadID (+ (var-get loadID) u1))
            (ok "Loan processed successfully")
         ))
    )
)

;; repay function: called to process a loan repayment.
(define-public (repay (loanID uint) (current-price uint) (repaymentTotal uint))
  ;; Valid loan IDs are less than the current loadID.
  (begin 
    (asserts! (< loanID (var-get loadID)) (err BANK_ERR_LOAN_ID))
    (match (map-get? BANK_loan-details { loan_ID: loanID })
      some-loan-data
        (let (
              (lender (get lender some-loan-data))
              (borrower (get borrower some-loan-data))
              (prevTotalRepayment (get totalRepayement some-loan-data))
              (borrowerOff (default-to 0 (get balance (map-get? BANK_offchain-balance { owner: borrower }))))
              (lenderOff (default-to 0 (get balance (map-get? BANK_offchain-balance { owner: lender }))))
              )
          (asserts! (>= borrowerOff (to-int repaymentTotal)) (err BANK_ERR_INSUFFICIENT-FUNDS))
          ;; Subtract repayment from borrower's off-chain balance
          (map-set BANK_offchain-balance { owner: borrower }
            { balance: (- borrowerOff (to-int repaymentTotal)) })
          ;; Add repayment to lender's off-chain balance
          (map-set BANK_offchain-balance { owner: lender }
            { balance: (+ lenderOff (to-int repaymentTotal)) })
          ;; Update total repayment in the loan details
          (map-set BANK_loan-details { loan_ID: loanID }
            (merge some-loan-data { totalRepayement: (+ prevTotalRepayment repaymentTotal) }))
          (ok "Repayment processed successfully")
        )
      (err BANK_ERR_LOAN_ID)
    )
  )
)

;; withdraw function: Transfers tokens from contract-caller's on-chain balance.
(define-public (withdraw (to principal) (amount uint))
    (begin
        (asserts! (not (is-eq to ZEROADDRESS)) (err BANK_ERR_ZERO-ADDRESS))
        (asserts! (not (is-eq amount u0)) (err BANK_ERR_ZERO-AMOUNT))
        (let (
            (total-amount (total-balance contract-caller))
            (current-onchain (default-to u0 (get balance (map-get? BANK_onchain-balance { owner: contract-caller }))))
        )
          (asserts! (> current-onchain u0) (err BANK_ERR_ONCHAIN_INSUFFICIENT-FUNDS))
          (asserts! (> total-amount 0) (err BANK_ERR_INSUFFICIENT-FUNDS))
          (asserts! (>= total-amount (to-int amount)) (err BANK_ERR_INSUFFICIENT-FUNDS))
          (map-set BANK_onchain-balance
              { owner: contract-caller }
              { balance: (- current-onchain amount) }
          )
          (unwrap!
              (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token
                  transfer 
                  amount 
                  contract-caller 
                  to 
                  (some 0x5749544844524157)  ;; "WITHDRAW" as hex memo
              )
              (err BANK_ERR_TRANSFER-FAILED)
          )
          (ok "Withdraw successful")
        )
    )
)

;; READ-ONLY FUNCTIONS

(define-read-only (get-balance (who principal))
    (ok (total-balance who))
)

(define-read-only (get-onChain-balance (who principal)) 
    (map-get? BANK_onchain-balance { owner: who })
)

(define-read-only (get-offChain-balance (who principal)) 
    (map-get? BANK_offchain-balance { owner: who })
)

(define-read-only (get-total-loan-Id)
    (var-get loadID)
)

(define-read-only (get-by-loan-Id (loanId uint))
    (map-get? BANK_loan-details { loan_ID: loanId })
)

;; PRIVATE FUNCTION

;; Returns the total balance (on-chain + off-chain) for a given address.
(define-private (total-balance (who principal))
  (let (
        (onchain (to-int (default-to u0 (get balance (map-get? BANK_onchain-balance { owner: who })))))
        (offchain (default-to 0 (get balance (map-get? BANK_offchain-balance { owner: who }))))
        )
    (+ onchain offchain)
  )
)
