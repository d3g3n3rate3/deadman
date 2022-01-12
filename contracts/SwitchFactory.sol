//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ISwitchFactory.sol";

contract SwitchFactory is ISwitchFactory {
    using Counters for Counters.Counter;

    enum STATUS {
        OPEN,
        PAUSED,
        EXECUTED,
        WITHDRAWN
    }

    struct DeadManSwitch {
        STATUS status;
        address owner;
        uint256 bounty;
        uint256 executionTime;
        address payable[] recipients;
        uint256[] amounts;
    }
    // ID counter used to uniquely identify each switch
    Counters.Counter private _switchId;
    // maps switch ID to DeadManSwitch struct
    mapping(uint256 => DeadManSwitch) private _idToSwitch;
    mapping(address => uint256[]) private _ownerToIds;

    constructor() {}

    /**
     * @dev Initializes a new dead man's switch with recipients, amounts to be sent,
     * bounty for executor, and delay before executability. User needs to send entire
     * sum upfront.
     */
    function newSwitch(
        address payable[] memory _recipients,
        uint256[] memory _amounts,
        uint256 _bounty,
        uint256 _delay
    ) external payable override returns (uint256) {
        console.log("CONTRACT VALUE SENT: ", msg.value);
        require(
            _recipients.length == _amounts.length,
            "Number of recipients should match number of amounts"
        );

        uint256 total_amount;
        for (uint256 i = 0; i < _amounts.length; i++) {
            require(
                _recipients[i] != address(0),
                "Recipient cannot be zero address"
            );
            total_amount += _amounts[i];
        }
        require(
            msg.value == total_amount + _bounty,
            "msg.value does not match sum of amounts plus bounty"
        );

        _switchId.increment();

        _idToSwitch[_switchId.current()] = DeadManSwitch({
            status: STATUS.OPEN,
            owner: msg.sender,
            recipients: _recipients,
            amounts: _amounts,
            bounty: _bounty,
            executionTime: block.timestamp + _delay
        });

        _ownerToIds[msg.sender].push(_switchId.current());

        emit SwitchActivated(
            _switchId.current(),
            _bounty,
            block.timestamp + _delay
        );

        return _switchId.current();
    }

    function cancelSwitch(uint256 _id, bool withdraw)
        external
        override
        onlySwitchOwner(_id)
    {
        require(
            _idToSwitch[_id].status == STATUS.OPEN ||
                _idToSwitch[_id].status == STATUS.PAUSED,
            "Cannot cancel executed or withdrawn contract"
        );
        _idToSwitch[_id].status = STATUS.PAUSED;

        if (withdraw) {
            _idToSwitch[_id].status = STATUS.WITHDRAWN;
            uint256 total_amount;
            for (uint256 i = 0; i < _idToSwitch[_id].amounts.length; i++) {
                total_amount += _idToSwitch[_id].amounts[i];
            }
            total_amount += _idToSwitch[_id].bounty;

            (bool success, ) = _idToSwitch[_id].owner.call{value: total_amount}(
                ""
            );
            require(success, "Withdrawal failed");
        }

        emit SwitchCanceled(_id);
    }

    function executeSwitch(uint256 _id) external override {
        require(
            block.timestamp > _idToSwitch[_id].executionTime,
            "This switch has not matured yet"
        );
        require(
            _idToSwitch[_id].status == STATUS.OPEN,
            "This switch is not executable anymore"
        );
        _idToSwitch[_id].status = STATUS.EXECUTED;

        for (uint256 i = 0; i < _idToSwitch[_id].amounts.length; i++) {
            address payable to = _idToSwitch[_id].recipients[i];
            uint256 amount = _idToSwitch[_id].amounts[i];

            (bool successAmount, ) = to.call{value: amount}("");
            require(successAmount, "Transfer failed");
        }

        (bool successBounty, ) = msg.sender.call{
            value: _idToSwitch[_id].bounty
        }("");
        require(successBounty, "Bounty transfer failed");

        emit SwitchExecuted(_id, msg.sender, _idToSwitch[_id].bounty);
    }

    function extendSwitch(uint256 _id, uint256 _newDelay)
        external
        override
        onlySwitchOwner(_id)
    {
        require(
            _idToSwitch[_id].status == STATUS.OPEN,
            "Cannot extend a paused or executed switch"
        );
        _idToSwitch[_id].executionTime = block.timestamp + _newDelay;
        emit SwitchExtended(_id, block.timestamp + _newDelay);
    }

    function reopenSwitch(uint256 _id, uint256 _newDelay)
        external
        override
        onlySwitchOwner(_id)
    {
        require(
            _idToSwitch[_id].status == STATUS.PAUSED,
            "Cannot reopen an open, executed or withdrawn switch"
        );
        _idToSwitch[_id].executionTime = block.timestamp + _newDelay;
        _idToSwitch[_id].status = STATUS.OPEN;

        emit SwitchActivated(
            _id,
            _idToSwitch[_id].bounty,
            block.timestamp + _newDelay
        );
    }

    function getSwitch(uint256 _id)
        external
        view
        override
        returns (
            uint256,
            address,
            uint256,
            uint256,
            address payable[] memory,
            uint256[] memory
        )
    {
        require(_id <= _switchId.current(), "ID does not exist yet");

        address payable[] memory recipients = _idToSwitch[_id].recipients;
        uint256[] memory amounts = _idToSwitch[_id].amounts;

        return (
            uint256(_idToSwitch[_id].status),
            _idToSwitch[_id].owner,
            _idToSwitch[_id].bounty,
            _idToSwitch[_id].executionTime,
            recipients,
            amounts
        );
    }

    function getAllSwitches()
        external
        view
        override
        returns (
            uint256[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        uint256[] memory statuses = new uint256[](_switchId.current());
        uint256[] memory bounties = new uint256[](_switchId.current());
        uint256[] memory executionTimes = new uint256[](_switchId.current());
        for (uint256 i = 1; i <= _switchId.current(); i++) {
            statuses[i - 1] = uint256(_idToSwitch[i].status);
            bounties[i - 1] = _idToSwitch[i].bounty;
            executionTimes[i - 1] = _idToSwitch[i].executionTime;
        }

        return (statuses, bounties, executionTimes);
    }

    function getOwnerIds(address owner)
        external
        view
        override
        returns (uint256[] memory)
    {
        return _ownerToIds[owner];
    }

    function getSwitchCount() external view override returns (uint256) {
        return _switchId.current();
    }

    modifier onlySwitchOwner(uint256 _id) {
        require(
            msg.sender == _idToSwitch[_id].owner,
            "You do not own this switch"
        );
        _;
    }
}
