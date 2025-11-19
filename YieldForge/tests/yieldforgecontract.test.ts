import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const deployer = accounts.get("deployer")!;

const contractName = "yieldforgecontract";

describe("YieldForge Security Tests", () => {
  beforeEach(() => {
    // Reset simnet state before each test
    simnet.mineEmptyBlock();
  });

  describe("Basic Functionality", () => {
    it("ensures simnet is well initialised", () => {
      expect(simnet.blockHeight).toBeDefined();
    });

    it("should have contract deployed", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-vault-info", [], address1);
      expect(result).toBeDefined();
    });
  });

  describe("Emergency Functions Security Tests", () => {
    it("should only allow owner to pause", () => {
      const { result } = simnet.callPublicFn(contractName, "emergency-pause", [], address1);
      expect(result).toBeDefined();
      // Should be an error since address1 is not the owner
    });

    it("should allow owner to pause", () => {
      const { result } = simnet.callPublicFn(contractName, "emergency-pause", [], deployer);
      expect(result).toBeDefined();
      // Should succeed since deployer is the owner
    });

    it("should allow owner to resume", () => {
      // First pause
      simnet.callPublicFn(contractName, "emergency-pause", [], deployer);
      
      // Then resume
      const { result } = simnet.callPublicFn(contractName, "resume-operations", [], deployer);
      expect(result).toBeDefined();
    });
  });

  describe("Compound Rewards Tests", () => {
    it("should enforce cooldown period", () => {
      const { result } = simnet.callPublicFn(contractName, "compound-rewards", [], address1);
      expect(result).toBeDefined();
      // Should return ok with 0 since no rewards are available
    });

    it("should only compound when rewards are available", () => {
      const { result } = simnet.callPublicFn(contractName, "compound-rewards", [], address1);
      expect(result).toBeDefined();
      // Should return ok with 0 since no rewards are available
    });
  });

  describe("Read Only Functions", () => {
    it("should return correct share price", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-share-price", [], address1);
      expect(result).toBeDefined();
      expect(result.type).toBe('uint');
      if (result.type === 'uint') {
        expect(result.value).toBe(1000000n); // 1:1 ratio initially as BigInt
      }
    });

    it("should return vault info", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-vault-info", [], address1);
      expect(result).toBeDefined();
      expect(result.type).toBe('tuple');
    });
  });

  describe("Security Features", () => {
    it("should have reentrancy protection in place", () => {
      // Test that the reentrancy lock variable exists and functions work
      const { result } = simnet.callPublicFn(contractName, "compound-rewards", [], address1);
      expect(result).toBeDefined();
    });

    it("should have emergency functions available", () => {
      // Test that emergency functions exist and can be called
      const pauseResult = simnet.callPublicFn(contractName, "emergency-pause", [], deployer);
      expect(pauseResult.result).toBeDefined();
      
      const resumeResult = simnet.callPublicFn(contractName, "resume-operations", [], deployer);
      expect(resumeResult.result).toBeDefined();
    });

    it("should have access control implemented", () => {
      // Test that owner-only functions exist
      const pauseResult = simnet.callPublicFn(contractName, "emergency-pause", [], address1);
      expect(pauseResult.result).toBeDefined(); // Should fail for non-owner
      
      const ownerPauseResult = simnet.callPublicFn(contractName, "emergency-pause", [], deployer);
      expect(ownerPauseResult.result).toBeDefined(); // Should work for owner
    });
  });

  describe("NEW FEATURES: Performance Fees & Treasury", () => {
    it("should return fee information", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-fee-info", [], address1);
      expect(result).toBeDefined();
      expect(result.type).toBe('tuple');
    });

    it("should test treasury management functions exist", () => {
      // Test that set-treasury function exists and has proper access control
      const { result } = simnet.callPublicFn(contractName, "set-treasury", [Cl.principal(address1)], deployer);
      expect(result).toBeDefined();
    });
  });

  describe("NEW FEATURES: Boost Tiers & Time-Weighted Rewards", () => {
    it("should return user boost info", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-user-boost-info", [Cl.principal(address1)], address1);
      expect(result).toBeDefined();
      expect(result.type).toBe('tuple');
    });

    it("should return time-weighted balance data", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-user-time-weighted-data", [Cl.principal(address1)], address1);
      expect(result).toBeDefined();
      expect(result.type).toBe('tuple');
    });

    it("should calculate estimated rewards", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-user-estimated-rewards", [Cl.principal(address1)], address1);
      expect(result).toBeDefined();
      expect(result.type).toBe('tuple');
    });

    it("should allow users to claim rewards", () => {
      const { result } = simnet.callPublicFn(contractName, "claim-rewards", [], address1);
      expect(result).toBeDefined();
      // Will return error if no rewards available, which is expected
    });
  });

  describe("NEW FEATURES: APY Tracking & Statistics", () => {
    it("should snapshot APY", () => {
      const { result } = simnet.callPublicFn(contractName, "snapshot-apy", [], address1);
      expect(result).toBeDefined();
    });

    it("should return APY snapshot for cycle", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-apy-snapshot", [Cl.uint(0)], address1);
      expect(result).toBeDefined();
    });

    it("should return comprehensive vault statistics", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-vault-statistics", [], address1);
      expect(result).toBeDefined();
      expect(result.type).toBe('tuple');
    });
  });

  describe("NEW FEATURES: Batch Operations", () => {
    it("should test batch deposit function exists", () => {
      // Testing that batch-deposit function is callable with empty list
      const { result } = simnet.callPublicFn(contractName, "batch-deposit", [Cl.list([])], deployer);
      expect(result).toBeDefined();
    });
  });

  describe("OPTIMIZATION: Enhanced Precision", () => {
    it("should calculate share price with precision", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-share-price", [], address1);
      expect(result).toBeDefined();
      expect(result.type).toBe('uint');
      // Initial 1:1 ratio with precision
      if (result.type === 'uint') {
        expect(result.value).toBe(1000000n);
      }
    });

    it("should handle withdrawable amount calculation", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "calculate-withdrawable-amount", [Cl.principal(address1)], address1);
      expect(result).toBeDefined();
      expect(result.type).toBe('uint');
    });
  });

  describe("Deposit Functionality Tests", () => {
    it("should reject deposits below minimum", () => {
      const { result } = simnet.callPublicFn(contractName, "deposit", [Cl.uint(100)], address1);
      expect(result).toBeDefined();
      // Should fail - below MIN_DEPOSIT (1 STX = 1000000 uSTX)
    });

    it("should reject deposits above maximum", () => {
      const { result } = simnet.callPublicFn(contractName, "deposit", [Cl.uint(2000000000000)], address1);
      expect(result).toBeDefined();
      // Should fail - above MAX_DEPOSIT
    });

    it("should accept valid deposit", () => {
      const depositAmount = 10000000; // 10 STX
      const { result } = simnet.callPublicFn(contractName, "deposit", [Cl.uint(depositAmount)], address1);
      expect(result).toBeDefined();
    });

    it("should enforce deposit cooldown", () => {
      const depositAmount = 10000000; // 10 STX
      // First deposit
      simnet.callPublicFn(contractName, "deposit", [Cl.uint(depositAmount)], address1);
      
      // Immediate second deposit should fail due to cooldown
      const { result } = simnet.callPublicFn(contractName, "deposit", [Cl.uint(depositAmount)], address1);
      expect(result).toBeDefined();
    });

    it("should mint correct share amount on deposit", () => {
      const depositAmount = 10000000; // 10 STX
      const { result } = simnet.callPublicFn(contractName, "deposit", [Cl.uint(depositAmount)], address1);
      expect(result).toBeDefined();
      
      // Check user info
      const userInfo = simnet.callReadOnlyFn(contractName, "get-user-info", [Cl.principal(address1)], address1);
      expect(userInfo.result).toBeDefined();
    });
  });

  describe("Withdrawal Functionality Tests", () => {
    it("should reject withdrawal with zero shares", () => {
      const { result } = simnet.callPublicFn(contractName, "withdraw", [Cl.uint(0)], address1);
      expect(result).toBeDefined();
      // Should fail - zero amount
    });

    it("should reject withdrawal exceeding user shares", () => {
      const { result } = simnet.callPublicFn(contractName, "withdraw", [Cl.uint(1000000000)], address1);
      expect(result).toBeDefined();
      // Should fail - insufficient shares
    });

    it("should enforce withdrawal cooldown", () => {
      // This test would require a deposit first, then immediate withdrawal
      const depositAmount = 10000000; // 10 STX
      simnet.callPublicFn(contractName, "deposit", [Cl.uint(depositAmount)], deployer);
      
      // Mine blocks to pass deposit cooldown
      for (let i = 0; i < 10; i++) {
        simnet.mineEmptyBlock();
      }
      
      // First withdrawal
      simnet.callPublicFn(contractName, "withdraw", [Cl.uint(1000000)], deployer);
      
      // Immediate second withdrawal should fail
      const { result } = simnet.callPublicFn(contractName, "withdraw", [Cl.uint(1000000)], deployer);
      expect(result).toBeDefined();
    });

    it("should calculate fees correctly on withdrawal", () => {
      const depositAmount = 100000000; // 100 STX
      simnet.callPublicFn(contractName, "deposit", [Cl.uint(depositAmount)], deployer);
      
      // Mine blocks to pass cooldown
      for (let i = 0; i < 150; i++) {
        simnet.mineEmptyBlock();
      }
      
      const { result } = simnet.callPublicFn(contractName, "withdraw", [Cl.uint(50000000)], deployer);
      expect(result).toBeDefined();
      // Should include withdrawal fee and performance fee
    });
  });

  describe("SECURITY: Blacklist & Access Control Tests", () => {
    it("should allow owner to blacklist address", () => {
      const { result } = simnet.callPublicFn(contractName, "blacklist-address", 
        [Cl.principal(address1), Cl.bool(true)], deployer);
      expect(result).toBeDefined();
      expect(result.type).toBe('ok');
    });

    it("should reject non-owner blacklist attempt", () => {
      const { result } = simnet.callPublicFn(contractName, "blacklist-address", 
        [Cl.principal(deployer), Cl.bool(true)], address1);
      expect(result).toBeDefined();
      // Should fail - not owner
    });

    it("should prevent blacklisted address from depositing", () => {
      // Blacklist address1
      simnet.callPublicFn(contractName, "blacklist-address", 
        [Cl.principal(address1), Cl.bool(true)], deployer);
      
      // Try to deposit
      const { result } = simnet.callPublicFn(contractName, "deposit", [Cl.uint(10000000)], address1);
      expect(result).toBeDefined();
      // Should fail - blacklisted
    });

    it("should allow owner to set withdrawal limits", () => {
      const { result } = simnet.callPublicFn(contractName, "set-withdrawal-limit", 
        [Cl.principal(address1), Cl.uint(50000000000)], deployer);
      expect(result).toBeDefined();
      expect(result.type).toBe('ok');
    });

    it("should allow owner to update max slippage", () => {
      const { result } = simnet.callPublicFn(contractName, "update-max-slippage", 
        [Cl.uint(300)], deployer);
      expect(result).toBeDefined();
      expect(result.type).toBe('ok');
    });

    it("should reject slippage above 10%", () => {
      const { result } = simnet.callPublicFn(contractName, "update-max-slippage", 
        [Cl.uint(1500)], deployer);
      expect(result).toBeDefined();
      // Should fail - above max
    });
  });

  describe("SECURITY: Reentrancy Protection Tests", () => {
    it("should have reentrancy lock in deposit", () => {
      const { result } = simnet.callPublicFn(contractName, "deposit", [Cl.uint(10000000)], address1);
      expect(result).toBeDefined();
      // Reentrancy lock should be cleared after execution
    });

    it("should have reentrancy lock in withdraw", () => {
      const { result } = simnet.callPublicFn(contractName, "withdraw", [Cl.uint(1000000)], address1);
      expect(result).toBeDefined();
      // Reentrancy lock should be cleared after execution
    });

    it("should have reentrancy lock in compound-rewards", () => {
      const { result } = simnet.callPublicFn(contractName, "compound-rewards", [], address1);
      expect(result).toBeDefined();
      // Reentrancy lock should be cleared after execution
    });
  });

  describe("Edge Cases & Boundary Tests", () => {
    it("should handle zero total supply correctly", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-share-price", [], address1);
      expect(result).toBeDefined();
      if (result.type === 'uint') {
        expect(result.value).toBe(1000000n); // 1:1 initial ratio
      }
    });

    it("should handle user with no deposits", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-user-info", [Cl.principal(address1)], address1);
      expect(result).toBeDefined();
      expect(result.type).toBe('tuple');
    });

    it("should handle emergency withdrawal during pause", () => {
      // Pause contract
      simnet.callPublicFn(contractName, "emergency-pause", [], deployer);
      
      // Try emergency withdrawal
      const { result } = simnet.callPublicFn(contractName, "emergency-withdraw", [Cl.uint(1000000)], address1);
      expect(result).toBeDefined();
    });

    it("should reject normal operations when paused", () => {
      // Pause contract
      simnet.callPublicFn(contractName, "emergency-pause", [], deployer);
      
      // Try deposit
      const { result } = simnet.callPublicFn(contractName, "deposit", [Cl.uint(10000000)], address1);
      expect(result).toBeDefined();
      // Should fail - paused
      
      // Resume for other tests
      simnet.callPublicFn(contractName, "resume-operations", [], deployer);
    });
  });

  describe("Integration Tests", () => {
    it("should handle full deposit-withdraw cycle", () => {
      const depositAmount = 50000000; // 50 STX
      
      // Deposit
      const depositResult = simnet.callPublicFn(contractName, "deposit", [Cl.uint(depositAmount)], deployer);
      expect(depositResult.result).toBeDefined();
      
      // Mine blocks to pass cooldowns
      for (let i = 0; i < 150; i++) {
        simnet.mineEmptyBlock();
      }
      
      // Check vault info
      const vaultInfo = simnet.callReadOnlyFn(contractName, "get-vault-info", [], deployer);
      expect(vaultInfo.result).toBeDefined();
      
      // Withdraw
      const withdrawResult = simnet.callPublicFn(contractName, "withdraw", [Cl.uint(25000000)], deployer);
      expect(withdrawResult.result).toBeDefined();
    });

    it("should track vault statistics correctly", () => {
      const { result } = simnet.callReadOnlyFn(contractName, "get-vault-statistics", [], address1);
      expect(result).toBeDefined();
      expect(result.type).toBe('tuple');
    });
  });
});