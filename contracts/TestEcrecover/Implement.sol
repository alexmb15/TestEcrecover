// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Uncomment this line to use console.log
//import "hardhat/console.sol";

contract Implement {

  event TransferEther(address indexed from, address indexed to, uint256 amount);

  function transferEther(address to, uint256 amount) public returns(uint256){
    require(amount <= address(this).balance, "not enough ether to transfer");
    payable(to).transfer(amount);
    emit TransferEther(address(this), to, amount);

    return (address(this).balance);
  } 

  function getBalance() public view returns(uint256) {
    return address(this).balance;
  }

}