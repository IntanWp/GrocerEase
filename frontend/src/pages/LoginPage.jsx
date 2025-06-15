import React from 'react';
import './LoginPage.css';
import logo from '../images/logo.png';
import userIcon from '../images/user.png';
import lockIcon from '../images/lock.png';
import belanjaan from '../images/belanjaan.png';

function LoginPage() {
  return (
    <div>
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>

      <div className="container">
        <div className="tagline-container">
          <h1 className="tagline">Organic & Healthy <br /> Products</h1>
          <p className="desc">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>

          <form>
            <div className="input-container">
              <img src={userIcon} alt="User Icon" className="input-icon" />
              <input type="text" name="username" placeholder="Username" />
            </div>

            <div className="input-container">
              <img src={lockIcon} alt="Password Icon" className="input-icon" />
              <input type="password" name="password" placeholder="Password" />
            </div>

            <div className="form-buttons">
              <button type="submit">Login</button>
              <button type="submit">Sign Up</button>
            </div>
          </form>
        </div>

        <div className="belanjaan-container">
          <img src={belanjaan} alt="belanjaan" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
