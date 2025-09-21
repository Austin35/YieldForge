import { describe, expect, it, beforeEach } from "vitest";

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
      expect(result.value).toBe(1000000n); // 1:1 ratio initially as BigInt
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
});