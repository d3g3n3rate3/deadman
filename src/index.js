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

const switchAddress = '0x6153d842b1ADD70d721d19Ab7b5853501a062b1C';

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
