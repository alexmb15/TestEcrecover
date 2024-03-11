import { loadFixture, ethers, expect, time, anyValue } from "./setup";
import type { TestEcrecover, Implement } from "../typechain-types";



describe("TestEcrecover", function() {
  async function deploy() {
    const [ owner, receiver ] = await ethers.getSigners();
    enum Operation {Call, DelegateCall};

    const TestEcrecoverFactory = await ethers.getContractFactory("TestEcrecover");
    const testEcrecover: TestEcrecover = await TestEcrecoverFactory.deploy({
      value: ethers.parseUnits("100", "ether")
    });

    const ImplementFactory = await ethers.getContractFactory("Implement");
    const implement: Implement = await ImplementFactory.deploy();

    return { owner, receiver, Operation, testEcrecover, implement }
  }

  it("should allow to send and receive payments with executeCall()", async function() {
    const { owner, receiver, Operation, testEcrecover } = await loadFixture(deploy);

    const to = receiver.address;
    const amount = ethers.parseUnits("2", "ether");
    const data = ethers.solidityPacked(["string"], [""]);
    const txGas = 0;
    const nonce = 1;
  
    const hash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "bytes", "uint8", "uint256", "uint256", "address"],
      [receiver.address, to, amount, data, Operation.Call, txGas, nonce, testEcrecover.target]
    );

    const messageHashBin = ethers.getBytes(hash);
    const signature = await owner.signMessage(messageHashBin);

    const tx = await testEcrecover.connect(receiver).invoke(to, amount, data, Operation.Call, txGas, nonce, signature);

    await expect(tx).to.changeEtherBalance(receiver, amount); 
  });

 it("should allow to send and receive payments with executeDelegateCall()", async function() {
    const { owner, receiver, Operation, testEcrecover, implement } = await loadFixture(deploy);

    const to = implement.target;
    const amount = ethers.parseUnits("10", "ether");
    const data = await implement.interface.encodeFunctionData("transferEther(address,uint256)", [receiver.address, amount]);
    console.log("data = ", data);
    const txGas = 0;
    const nonce = 1;
  
    const hash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "bytes", "uint8", "uint256", "uint256", "address"],
      [receiver.address, to, amount, data, Operation.DelegateCall, txGas, nonce, testEcrecover.target]
    );

    const messageHashBin = ethers.getBytes(hash);
    const signature = await owner.signMessage(messageHashBin);

    const tx = await testEcrecover.connect(receiver).invoke(to, amount, data, Operation.DelegateCall, txGas, nonce, signature);
    await expect(tx).to.changeEtherBalance(receiver, amount);

  });

  it("should fail with 'invalid sig!' when not owner", async function() {
    const { owner, receiver, Operation, testEcrecover } = await loadFixture(deploy);

    const to = receiver.address;
    const amount = ethers.parseUnits("2", "ether");
    const data = ethers.solidityPacked(["string"], ["test"]);
    const txGas = 0;
    const nonce = 1;
  
    const hash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "bytes", "uint8", "uint256", "uint256", "address"],
      [receiver.address, to, amount, data, Operation.Call, txGas, nonce, testEcrecover.target]
    );

    const messageHashBin = ethers.getBytes(hash);
    const signature = await receiver.signMessage(messageHashBin);

    await expect(testEcrecover.connect(receiver).invoke(to, amount, data, Operation.Call, txGas, nonce, signature)).to.be.revertedWith("invalid sig!");
  });
  
});                   