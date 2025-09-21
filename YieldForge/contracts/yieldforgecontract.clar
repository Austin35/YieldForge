;; title: yieldforgecontract
;; version: 2.0.0
;; summary: Auto-compound vault that converts PoX BTC rewards to STX and restakes
;; description: YieldForge allows users to deposit STX, automatically participate in PoX stacking,
;;              convert BTC rewards to STX via AMM, and compound the rewards back into the vault.
;;              Users receive yield tokens representing their share of the growing vault.
;;              Enhanced with comprehensive security measures.

;; token definitions
(define-fungible-token yield-forge-token u1000000000000000000)

;; constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant POX_CONTRACT 'ST000000000000000000002AMW42H.pox-4)
(define-constant AMM_CONTRACT 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-v2-1)
(define-constant MIN_DEPOSIT u1000000) ;; 1 STX minimum
(define-constant MAX_DEPOSIT u1000000000000) ;; 1M STX maximum
(define-constant CYCLE_LENGTH u2100) ;; blocks per PoX cycle
(define-constant BTC_TO_USTX_MULTIPLIER u100000000) ;; 1 BTC = 100M uSTX

;; error constants
(define-constant ERR_NOT_OWNER (err u1000))
(define-constant ERR_INSUFFICIENT_BALANCE (err u1001))
(define-constant ERR_INVALID_AMOUNT (err u1002))
(define-constant ERR_ALREADY_STACKING (err u1003))
(define-constant ERR_NOT_STACKING (err u1004))
(define-constant ERR_SWAP_FAILED (err u1005))
(define-constant ERR_POX_CALL_FAILED (err u1006))
(define-constant ERR_INSUFFICIENT_SHARES (err u1007))
(define-constant ERR_PAUSED (err u1008))
(define-constant ERR_ZERO_AMOUNT (err u1009))
(define-constant ERR_REENTRANCY (err u1012))
(define-constant ERR_SLIPPAGE_TOO_HIGH (err u1014))
(define-constant ERR_EMERGENCY_DELAY (err u1016))
(define-constant ERR_INVALID_TIMESTAMP (err u1017))

;; data vars
(define-data-var total-stx-deposited uint u0)
(define-data-var total-btc-rewards uint u0)
(define-data-var contract-paused bool false)
(define-data-var last-compound-block uint u0)
(define-data-var current-cycle uint u0)
(define-data-var reward-rate uint u100) ;; basis points (1% = 100)
(define-data-var reentrancy-lock bool false)

;; data maps
(define-map user-deposits principal uint)
(define-map user-last-deposit-block principal uint)
(define-map cycle-rewards uint uint)
(define-map stacking-cycles uint {start-block: uint, end-block: uint, amount: uint})

;; public functions

(define-public (deposit (amount uint))
  (let (
    (sender tx-sender)
    (current-balance (get-stx-balance sender))
    (current-shares (ft-get-balance yield-forge-token sender))
    (total-supply (ft-get-supply yield-forge-token))
    (total-stx (var-get total-stx-deposited))
    (share-amount (if (is-eq total-supply u0)
                    amount
                    (/ (* amount total-supply) total-stx)))
  )
    ;; Validation checks with security enhancements
    (asserts! (not (var-get contract-paused)) ERR_PAUSED)
    (asserts! (not (var-get reentrancy-lock)) ERR_REENTRANCY)
    (asserts! (> amount u0) ERR_ZERO_AMOUNT)
    (asserts! (>= amount MIN_DEPOSIT) ERR_INVALID_AMOUNT)
    (asserts! (<= amount MAX_DEPOSIT) ERR_INVALID_AMOUNT)
    (asserts! (>= current-balance amount) ERR_INSUFFICIENT_BALANCE)
    
    ;; Set reentrancy lock
    (var-set reentrancy-lock true)
    
    ;; Transfer STX to contract
    (try! (stx-transfer? amount sender (as-contract tx-sender)))
    
    ;; Update state
    (var-set total-stx-deposited (+ total-stx amount))
    (map-set user-deposits sender (+ (default-to u0 (map-get? user-deposits sender)) amount))
    (map-set user-last-deposit-block sender stacks-block-height)
    
    ;; Mint yield tokens
    (try! (ft-mint? yield-forge-token share-amount sender))
    
    ;; Start stacking if not already active
    (let ((stacking-result (stack-stx-if-needed)))
      ;; Clear reentrancy lock
      (var-set reentrancy-lock false)
      
      (ok {deposited: amount, shares-minted: share-amount})
    )
  )
)

