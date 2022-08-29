import React from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="navbar bg-dark">
      <h1>
        <a href="./dashboard.html">
          <i className="fas fa-code"></i>DevConnector
        </a>
      </h1>
      <ul>
        <li>
          <a href="./profiles.html">Developers</a>
        </li>
        <li>
          <Link to="/register">Register</Link>
          {/* <a href="./register.html">Register</a> */}
        </li>
        <li>
          <Link to="/login">Login</Link>
          {/* <a href="./login.html">Login</a> */}
        </li>
      </ul>
    </nav>
  );
}
