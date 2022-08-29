import React, { Fragment } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";

import Landing from "./component/layouts/Landing";
import NavBar from "./component/layouts/NavBar";
import Container from "./component/layouts/Container";

function App() {
  return (
    <Fragment>
      <NavBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Container />} />
      </Routes>
    </Fragment>
  );
}

export default App;