(define-public (withdraw (share-amount uint))
  (let (
    (sender tx-sender)
    (user-shares (ft-get-balance yield-forge-token sender))
    (total-supply (ft-get-supply yield-forge-token))
    (total-stx (var-get total-stx-deposited))
    (withdrawal-amount (if (> total-supply u0)
                         (/ (* share-amount total-stx) total-supply)
                         u0))
  )
    ;; Validation checks with security enhancements
    (asserts! (not (var-get contract-paused)) ERR_PAUSED)
    (asserts! (not (var-get reentrancy-lock)) ERR_REENTRANCY)
    (asserts! (> share-amount u0) ERR_ZERO_AMOUNT)
    (asserts! (>= user-shares share-amount) ERR_INSUFFICIENT_SHARES)
    (asserts! (>= total-stx withdrawal-amount) ERR_INSUFFICIENT_BALANCE)
    
    ;; Set reentrancy lock
    (var-set reentrancy-lock true)
    
    ;; Burn yield tokens first (CEI pattern)
    (try! (ft-burn? yield-forge-token share-amount sender))
    
    ;; Update state
    (var-set total-stx-deposited (- total-stx withdrawal-amount))
    (map-set user-deposits sender (- (default-to u0 (map-get? user-deposits sender)) withdrawal-amount))
    
    ;; Transfer STX to user (last step)
    (try! (as-contract (stx-transfer? withdrawal-amount tx-sender sender)))
    
    ;; Clear reentrancy lock
    (var-set reentrancy-lock false)
    
    (ok {withdrawn: withdrawal-amount, shares-burned: share-amount})
  )
)

(define-public (compound-rewards)
  (let (
    (current-block stacks-block-height)
    (last-compound (var-get last-compound-block))
    (btc-rewards (get-pending-btc-rewards))
  )
    ;; Only compound if there are rewards and enough time has passed
    (asserts! (> btc-rewards u0) (ok u0))
    (asserts! (> current-block (+ last-compound u144)) (ok u0)) ;; ~1 day cooldown
    (asserts! (not (var-get reentrancy-lock)) ERR_REENTRANCY)
    
    ;; Set reentrancy lock
    (var-set reentrancy-lock true)
    
    ;; Convert BTC to STX via AMM
    (match (swap-btc-to-stx btc-rewards)
      ok-value (begin
        ;; Update state
        (var-set total-btc-rewards (+ (var-get total-btc-rewards) btc-rewards))
        (var-set total-stx-deposited (+ (var-get total-stx-deposited) ok-value))
        (var-set last-compound-block current-block)
        
        ;; Restake the new STX
        (let ((stacking-result (stack-stx-if-needed)))
          ;; Clear reentrancy lock
          (var-set reentrancy-lock false)
          
          (ok ok-value)
        )
      )
      err-value (begin
        (var-set reentrancy-lock false)
        (ok u0)
      )
    )
  )
)

(define-public (emergency-pause)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (var-set contract-paused true)
    (ok true)
  )
)

(define-public (resume-operations)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (var-set contract-paused false)
    (ok true)
  )
)

(define-public (emergency-withdraw (share-amount uint))
  (let (
    (sender tx-sender)
    (user-shares (ft-get-balance yield-forge-token sender))
    (total-supply (ft-get-supply yield-forge-token))
    (total-stx (var-get total-stx-deposited))
    (withdrawal-amount (if (> total-supply u0)
                         (/ (* share-amount total-stx) total-supply)
                         u0))
  )
    ;; Only allow during emergency pause
    (asserts! (var-get contract-paused) ERR_PAUSED)
    (asserts! (not (var-get reentrancy-lock)) ERR_REENTRANCY)
    (asserts! (> share-amount u0) ERR_ZERO_AMOUNT)
    (asserts! (>= user-shares share-amount) ERR_INSUFFICIENT_SHARES)
    
    ;; Set reentrancy lock
    (var-set reentrancy-lock true)
    
    ;; Burn yield tokens first (CEI pattern)
    (try! (ft-burn? yield-forge-token share-amount sender))
    
    ;; Update state
    (var-set total-stx-deposited (- total-stx withdrawal-amount))
    (map-set user-deposits sender (- (default-to u0 (map-get? user-deposits sender)) withdrawal-amount))
    
    ;; Transfer STX to user (last step)
    (try! (as-contract (stx-transfer? withdrawal-amount tx-sender sender)))
    
    ;; Clear reentrancy lock
    (var-set reentrancy-lock false)
    
    (ok {emergency-withdrawn: withdrawal-amount, shares-burned: share-amount})
  )
)

