import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Navigation,
  Footer,
  Create,
  View,
  Execute,
} from "./components";

const switchAddress = '0xaB79aC5B7ACa53B9d78A26D0594f2aa859b509E8';

ReactDOM.render(
  <Router>
    <Navigation />
    <Routes>
      <Route path="/" element={<Create switchAddress={switchAddress} />} />
      <Route path="/view" element={<View switchAddress={switchAddress} />} />
      <Route path="/execute" element={<Execute switchAddress={switchAddress} />} />
    </Routes>
    <Footer />
  </Router>,

  document.getElementById("root")
);

serviceWorker.unregister();
