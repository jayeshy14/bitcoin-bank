;; BITCOIN BANK MAIN CONTRACT

;; ERRORS
(define-constant BANK_ERR_ZERO-ADDRESS u104)         ;; error thrown for zero address
(define-constant BANK_ERR_ZERO-AMOUNT u105)            ;; error thrown for zero amount
(define-constant BANK_ERR_ZERO-sBTC_PRICE u106)            ;; error thrown for zero amount
(define-constant BANK_ERR_ZERO-riskFactor u107)            ;; error thrown for zero amount
(define-constant BANK_ERR_ZERO-time u108)            ;; error thrown for zero amount
(define-constant BANK_ERR_TRANSFER-FAILED u201)        ;; error thrown for failed transfer
(define-constant BANK_ERR_INVALID-INTEREST u301)       ;; error thrown for invalid interest rate
(define-constant BANK_ERR_INVALID-LOAN-TYPE u302)      ;; error thrown for invalid loan type
(define-constant BANK_ERR_INVALID-DEADLINE u303)       ;; error thrown for invalid deadline
(define-constant BANK_ERR_INSUFFICIENT-FUNDS u304)     ;; error when total funds are insufficient
(define-constant BANK_ERR_ONCHAIN_INSUFFICIENT-FUNDS u305) ;; error when onchain balance 0 and calling withdraw for contract caller
(define-constant BANK_ERR_LOAN_ID u306) ;; error loanID

