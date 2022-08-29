import React from "react";
import { Routes, Route } from "react-router-dom";
import Register from "../auth/Register";
import Login from "../auth/Login";
import Alert from "./Alert";

export default function Container() {
  return (
    <section className="container">
      <Alert />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </section>
  );
}
