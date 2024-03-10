import { loadFixture, ethers, expect, time, anyValue } from "./setup";
import type { TestEcrecover } from "../typechain-types";

describe("TestEcrecover", function() {
  async function deploy() {
    const [ owner, receiver ] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("TestEcrecover");
    const testEcrecover: TestEcrecover = await Factory.deploy({
      value: ethers.parseUnits("100", "ether")
    });

    return { owner, receiver, testEcrecover }
  }

  it("should allow to send and receive payments", async function() {
    const { owner, receiver, testEcrecover } = await loadFixture(deploy);

    const to = receiver.address;
    const amount = ethers.parseUnits("2", "ether");
    const data = ethers.solidityPacked(["string"], ["test"]);
    const operation = 0;
    const txGas = 0;
    const nonce = 1;
  
    const hash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "bytes", "uint8", "uint256", "uint256", "address"],
      [receiver.address, to, amount, data, operation, txGas, nonce, testEcrecover.target]
    );

    const messageHashBin = ethers.getBytes(hash);
    const signature = await owner.signMessage(messageHashBin);

    const tx = await testEcrecover.connect(receiver).invoke(to, amount, data, operation, txGas, nonce, signature);
    await tx.wait();

    expect(tx).to.changeEtherBalance(receiver, amount);    
  });

});                   