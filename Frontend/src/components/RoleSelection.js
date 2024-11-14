import React from "react";

function RoleSelection({ setMode }) {
  return (
    <div className="popup">
      <h3>Select Mode</h3>
      <div className="role-option">
        <button onClick={() => setMode("admin")} className="btn btn-primary">
          Admin
        </button>
        <p className="role-description">
          As an Admin, you can upload PDF documents and control the session's page navigation.
        </p>
      </div>
      <div className="role-option">
        <button onClick={() => setMode("user")} className="btn btn-secondary">
          User
        </button>
        <p className="role-description">
          As a User, you can join the session and view the shared content in real time.
        </p>
      </div>
    </div>
  );
}

export default RoleSelection;
