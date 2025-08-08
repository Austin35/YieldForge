;; title: yieldforgecontract
;; version: 1.0.0
;; summary: Auto-compound vault that converts PoX BTC rewards to STX and restakes
;; description: YieldForge allows users to deposit STX, automatically participate in PoX stacking,
;;              convert BTC rewards to STX via AMM, and compound the rewards back into the vault.
;;              Users receive yield tokens representing their share of the growing vault.

;; traits
(use-trait ft-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)
(use-trait pox-trait 'ST000000000000000000002AMW42H.pox-4.pox-trait)

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

;; data vars
(define-data-var total-stx-deposited uint u0)
(define-data-var total-btc-rewards uint u0)
(define-data-var contract-paused bool false)
(define-data-var last-compound-block uint u0)
(define-data-var current-cycle uint u0)
(define-data-var reward-rate uint u100) ;; basis points (1% = 100)

;; data maps
(define-map user-deposits principal uint)
(define-map user-last-deposit-block principal uint)
(define-map cycle-rewards uint uint)
(define-map stacking-cycles uint {start-block: uint, end-block: uint, amount: uint})
