// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

error AutoCompatibleCounter__UpkeepNotNeeded();

contract AutoCompatibleCounter is AutomationCompatibleInterface {
    uint public counter;
    uint public immutable interval;
    uint public lastTimeStamp;

    constructor(uint updateInterval) {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;

        counter = 0;
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert AutoCompatibleCounter__UpkeepNotNeeded();
        }
        lastTimeStamp = block.timestamp;
        counter = counter + 1;
    }
}
