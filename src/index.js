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

const switchAddress = '0x38ce60F60038Da51Aefa7A588de61fdf8294880a';

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
