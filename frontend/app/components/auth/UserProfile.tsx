import React, { useState, useEffect } from "react";
import axios from "axios";

interface UserProfileProps {
  accessToken: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ accessToken }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get("/auth/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUser(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [accessToken]);

  const handleUpdateProfile = async () => {
    try {
      await axios.put(
        "/auth/profile",
        { name: user?.name, email: user?.email },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      // Handle successful update
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  const handleUpdatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      await axios.put(
        "/auth/profile",
        { currentPassword, password: newPassword },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      // Handle successful password update
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <button onClick={handleUpdateProfile}>Update Profile</button>
      <div>
        <h3>Update Password</h3>
        <input type="password" placeholder="Current Password" />
        <input type="password" placeholder="New Password" />
        <button
          onClick={() => handleUpdatePassword("currentPassword", "newPassword")}
        >
          Update Password
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
