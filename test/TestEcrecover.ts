import { loadFixture, ethers, expect, time, anyValue } from "./setup";
import type { TestEcrecover, Implement } from "../typechain-types";



describe("TestEcrecover", function() {
  async function deploy() {
    const [ owner, receiver ] = await ethers.getSigners();
    const { gasPrice } = await ethers.provider.getFeeData();

    enum Operation {Call, DelegateCall};
    let gasLimit = 2100000n;
    const txGas = gasLimit * gasPrice;
    

    const TestEcrecoverFactory = await ethers.getContractFactory("TestEcrecover");
    const testEcrecover: TestEcrecover = await TestEcrecoverFactory.deploy({
      value: ethers.parseUnits("100", "ether")
    });

    const ImplementFactory = await ethers.getContractFactory("Implement");
    const implement: Implement = await ImplementFactory.deploy();

    return { owner, receiver, Operation, testEcrecover, implement, gasLimit, gasPrice, txGas }
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

  it("should allow to send/receive payments with executeDelegateCall()", async function() {
    const { owner, receiver, Operation, testEcrecover, implement, gasLimit, gasPrice, txGas } = await loadFixture(deploy);

    const to = implement.target;
    const amount = ethers.parseUnits("5", "ether");
    const data = await implement.interface.encodeFunctionData("transferEther(address,uint256)", [receiver.address, amount]);
    const nonce = 1;

    //check balance befor function call
    const balanceBefor = await ethers.provider.getBalance(testEcrecover.target);
  
    const hash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "bytes", "uint8", "uint256", "uint256", "address"],
      [receiver.address, to, amount, data, Operation.DelegateCall, txGas, nonce, testEcrecover.target]
    );

    const messageHashBin = ethers.getBytes(hash);
    const signature = await owner.signMessage(messageHashBin);

    const txData = testEcrecover.interface.encodeFunctionData(
	"invoke(address,uint256,bytes,uint8,uint256,uint256,bytes)", 
        [to, amount, data, Operation.DelegateCall, txGas, nonce, signature]
    );

     const tx = await testEcrecover.connect(receiver).invoke(to, amount, data, Operation.DelegateCall, txGas, nonce, signature);
        
     //check send and receive paymets
     await expect(tx).to.changeEtherBalance(receiver, amount);  

  });

  it("should receive ruturns from executeDelegateCall", async function() {
    const { owner, receiver, Operation, testEcrecover, implement, gasLimit, gasPrice, txGas } = await loadFixture(deploy);

    const to = implement.target;
    const amount = ethers.parseUnits("10", "ether");
    const data = await implement.interface.encodeFunctionData("transferEther(address,uint256)", [receiver.address, amount]);
    const nonce = 1;

    //check balance befor function call
    const balanceBefor = await ethers.provider.getBalance(testEcrecover.target);
  
    const hash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "bytes", "uint8", "uint256", "uint256", "address"],
      [receiver.address, to, amount, data, Operation.DelegateCall, txGas, nonce, testEcrecover.target]
    );

    const messageHashBin = ethers.getBytes(hash);
    const signature = await owner.signMessage(messageHashBin);

    const txData = testEcrecover.interface.encodeFunctionData(
	"invoke(address,uint256,bytes,uint8,uint256,uint256,bytes)", 
        [to, amount, data, Operation.DelegateCall, txGas, nonce, signature]
    );

    const tx = await ethers.provider.call({
        from: receiver.address,
	to: testEcrecover.target,
	data: txData,
        gasLimit: gasLimit,
        gasPrice: gasPrice
    });

    const decodedResult = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], tx);
  
     //check received return
     expect(BigInt(decodedResult)).to.be.equal(balanceBefor - amount);
 
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