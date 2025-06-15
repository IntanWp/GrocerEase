import React from 'react';
import './ButtonStyles.css';
import user1 from '../images/user1.png';

const UserInvite = () => {
  return (
    <div className="user-invite-container">
      <div className="user-icons">
        <img src={user1} alt="User 1" className="user-icon" />
        <img src={user1} alt="User 1" className="user-icon" />
      </div>
      <div className="button-container">
        <button className="button invite-button">Invite</button>
        <button className="button end-button">End</button>
      </div>
    </div>
  );
};

export default UserInvite;
