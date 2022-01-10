require('dotenv').config()
const hre = require("hardhat");
const ethers = require("ethers");

async function getOwnerSwitches() {
    const provider = new ethers.providers.getDefaultProvider();

    const factory = await hre.ethers.getContractFactory("SwitchFactory");
    const interface = factory.interface;
    const abi = interface.format(ethers.utils.FormatTypes.full);
    const contract_rw = new ethers.Contract(switch_address, abi, provider);

    /*     const idList = await contract_rw.getOwnerIds(owner.address);
        let switchList = [];
        for (let i = 0; i < idList.length; i++) {
            const nextSwitch = await contract_rw.getSwitch(idList[i]);
            switchList = [...switchList, nextSwitch];
        }
        console.log(switchList); */
}