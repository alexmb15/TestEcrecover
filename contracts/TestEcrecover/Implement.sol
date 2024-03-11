// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Uncomment this line to use console.log
//import "hardhat/console.sol";

contract Implement {

  function transferEther(address to, uint256 amount) public {
    require(amount <= address(this).balance, "not enough ether to transfer");
    payable(to).transfer(amount);
  } 

  function getBalance() public view returns(uint256) {
    return address(this).balance;
  }

}