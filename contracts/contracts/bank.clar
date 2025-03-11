;; BITCOIN BANK MAIN CONTRACT

;; ERRORS
(define-constant BANK_ERR_ZERO-ADDRESS u104)         ;; error thrown for zero address
(define-constant BANK_ERR_ZERO-AMOUNT u105)          ;; error thrown for zero amount
(define-constant BANK_ERR_TRANSFER-FAILED u201)      ;; error thrown for failed transfer
(define-constant BANK_ERR_INVALID-INTEREST u301)     ;; error thrown for invalid interest rate
(define-constant BANK_ERR_INVALID-LOAN-TYPE u302)      ;; error thrown for invalid loan type
(define-constant BANK_ERR_INVALID-DEADLINE u303)       ;; error thrown for invalid deadline
(define-constant BANK_ERR_INSUFFICIENT-FUNDS u304)     ;; error when total funds are insufficient
(define-constant BANK_ERR_ONCHAIN_INSUFFICIENT-FUNDS u305)     ;; error when onchain balance 0 and calling withdraw for contract caller

;; CONSTANTS
(define-constant ZEROADDRESS 'SP000000000000000000002Q6VF78)  ;; zero address in Clarity
(define-constant BANK_LOAN_TYPE-EMI u001)            ;; for loan type EMI
(define-constant BANK_LOAN_TYPE-INDEPENDENT u002)      ;; for loan type independent

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


;;1 sBTC + (-0.5 + 0.5) = 1.5 

(define-map BANK_loan-details
    { loan_ID: uint }
    {
        lender: principal,
        borrower: principal,
        loanType: uint,
        amount: uint,
        deadline: uint,
        interestRate: uint,
        totalRepayement: uint
    }
)


;; PUBLIC FUNCTIONS

;; deposite function:- called by user to deposit the minted sBTC to the shown address.
;; Parameters:
;;   user_wallet   - wallet address shown in frontend.
;;   sBTC_amount   - amount of sBTC user wants to deposit (amount * (10^8)).
;; Functionality:
;;   - On-chain transaction: calls the token transfer.
;;   - Updates both the on-chain balance and the off-chain balance (making them consistent).
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

;; loan function:- called by lender to give a loan.
;; Parameters:
;;   borrower      - address of borrower.
;;   amount        - loaned amount.
;;   interestRate  - interest rate in percentage.
;;   loanType      - if loan is independent or EMI.
;;   deadline      - timestamp of deadline.
;;
;; Functionality:
;;   - Checks that the lenders total balance (on-chain + off-chain) is at least the loan amount.
;;   - Deducts the loan amount from the lenders off-chain balance (which can go negative).
;;   - Increases the borrower's off-chain balance by the loan amount.
(define-public (loan 
        (borrower principal)
        (amount uint)
        (interestRate uint)
        (loanType uint)
        (deadline uint)
    ) 
    (begin 
        (asserts! (not (is-eq borrower ZEROADDRESS)) (err BANK_ERR_ZERO-ADDRESS))
        (asserts! (not (is-eq amount u0)) (err BANK_ERR_ZERO-AMOUNT))
        (asserts! (and (> interestRate u5) (< interestRate u15)) (err BANK_ERR_INVALID-INTEREST))
        (asserts! (or (is-eq loanType BANK_LOAN_TYPE-EMI)
                      (is-eq loanType BANK_LOAN_TYPE-INDEPENDENT))
                  (err BANK_ERR_INVALID-LOAN-TYPE))
        (asserts! (not (is-eq deadline u0)) (err BANK_ERR_INVALID-DEADLINE))
        (let (
              ;; Convert loan amount to int for arithmetic.
              (loan-amount (to-int amount))
              (lender-total (total-balance contract-caller))
              (lender-offchain (default-to 0 (get balance (map-get? BANK_offchain-balance { owner: contract-caller }))))
              (borrower-offchain (default-to 0 (get balance (map-get? BANK_offchain-balance { owner: borrower }))))
         )
         (begin
            ;; Check that the lender's total balance is sufficient.
            (asserts! (>= lender-total loan-amount) (err BANK_ERR_INSUFFICIENT-FUNDS))
            ;; Update lender's off-chain balance by deducting the loan amount.
            (map-set BANK_offchain-balance
              { owner: contract-caller }
              { balance: (- lender-offchain loan-amount) }
            )
            ;; Update borrower's off-chain balance by adding the loan amount.
            (map-set BANK_offchain-balance
              { owner: borrower }
              { balance: (+ borrower-offchain loan-amount) }
            )
            (ok "Loan processed successfully")
         ))
    )
)



;; withdraw function: Transfers tokens from contract-caller's on-chain balance to the specified address.
;; checks:- 
;;  - the caller on-chain address will be greater than 0
;;  - amount withdraw can't be greate than total balance
(define-public (withdraw (to principal) (amount uint))
    (begin
        ;; Ensure the destination address and withdrawal amount are not zero.
        (asserts! (not (is-eq to ZEROADDRESS)) (err BANK_ERR_ZERO-ADDRESS))
        (asserts! (not (is-eq amount u0)) (err BANK_ERR_ZERO-AMOUNT))
        (let (
            (total-amount (total-balance contract-caller))
            (current-onchain (default-to u0 (get balance (map-get? BANK_onchain-balance { owner: contract-caller }))))
        )
          ;; Check that the caller's on-chain balance is not zero and sufficient.
          (asserts! (> current-onchain u0) (err BANK_ERR_ONCHAIN_INSUFFICIENT-FUNDS))
          (asserts! (> total-amount 0) (err BANK_ERR_INSUFFICIENT-FUNDS))
          (asserts! (>= total-amount (to-int amount)) (err BANK_ERR_INSUFFICIENT-FUNDS))
          ;; Update the on-chain balance by subtracting the withdrawn amount.
          (map-set BANK_onchain-balance
              { owner: contract-caller }
              { balance: (- current-onchain amount) }
          )
          ;; Transfer the tokens from contract-caller to the provided address.
          (unwrap!
              (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token
                  transfer 
                  amount 
                  contract-caller 
                  to 
                  (some 0x5749544844524157)  ;; "WITHDRAW" as a hex literal memo
              )
              (err BANK_ERR_TRANSFER-FAILED)
          )
          (ok "Withdraw successful")
        )
    )
)

;; READY ONLY FUNCTION

;; get-balance function: Returns the total balance (on-chain + off-chain) for any address.
(define-read-only (get-balance (who principal))
    (ok (total-balance who))
)

(define-read-only (get-onChain-balance (who principal)) 
    (map-get? BANK_onchain-balance {owner: who})
)

(define-read-only (get-offChain-balance (who principal)) 
    (map-get? BANK_offchain-balance {owner: who})
)
;; PRIVATE function

;; Returns the sum of the on-chain and off-chain balance for a given address.
(define-private (total-balance (who principal))
    (let (
          (onchain (to-int (default-to u0 (get balance (map-get? BANK_onchain-balance { owner: who })))))
          (offchain (default-to 0 (get balance (map-get? BANK_offchain-balance { owner: who }))))
         )
         (+ onchain offchain)
    )
)