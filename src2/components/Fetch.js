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

function Fetch(props) {

    const [switchId, setSwitchId] = useState();
    const [fetchData, setFetchData] = useState([0, 0, 0, 0, 0, 0]);

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
            Maturation: {timeConverter(fetchData[3])}
        </>
    );
}

export default Fetch;