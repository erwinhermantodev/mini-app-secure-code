// src/routes/profile.tsx
import React, { useEffect, useState } from "react";
import ProfileForm from "../components/ProfileForm";
import { getUserProfile } from "../services/api";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getUserProfile();
      setProfile(data);
    };
    fetchProfile();
  }, []);

  return (
    <div>
      <h2>Profile</h2>
      {profile ? <ProfileForm currentProfile={profile} /> : <p>Loading...</p>}
    </div>
  );
};

export default Profile;
