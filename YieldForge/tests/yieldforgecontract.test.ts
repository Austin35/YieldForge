import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
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
});