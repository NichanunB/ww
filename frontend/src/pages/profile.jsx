import React, {useState} from "react";
import "../components/styles/profile.css";

function Profile() {
  const [username, setUsername] = useState("Username");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(username);

  const handleEditClick = () => {
    setTempName(username);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setUsername(tempName.trim() !== "" ? tempName : username);
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-image"></div>

      {isEditing ? (
        <input
          className="username-input"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
        />
      ) : (
        <h2 className="username">{username}</h2>
      )}

      <div className="button-group">
        {isEditing ? (
          <button className="profile-button" onClick={handleSaveClick}>
            Save
          </button>
        ) : (
          <button className="profile-button" onClick={handleEditClick}>
            Edit name
          </button>
        )}
        <button className="profile-button">Edit profile</button>
      </div>
    </div>
  );
}

export default Profile;