;; CONSTANTS
(define-constant ZEROADDRESS 'SP000000000000000000002Q6VF78)  ;; zero address in Clarity
(define-constant BANK_LOAN_TYPE-EMI u001)            ;; for loan type EMI
(define-constant BANK_LOAN_TYPE-INDEPENDENT u002)      ;; for loan type independent
;; Define a precision constant to simulate fixed point arithmetic (1.0 = PRECISION)
(define-constant PRECISION u10000)
(define-constant TOKEN_DECIMALS u100000000)
(define-constant MONTHS u12)

;; VARIABLES
(define-data-var loadID uint u0)

;; MAPPINGS
;; Both balances are stored as signed integers to allow off-chain balance to go negative.
(define-map BANK_onchain-balance
    { owner: principal }
    { balance: uint }
)

(define-map BANK_offchain-balance 
    { owner: principal } 
    { balance: int }
)

;; Loan details mapping. Note: All amounts are in INR and prices in INR per BTC.
(define-map BANK_loan-details
    { loan_ID: uint }
    {
        lender: principal,
        borrower: principal,
        loanType: uint,
        amount: uint,
        deadline: uint,
        interestRate: uint,
        totalRepayement: uint,
        priceAtLoanTime: uint,
        riskFactor: uint,
        timeInYear: uint
    }
)

;; PUBLIC FUNCTIONS

;; deposite function: called by user to deposit the minted sBTC to the shown address.
(define-public (deposite (user_wallet principal) (sBTC_amount uint))
    (begin
        (asserts! (not (is-eq user_wallet ZEROADDRESS)) (err BANK_ERR_ZERO-ADDRESS))
        (asserts! (not (is-eq sBTC_amount u0)) (err BANK_ERR_ZERO-AMOUNT))
        (let (
            (current-onchain (default-to u0 (get balance (map-get? BANK_onchain-balance { owner: contract-caller }))))
        )
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
            (ok "Deposite succesfull")
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
        (deadline uint)
        (priceAtloanTime uint)     ;; USD per BTC
        (riskFactor uint)
        (timeInYear uint)
    ) 
    (begin 
        (asserts! (not (is-eq borrower ZEROADDRESS)) (err BANK_ERR_ZERO-ADDRESS))
        (asserts! (not (is-eq amount u0)) (err BANK_ERR_ZERO-AMOUNT))
        (asserts! (not (is-eq priceAtloanTime u0)) (err BANK_ERR_ZERO-sBTC_PRICE))
        (asserts! (not (is-eq riskFactor u0)) (err BANK_ERR_ZERO-riskFactor))
        (asserts! (not (is-eq timeInYear u0)) (err BANK_ERR_ZERO-time))
        (asserts! (and (> interestRate u5) (< interestRate u15)) (err BANK_ERR_INVALID-INTEREST))
        (asserts! (or (is-eq loanType BANK_LOAN_TYPE-EMI)
                      (is-eq loanType BANK_LOAN_TYPE-INDEPENDENT))
                  (err BANK_ERR_INVALID-LOAN-TYPE))
        (asserts! (not (is-eq deadline u0)) (err BANK_ERR_INVALID-DEADLINE))
        (let (
              ;; Convert the amount from BTC to USD using priceAtloanTime.
              (loan-amount (/ (* amount priceAtloanTime) TOKEN_DECIMALS))
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
                {loan_ID: (var-get loadID)}
                {
                    lender: contract-caller,
                    borrower: borrower,
                    loanType: loanType,
                    amount: loan-amount,  ;; now stored in USD
                    deadline: deadline,
                    interestRate: interestRate,
                    totalRepayement: u0,
                    priceAtLoanTime: priceAtloanTime,
                    riskFactor: riskFactor,
                    timeInYear: timeInYear
                }
            )
            (var-set loadID (+ (var-get loadID) u1))
            (ok "Loan processed successfully")
         ))
    )
)



;; ---------------------------
;; Public function: repay
;; ---------------------------
;; ---------------------------
;; Private function: Core repayment calculation (returns EMI values)
;; ---------------------------
(define-private (calc-repayment-core (loan_ID uint) (currentPrice uint))
  (let ((loan-details (map-get? BANK_loan-details { loan_ID: loan_ID })))
    (match loan-details
      some-loan-data
        (let (
              (r_fp (/ (* (get interestRate some-loan-data) PRECISION) u100))             ;; r_fp = interest rate as fixed-point fraction
              (D (/ (* (get amount some-loan-data) (+ PRECISION r_fp)) PRECISION))          ;; D = L * (1 + r)
              (risk_fp (/ (* (get riskFactor some-loan-data) PRECISION) u100))              ;; risk factor as fixed-point fraction (e.g. 50 -> 0.5)
              (months (* (get timeInYear some-loan-data) MONTHS))                           ;; total number of months
              (BTC_FIXED (/ (* risk_fp D TOKEN_DECIMALS)
                            (* PRECISION (get priceAtLoanTime some-loan-data))))           ;; BTC_FIXED in satoshis
              (BTC_VARIABLE (/ (* (- PRECISION risk_fp) D TOKEN_DECIMALS)
                               (* PRECISION currentPrice)))                         ;; BTC_VARIABLE in satoshis
              (BTC_FIXED_EMI (/ BTC_FIXED months))                                   ;; Monthly fixed BTC EMI (satoshis)
              (BTC_VARIABLE_EMI (/ BTC_VARIABLE months))                             ;; Monthly variable BTC EMI (satoshis)
              (total_EMI_USD (/ (* (+ BTC_FIXED_EMI BTC_VARIABLE_EMI) currentPrice)
                                TOKEN_DECIMALS))                                  ;; Monthly EMI in USD
             )
          (ok { BTC_FIXED_EMI: BTC_FIXED_EMI,
                BTC_VARIABLE_EMI: BTC_VARIABLE_EMI,
                total_EMI_USD: total_EMI_USD }))
      (err "Loan not found")
    )
  )
)

;; ---------------------------
;; Read-only function: calculate-repayment
;; ---------------------------
(define-read-only (calculate-repayment (loan_ID uint) (currentPrice uint))
  (calc-repayment-core loan_ID currentPrice)
)

;; ---------------------------
;; Public function: repay
;; ---------------------------
(define-public (repay (loanID uint) (current-price uint))
  (let (
        (calc-response (unwrap! (calc-repayment-core loanID current-price)
                                 (err "Repayment calculation failed")))
       )
    (match (map-get? BANK_loan-details { loan_ID: loanID })
      some-loan-data
        (let (
              (repaymentTotal (+ (get BTC_FIXED_EMI calc-response)
                                 (get BTC_VARIABLE_EMI calc-response)))  ;; Total installment in satoshis
              (lender (get lender some-loan-data))
              (borrower (get borrower some-loan-data))
              (prevTotalRepayment (get totalRepayement some-loan-data))
              (borrowerOff (default-to 0 (get balance (map-get? BANK_offchain-balance { owner: borrower }))))
              (lenderOff (default-to 0 (get balance (map-get? BANK_offchain-balance { owner: lender }))))
             )
          (asserts! (>= borrowerOff (to-int repaymentTotal)) (err "BANK_ERR_INSUFFICIENT-FUNDS"))
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
      (err "Loan not found")
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
    (map-get? BANK_loan-details {loan_ID: loanId})
)

;; ---------------------------
;; Read-only function: calculate-repayment
;; ---------------------------


;; calculate-repayemnt function: Calculates the monthly EMI repayment in sBTC for a given loan.
;;
;; Formula:
;;   D = (1 + r) * L
;;   BTC_fixed = (riskFactor / 100) * (D / Po)
;;   BTC_variable = (1 - (riskFactor / 100)) * (D / currentPrice)
;;   BTC_total = BTC_fixed + BTC_variable
;;   EMI_BTC = BTC_total / (timeInYear * 12)
;;
;; Note: All division here is integer division. In practice, you may need to use a fixed point arithmetic
;; approach to preserve precision.




;; PRIVATE FUNCTIONS

;; Returns the total balance (on-chain + off-chain) for a given address.
(define-private (total-balance (who principal))
  (let (
        (onchain (to-int (default-to u0 (get balance (map-get? BANK_onchain-balance { owner: who })))))
        (offchain (default-to 0 (get balance (map-get? BANK_offchain-balance { owner: who }))))
        )
    (+ onchain offchain)
  )
)

(define-read-only (risk-fixed (risk uint))
  ;; Convert a percentage risk factor into fixed point (e.g., 50 -> 5000 for 0.50)
  (/ (* risk PRECISION) u100)
)

