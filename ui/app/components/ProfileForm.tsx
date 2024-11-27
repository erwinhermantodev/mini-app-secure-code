// src/components/ProfileForm.tsx
import React, { useState } from "react";
import Button from "./Button";
import { updateUserProfile } from "../services/api";

interface ProfileFormProps {
  currentProfile: { name: string; email: string };
}

const ProfileForm: React.FC<ProfileFormProps> = ({ currentProfile }) => {
  const [name, setName] = useState(currentProfile.name);
  const [email, setEmail] = useState(currentProfile.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ name, email });
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Button type="submit" className="submit-btn">
        Update Profile
      </Button>
    </form>
  );
};

export default ProfileForm;
