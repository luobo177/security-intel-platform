// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IntelRegistry {

    struct Intel {
        address sender;
        uint256 timestamp;
    }

    mapping(string => Intel) public intels;

    function submitIntel(string memory _hash) public {
        require(intels[_hash].timestamp == 0, "Already exists");

        intels[_hash] = Intel(
            msg.sender,
            block.timestamp
        );
    }

    function verifyIntel(string memory _hash) public view returns (bool) {
        return intels[_hash].timestamp != 0;
    }

    function getIntel(string memory _hash) public view returns (
        address,
        uint256
    ) {
        Intel memory i = intels[_hash];
        return (i.sender, i.timestamp);
    }
}