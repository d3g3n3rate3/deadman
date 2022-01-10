import React from 'react'
import { useState } from 'react';
import { ethers } from 'ethers'
import '../App.css';
import styles from '../mystyle.module.css';
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

function Execute(props) {

    const [switchId, setSwitchId] = useState();
    const [fetchData, setFetchData] = useState([0, 0, 0, 0, 0, 0]);
    const [executed, setExecuted] = useState('');

    async function requestAccount() {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
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

    async function executeSwitch() {
        if (typeof window.ethereum !== 'undefined') {
            await requestAccount();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(props.switchAddress, SwitchFactory.abi, signer);
            if (fetchData[3] < Date.now() / 1000 && (fetchData[0] == 0)) {
                const tx = await contract.executeSwitch(switchId);
                await tx.wait();
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
                <button onClick={requestAccount}>Connect to Metamask</button>
                <br />

                <input onChange={e => setSwitchId(e.target.value)} placeholder='Enter switch ID' />
                <button onClick={executeSwitch}>Execute</button>

                <br />

                {executed}
            </div>
            <div class="col-lg-5">
                <h1 class="font-weight-light">Home page</h1>
                <p>
                    Lorem Ipsum is simply dummy text of the printing and typesetting
                    industry. Lorem Ipsum has been the industry's standard dummy text
                    ever since the 1500s, when an unknown printer took a galley of
                    type and scrambled it to make a type specimen book.
                </p>
            </div>
        </div>
    );
}

export default Execute;