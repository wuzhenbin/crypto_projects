// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract VRFv2Consumer is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 subId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 100000;
    uint16 reqConfirm = 3;
    uint32 numWords = 3;
    uint256[] public randomWords;

    event RequestedRandomness(uint256 requestId);

    constructor(
        uint64 _subId,
        address _vrfCoodAddr,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(_vrfCoodAddr) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoodAddr);
        subId = _subId;
        keyHash = _keyHash;
    }

    // Assumes the subscription is funded sufficiently.
    function requestRandomWords() external {
        // Will revert if subscription is not set and funded.
        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subId,
            reqConfirm,
            callbackGasLimit,
            numWords
        );
        emit RequestedRandomness(requestId);
    }

    function fulfillRandomWords(
        uint256 /*_requestId*/,
        uint256[] memory _randomWords
    ) internal override {
        randomWords = _randomWords;
    }
}
