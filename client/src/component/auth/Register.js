import React, { Fragment, useState } from "react";
import axios from "axios";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  let { name, email, password, password2 } = formData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // verify password
    if (password !== password2) {
      return alert("Passwords do not match");
    }
    // send registration request
    const res = await axios.post("api/users", {
      name,
      email,
      password,
    });
    // save token
    const {
      data: { token },
    } = res;
    localStorage.setItem("token", token);
  };

  return (
    <Fragment>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead">
        <i className="fas fa-user"></i>Create Your Account
      </p>
      <form className="form" onSubmit={(e) => handleSubmit(e)}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
            }}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
            }}
            required
          />
          <small className="form-text">
            This site uses Gravatar, so if you want a profile image, use a
            Gravatar email.
          </small>
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
            }}
            minLength="6"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            value={password2}
            onChange={(e) => {
              setFormData({ ...formData, password2: e.target.value });
            }}
            minLength="6"
          />
        </div>
        <div className="form-group">
          <input type="submit" className="btn btn-primary" value="Register" />
        </div>
      </form>
      <p className="my-1">
        Already have an account? <a href="./login.html">Sign in</a>{" "}
      </p>
    </Fragment>
  );
}
