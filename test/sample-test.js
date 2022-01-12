const { expect } = require("chai");
const { Contract } = require("ethers");
const { ethers } = require("hardhat");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe("SwitchFactory", function () {
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let SwitchFactory;
  let switchfactory;

  let provider = hre.network.provider;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await hre.ethers.getSigners();

    SwitchFactory = await hre.ethers.getContractFactory("SwitchFactory");
    switchfactory = await SwitchFactory.deploy();

    await switchfactory.deployed();
  });

  describe("Deployment", async function () {
    it("Should deploy correctly", async function () { });
  });

  describe("New switch creation", async function () {
    let amount1 = getRandomInt(1, 1000000000);
    let amount2 = getRandomInt(1, 1000000000);

    it("Should set parameters correctly", async function () {
      const tx = await switchfactory.newSwitch([addr1.address, addr2.address], [amount1, amount2], 10, 1000000, { value: amount1 + amount2 + 10 });
      const switch1 = await switchfactory.getSwitch(1);

      expect(switch1[0]).to.equal(0);
      expect(switch1[1]).to.equal(owner.address);
      expect(switch1[2]).to.equal(10);

      expect(switch1[4][0]).to.equal(addr1.address);
      expect(switch1[5][0]).to.equal(amount1);
      expect(switch1[4][1]).to.equal(addr2.address);
      expect(switch1[5][1]).to.equal(amount2);
    });

    it("Should only accept payment for the exact amount", async function () {
      expect(switchfactory.newSwitch([addr1.address, addr2.address], [amount1, amount2], 10, 100, { value: amount1 + amount2 + 10 + 1 })).to.be.reverted;
      expect(switchfactory.newSwitch([addr1.address, addr2.address], [amount1, amount2], 10, 100, { value: amount1 + amount2 + 10 - 1 })).to.be.reverted;

      const tx = await switchfactory.newSwitch([addr1.address, addr2.address], [amount1, amount2], 10, 100, { value: amount1 + amount2 + 10 });

    });

    it("Should reject zero address recipient", async function () {
      expect(switchfactory.newSwitch([addr1.address, "0x0"], [amount1, amount2], 10, 100, { value: amount1 + amount2 + 10 + 1 })).to.be.reverted;

    });
  });

  describe("Execution", async function () {
    let amount1 = getRandomInt(1, 1000000000);
    let amount2 = getRandomInt(1, 1000000000);

    beforeEach(async function () {
      const tx = await switchfactory.newSwitch([addr1.address, addr2.address], [amount1, amount2], 10, 1000, { value: amount1 + amount2 + 10 });
      await tx.wait();
    });

    it("Should not be executable before delay has passed", async function () {
      expect(switchfactory.connect(addr1).executeSwitch(1)).to.be.reverted;
    });

    it("Should execute correctly after delay has passed", async function () {
      // then increase time
      await network.provider.send("evm_increaseTime", [3600])
      await network.provider.send("evm_mine")

      await switchfactory.connect(addr1).executeSwitch(1);
    });

    it("Should distribute amounts correctly", async function () {
      expect(await switchfactory.provider.getBalance(switchfactory.address)).to.equal(amount1 + amount2 + 10);

      // then increase time
      await network.provider.send("evm_increaseTime", [3600])
      await network.provider.send("evm_mine")

      const addr1_orig_bal = await addr1.getBalance();
      const addr2_orig_bal = await addr2.getBalance();

      const tx = await switchfactory.executeSwitch(1);
      await tx.wait();

      const addr1_new_bal = await addr1.getBalance();
      const addr2_new_bal = await addr2.getBalance();

      expect(await switchfactory.provider.getBalance(switchfactory.address)).to.equal(0);
      expect(addr1_new_bal.sub(addr1_orig_bal)).to.equal(amount1);
      expect(addr2_new_bal.sub(addr2_orig_bal)).to.equal(amount2);
    })

    it("Should refuse to execute executed switches", async function () {
      // then increase time
      await network.provider.send("evm_increaseTime", [3600])
      await network.provider.send("evm_mine")

      const tx = await switchfactory.executeSwitch(1);
      await tx.wait();

      expect(switchfactory.executeSwitch(1)).to.be.reverted;
    });
  });

  describe("Cancelling switches", async function () {
    let amount1 = getRandomInt(1, 1000000000);
    let amount2 = getRandomInt(1, 1000000000);

    beforeEach(async function () {
      const tx = await switchfactory.newSwitch([addr1.address, addr2.address], [amount1, amount2], 10, 1000, { value: amount1 + amount2 + 10 });
      await tx.wait();
    });

    it("Should reset the timer with extendSwitch", async function () {
      // then increase time
      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine");

      const tx = await switchfactory.extendSwitch(1, 1000);
      await tx.wait();

      expect(switchfactory.executeSwitch(1)).to.be.reverted;
    });

    it("Should not allow a canceled switch to be executed", async function () {
      await switchfactory.cancelSwitch(1, false);

      // then increase time
      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine");

      expect(switchfactory.executeSwitch(1)).to.be.reverted;
    });

    it("Should allow a canceled switch to be reactivated", async function () {
      await switchfactory.cancelSwitch(1, false);
      await switchfactory.reopenSwitch(1, 1000);

      // then increase time
      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine");

      await switchfactory.executeSwitch(1);
    });

    it("Should not allow an executed switch to be reopened", async function () {

      // then increase time
      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine");

      await switchfactory.executeSwitch(1);
      expect(switchfactory.reopenSwitch(1, 1000)).to.be.reverted;
    });

    it("Should not allow an executed switch to be cancelled", async function () {
      // then increase time
      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine");

      await switchfactory.executeSwitch(1);
      expect(switchfactory.cancelSwitch(1, false)).to.be.reverted;
    });

    it("Should only allow the owner to close and reopen switches", async function () {
      expect(switchfactory.connect(addr1).cancelSwitch(1, false)).to.be.reverted;
      await switchfactory.cancelSwitch(1, false);

      expect(switchfactory.connect(addr1).reopenSwitch(1, 1000)).to.be.reverted;
      await switchfactory.reopenSwitch(1, 1000);
    });

    it("Should allow owner to cancel and withdraw an open contract", async function () {
      await switchfactory.cancelSwitch(1, true);
      expect(await switchfactory.provider.getBalance(switchfactory.address)).to.equal(0);
    });
  });
});
