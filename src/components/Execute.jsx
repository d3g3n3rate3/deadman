import React from 'react'
import { useState } from 'react';
import { ethers } from 'ethers'
import SwitchFactory from '../artifacts/contracts/SwitchFactory.sol/SwitchFactory.json';
import styles from '../mystyle.module.css';


function Execute(props) {

  const [switchId, setSwitchId] = useState();
  const [fetchData, setFetchData] = useState([0, 0, 0, 0, 0, 0]);
  const [executed, setExecuted] = useState('');
  const [switchList, setSwitchList] = useState([{ id: '', bounty: '', gasEstimate: '' }]);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(props.switchAddress, SwitchFactory.abi, signer);

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function getActiveSwitches() {
    await requestAccount();

    let list = [];
    const switchCount = await contract.getSwitchCount();
    const gasPrice = await provider.getGasPrice();

    for (let id = 1; id <= switchCount; id++) {
      let data;
      let estimate;
      let open = false;
      try {
        data = await contract.getSwitch(id);
        if (data[3].toString() < Date.now() / 1000 && (data[0].toString() == 0)) {
          open = true;
        }
        console.log('Data: ', data);
      } catch (err) {
        console.log('Error: ', err);
      }

      if (open) {
        estimate = await contract.estimateGas.executeSwitch(id);
        console.log(gasPrice.toString())
        list = [...list, { id: id, bounty: ethers.utils.formatEther(data[2]).toString(), gasEstimate: estimate.toString() }]
      }
    }

    setSwitchList(list);
    console.log(list);
  }

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }


  async function fetchSwitch() {
    console.log(switchId);
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      let data;
      try {
        data = await contract.getSwitch(parseInt(switchId));
        console.log('Data: ', data);
      } catch (err) {
        console.log('Error: ', err);
      }
      setFetchData([data[0].toString(), data[1], data[2].toString(), data[3].toString(), data[4][0], data[5][0].toString()]);
    }
  }

  async function executeSwitch() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      if (fetchData[3] < Date.now() / 1000 && (fetchData[0] == 0)) {
        await contract.executeSwitch(switchId);
        setExecuted('Successfully executed switch ' + switchId);
      }
      else {
        setExecuted('Switch closed or immature');
      }
    }
  }


  return (
    <div class="row align-items-center my-5">
      <div class="col-lg-7">
        <br />

        <input onChange={e => setSwitchId(e.target.value)} placeholder='Enter switch ID' />
        <button onClick={executeSwitch}>Execute</button>

        <br />

        {executed}
      </div>
      <div class="col-lg-5">
        <h1 class="font-weight-light">Executable switches</h1>
        <p>
          This is a list of switches that have matured and are open to execution.
          Bounty should exceed execution gas costs, but please double-check.
          <br />
          <button onClick={getActiveSwitches}>Retrieve active switches</button>
        </p>

        {switchList.length === 0 ? 'No executable switches found.' : switchList.map((x, i) => {
          return (
            <div className="box">
              Switch ID: {x.id}
              <br />
              Bounty: {x.bounty} ETH
              <br />
              Gas estimate: {x.gasEstimate}
              <br /> <br />
            </div>
          );
        })}
      </div>
    </div >
  );
}

export default Execute;