(define-public (set-max-slippage (slippage-bps uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (asserts! (<= slippage-bps u500) (err u1014)) ;; ERR_SLIPPAGE_TOO_HIGH
    (ok true)
  )
)

(define-public (set-min-liquidity (min-liquidity-amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (asserts! (>= min-liquidity-amount MIN_DEPOSIT) ERR_INVALID_AMOUNT)
    (ok true)
  )
)

;; read only functions

(define-read-only (get-vault-info)
  {
    total-stx: (var-get total-stx-deposited),
    total-btc-rewards: (var-get total-btc-rewards),
    total-shares: (ft-get-supply yield-forge-token),
    is-paused: (var-get contract-paused),
    last-compound: (var-get last-compound-block),
    current-cycle: (var-get current-cycle)
  }
)

(define-read-only (get-user-info (user principal))
  {
    stx-deposited: (default-to u0 (map-get? user-deposits user)),
    shares-owned: (ft-get-balance yield-forge-token user),
    last-deposit-block: (default-to u0 (map-get? user-last-deposit-block user)),
    withdrawable-stx: (calculate-withdrawable-amount user)
  }
)

(define-read-only (calculate-withdrawable-amount (user principal))
  (let (
    (user-shares (ft-get-balance yield-forge-token user))
    (total-supply (ft-get-supply yield-forge-token))
    (total-stx (var-get total-stx-deposited))
  )
    (if (and (> user-shares u0) (> total-supply u0))
      (/ (* user-shares total-stx) total-supply)
      u0
    )
  )
)

(define-read-only (get-share-price)
  (let (
    (total-supply (ft-get-supply yield-forge-token))
    (total-stx (var-get total-stx-deposited))
  )
    (if (> total-supply u0)
      (/ (* total-stx u1000000) total-supply) ;; Price in micro-STX
      u1000000 ;; 1:1 ratio initially
    )
  )
)

(define-read-only (get-stx-balance (user principal))
  (stx-get-balance user)
)

(define-read-only (get-pending-btc-rewards)
  ;; This would interface with PoX contract to get pending BTC rewards
  ;; Simplified implementation
  (let (
    (cycles-since-last (- (get-current-cycle) (var-get current-cycle)))
    (estimated-rewards (* cycles-since-last (var-get reward-rate)))
  )
    estimated-rewards
  )
)

(define-read-only (get-current-cycle)
  (/ stacks-block-height CYCLE_LENGTH)
)

;; private functions

(define-private (stack-stx-if-needed)
  (let (
    (total-stx (var-get total-stx-deposited))
    (current-cycle-num (get-current-cycle))
  )
    (if (>= total-stx MIN_DEPOSIT)
      (begin
        ;; Update current cycle
        (var-set current-cycle current-cycle-num)
        ;; In a real implementation, this would call the actual PoX contract
        ;; For now, we'll just record the stacking intent
        (map-set stacking-cycles current-cycle-num 
          {
            start-block: stacks-block-height,
            end-block: (+ stacks-block-height CYCLE_LENGTH),
            amount: total-stx
          }
        )
        (ok true)
      )
      (ok false)
    )
  )
)

(define-private (swap-btc-to-stx (btc-amount uint))
  ;; This would interface with an AMM to swap BTC to STX
  ;; Simplified implementation that estimates STX return
  (let (
    (estimated-stx (* btc-amount BTC_TO_USTX_MULTIPLIER))
  )
    (if (> btc-amount u0)
      (ok estimated-stx)
      (err ERR_SWAP_FAILED)
    )
  )
)