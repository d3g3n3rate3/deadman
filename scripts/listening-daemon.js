require('dotenv').config()
const hre = require("hardhat");
const ethers = require("ethers");

async function main() {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();

    const SwitchFactory = await hre.ethers.getContractFactory("SwitchFactory");
    const switchfactory = await SwitchFactory.deploy();

    await switchfactory.deployed();
    listen(switchfactory.address, owner);

    const tx = await switchfactory.newSwitch([addr1.address], [100], 10, 1000000, { value: 110 });
    await tx.wait();
    const tx2 = await switchfactory.newSwitch([addr1.address], [200], 100, 1000000, { value: 300 });
    await tx2.wait();

    await getOwnerSwitches(switchfactory.address, owner.address, owner);

}

async function listen(switch_address, signer) {
    const factory = await hre.ethers.getContractFactory("SwitchFactory");
    const interface = factory.interface;
    const abi = interface.format(ethers.utils.FormatTypes.full);
    const contract_rw = new ethers.Contract(switch_address, abi, signer);

    const switchHistory = await contract_rw.getAllSwitches();
    console.log(switchHistory);

    contract_rw.on("SwitchActivated", (switchId, bounty, executionTime) => {
        console.log("Switch activated");
    })

    contract_rw.on()
}

async function getOwnerSwitches(switch_address, owner_address, signer) {
    const factory = await hre.ethers.getContractFactory("SwitchFactory");
    const interface = factory.interface;
    const abi = interface.format(ethers.utils.FormatTypes.full);
    const contract_rw = new ethers.Contract(switch_address, abi, signer);

    const idList = await contract_rw.getOwnerIds(owner_address);
    let switchList = [];
    for (let i = 0; i < idList.length; i++) {
        const nextSwitch = await contract_rw.getSwitch(idList[i]);
        switchList = [...switchList, nextSwitch];
    }
    console.log(switchList);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
