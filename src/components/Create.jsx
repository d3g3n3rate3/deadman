import React from "react";
import SwitchFactory from '../artifacts/contracts/SwitchFactory.sol/SwitchFactory.json';
import { useState } from 'react';
import { ethers } from 'ethers'
import styles from '../mystyle.module.css';



function Create(props) {
  const [bounty, setBounty] = useState();
  const [delay, setDelay] = useState();
  const [inputList, setInputList] = useState([{ recipient: "", amount: "" }]);
  const [switchId, setSwitchId] = useState();
  const [fetchData, setFetchData] = useState([0, 0, 0, 0, 0, 0]);
  const [submitted, setSubmitted] = useState('');

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function createSwitch() {
    if (!bounty || !delay) { console.log(1); return; }

    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(props.switchAddress, SwitchFactory.abi, signer);

      let recipients = []
      let amounts = []
      let total_amount = ethers.BigNumber.from(0)
      for (let i = 0; i < inputList.length; i++) {
        recipients = [...recipients, inputList[i]['recipient']];
        amounts = [...amounts, ethers.utils.parseEther(inputList[i]['amount'])];
        total_amount = total_amount.add(ethers.utils.parseEther(inputList[i]['amount']));
      }

      const bounty_wei = ethers.utils.parseEther(bounty);
      const delay_sec = Math.floor(delay * 3600)

      console.log(total_amount)
      console.log(bounty_wei)
      console.log(total_amount.add(bounty_wei))

      const transaction = await contract.newSwitch(recipients, amounts, bounty_wei, delay_sec, { value: total_amount.add(bounty_wei) });
      await transaction.wait();

      console.log('Successfully submitted switch!');
      const switchCount = await contract.getSwitchCount();
      setSubmitted('Successfully submitted switch with ID: ' + switchCount);
    }
  }

  async function fetchSwitch() {
    console.log(switchId);
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

  // handle input change
  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...inputList];
    list[index][name] = value;
    setInputList(list);
  };

  // handle click event of the Remove button
  const handleRemoveClick = index => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(list);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    setInputList([...inputList, { recipient: "", amount: "" }]);
  };

  function Hello(props) {
    return (<div>Hello</div>)
  }

  return (
    <div className="home">
      <div class="container">
        <div class="row align-items-center my-5">
          <div class="col-lg-7">
            <button onClick={requestAccount}>Connect to Metamask</button>
            <br />
            Network: Ropsten
            <br />
            <Hello />

            {inputList.map((x, i) => {
              return (
                <div className="box">
                  Recipient
                  <input
                    name="recipient"
                    key={"recipient" + i}
                    placeholder="Enter recipient address"
                    value={x.recipient}
                    onChange={e => handleInputChange(e, i)}
                  />
                  Amount
                  <input
                    name="amount"
                    key={"amount" + i}
                    placeholder="Enter amount (in ETH)"
                    value={x.amount}
                    onChange={e => handleInputChange(e, i)}
                  />
                  <div className="btn-box">
                    {inputList.length !== 1 && <button
                      className="mr10"
                      key={"remove" + i}
                      onClick={() => handleRemoveClick(i)} >Remove</button>}
                    {inputList.length - 1 === i && <button
                      onClick={handleAddClick}
                      key={"add" + i}>Add</button>}
                  </div>
                </div>
              );
            })}
            <br />
            <div>
              Executor bounty:
              <input onChange={e => setBounty(e.target.value)}
                placeholder="Set bounty (in ETH)" />
            </div>
            <div>
              Execution delay:
              <input onChange={e => setDelay(e.target.value)}
                placeholder="Set delay (in hours)" />
            </div>
            <br />
            <button className={styles.greenbutton} onClick={createSwitch}>Submit switch</button>
            <br />
            {submitted}
          </div>
          <div class="col-lg-5">
            <h1 class="font-weight-light">Create a new Deadman switch</h1>
            <p>
              Deadman is a simple dead man's switch dapp that allows you to
              send ETH to a list of beneficiaries after a set delay has passed.
              To create a new switch, specify the addresses and amounts, and set
              the delay and bounty. The bounty is used to reward other users for
              executing your switch after the delay has passed. It should be set
              so that it covers gas costs and a small reward on top. You can view
              any switch using its ID on the View tab, or execute matured switch in
              the Execute tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Create;
