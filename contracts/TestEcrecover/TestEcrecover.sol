// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract Executor {

    enum Operation {
        Call,
        DelegateCall
    }

    function execute(address to, uint256 amount, bytes memory data, Operation operation, uint256 txGas)
        internal
        returns (bool success)
    {
        if (operation == Operation.Call)
            success = executeCall(to, amount, data, txGas);
        else if (operation == Operation.DelegateCall)
            success = executeDelegateCall(to, data, txGas);
        else
            success = false;
    }

    function executeCall(address to, uint256 amount, bytes memory data, uint256 txGas)
        internal
        returns (bool success)
    {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := call(txGas, to, amount, add(data, 0x20), mload(data), 0, 0)
        }
    }

    function executeDelegateCall(address to, bytes memory data, uint256 txGas)
        internal
        returns (bool success)
    {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := delegatecall(txGas, to, add(data, 0x20), mload(data), 0, 0)
        }
    }
}


contract TestEcrecover is Executor {
    address public owner;

    mapping(uint => bool) nonces;

    constructor() payable {
        require(msg.value > 0);
        owner = msg.sender;
    }
    
    function invoke(address to, uint256 amount, bytes memory data, Operation operation, uint256 txGas, uint256 nonce, bytes memory signature) external returns(bool success) {
        require(!nonces[nonce], "nonce already used!");

        nonces[nonce] = true;

        bytes32 message = withPrefix(keccak256(abi.encodePacked(
            msg.sender,
	    to,
            amount,
	    data,
	    operation,
	    txGas,
            nonce,
            address(this)
        )));

//        console.logBytes32(message);

        require(
            recoverSigner(message, signature, 0) == owner, "invalid sig!"
        );

        success = execute(to, amount, data, operation, gasleft());
        require(success, "execute failed!");
    }

    /**
    * @dev Recovers the signer at a given position from a list of concatenated signatures.
    * @param _signedHash The signed hash
    * @param _signatures The concatenated signatures.
    * @param _index The index of the signature to recover.
    */
    function recoverSigner(bytes32 _signedHash, bytes memory _signatures, uint _index) internal pure returns (address) {
        uint8 v;
        bytes32 r;
        bytes32 s;
        // we jump 32 (0x20) as the first slot of bytes contains the length
        // we jump 65 (0x41) per signature
        // for v we load 32 bytes ending with v (the first 31 come from s) then apply a mask
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            r := mload(add(_signatures, add(0x20,mul(0x41,_index))))
            s := mload(add(_signatures, add(0x40,mul(0x41,_index))))
            v := and(mload(add(_signatures, add(0x41,mul(0x41,_index)))), 0xff)
        }
        require(v == 27 || v == 28); 
        return ecrecover(_signedHash, v, r, s);
    }

    function withPrefix(bytes32 _hash) private pure returns(bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                _hash
            )
        );
    }
}