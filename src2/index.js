import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Fetch from './components/Fetch'
import Execute from './components/Execute'
import reportWebVitals from './reportWebVitals';

const switchAddress = '0x09635F643e140090A9A8Dcd712eD6285858ceBef';


ReactDOM.render(
  <React.StrictMode>
    <App switchAddress={switchAddress} />
    <Fetch switchAddress={switchAddress} />
    <Execute switchAddress={switchAddress} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
