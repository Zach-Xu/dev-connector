import React, { Fragment } from "react";

export default function Login() {
  return (
    <Fragment>
      <div className="alert alert-danger">Invalid Credentials</div>
      <h1 className="large text-primary">Sign In</h1>
      <p className="lead">
        <i className="fas fa-user"></i>Sign into Your Account
      </p>
      <form action="./create-profile.html" className="form">
        <div className="form-group">
          <input type="email" placeholder="Email Address" required />
        </div>
        <div className="form-group">
          <input type="password" placeholder="Password" minlength="6" />
        </div>
        <div className="form-group">
          <input type="submit" className="btn btn-primary" value="Login" />
        </div>
      </form>
      <p className="my-1">
        Don't have an account? <a href="./login.html">Sign Up</a>{" "}
      </p>
    </Fragment>
  );
}
