//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface ISwitchFactory {
    event SwitchActivated(
        uint256 switchId,
        uint256 bounty,
        uint256 executionTime
    );
    event SwitchCanceled(uint256 switchId);
    event SwitchExtended(uint256 switchId, uint256 newExecutionTime);
    event SwitchExecuted(uint256 switchId, address executor, uint256 bounty);

    function newSwitch(
        address payable[] memory _recipients,
        uint256[] memory _amounts,
        uint256 _bounty,
        uint256 _delay
    ) external payable returns (uint256);

    function cancelSwitch(uint256 _id, bool withdraw) external;

    function executeSwitch(uint256 _id) external;

    function extendSwitch(uint256 _id, uint256 _newDelay) external;

    function reopenSwitch(uint256 _id, uint256 _newDelay) external;

    function getSwitch(uint256 _id)
        external
        view
        returns (
            uint256,
            address,
            uint256,
            uint256,
            address payable[] memory,
            uint256[] memory
        );

    function getAllSwitches()
        external
        view
        returns (
            uint256[] memory,
            uint256[] memory,
            uint256[] memory
        );

    function getOwnerIds(address owner)
        external
        view
        returns (uint256[] memory);

    function getSwitchCount() external view returns (uint256);
}
