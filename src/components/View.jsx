import React from 'react'
import { useState } from 'react';
import { ethers } from 'ethers'
import SwitchFactory from '../artifacts/contracts/SwitchFactory.sol/SwitchFactory.json';


function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  return time;
}

function View(props) {

  const [switchId, setSwitchId] = useState();
  const [fetchData, setFetchData] = useState([]);
  const [cancelled, setCancelled] = useState('');

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }


  async function fetchSwitch() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(props.switchAddress, SwitchFactory.abi, provider);
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

  async function cancelSwitch() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(props.switchAddress, SwitchFactory.abi, signer);
      let tx;
      try {
        tx = await contract.cancelSwitch(parseInt(switchId), false);
        await tx.wait();
        console.log('Data: ', tx);
      } catch (err) {
        console.log('Error: ', err);
      }
      //setCancelled(tx.receipt == true ? 'Successfully cancelled' : 'Failed to cancel');
    }
  }

  async function cancelAndWithdraw() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(props.switchAddress, SwitchFactory.abi, signer);
      let tx;
      try {
        tx = await contract.cancelSwitch(parseInt(switchId), true);
        await tx.wait();
        console.log('Data: ', tx);
      } catch (err) {
        console.log('Error: ', err);
      }
      console.log(tx.receipt)
      //setCancelled(tx.receipt == 1 ? 'Successfully cancelled and withdrew' : 'Failed to cancel');
    }
  }



  if (fetchData.length === 0) {
    return (
      <>
        <input onChange={e => setSwitchId(e.target.value)} placeholder='Enter switch ID' />
        <button onClick={fetchSwitch}>Fetch</button>
      </>
    );
  } else {
    return (
      <>
        <input onChange={e => setSwitchId(e.target.value)} placeholder='Enter switch ID' />
        <button onClick={fetchSwitch}>Fetch</button>

        <br />
        Status: {(fetchData[0] == 0) ? 'Open' : 'Closed'}
        <br />
        Matured: {(fetchData[3] < Date.now() / 1000) ? 'Yes' : 'No'}
        <br />
        Owner: {fetchData[1]}
        <br />
        Bounty: {fetchData[2]}
        <br />
        Maturation: {timeConverter(fetchData[3])})

        <br /> <br />

        <button onClick={cancelSwitch}>Cancel switch</button>
        <br />
        <button onClick={cancelAndWithdraw}>Cancel switch and withdraw</button>
        {cancelled}
      </>
    );
  }
}

export default View;