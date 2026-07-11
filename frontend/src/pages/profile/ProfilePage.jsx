import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';

import { profileService } from '../../services/ProfileService.js';
import { storageService } from '../../services/StorageService.js';

import ProfileView from './ProfileView.jsx';
import ProfileEditForms from './ProfileEditForms.jsx';

export default function ProfilePage({ username, onProfileUpdate }) {
  const [userData, setUserData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState('');

  const { route } = useLocation();

  const fetchProfile = async () => {
    try {
      const me = await profileService.getMe();
      let displayData = null;

      if (me && me.username === username) {
        setIsOwnProfile(true);
        displayData = me;
      } else {
        setIsOwnProfile(false);
        displayData = await profileService.getUserByUsername(username);
      }

      if (!displayData) return;

      if (displayData.birthday_date) {
        displayData.birthday_date = displayData.birthday_date.split('T')[0];
      }

      setUserData(displayData);

      if (displayData.ava_pic_path) {
        const blob = await storageService.getFile(displayData.ava_pic_path);
        setAvatarUrl(URL.createObjectURL(blob));
      } else {
        setAvatarUrl(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (userData?.username) {
      document.title = userData.username;
    }
    return () => { document.title = 'Lorely'; };
  }, [userData]);

  const handleProfileRefresh = async (newUsername) => {
    if (onProfileUpdate) await onProfileUpdate();
    if (newUsername && newUsername !== username) {
      route(`/${newUsername}`);
    } else {
      await fetchProfile();
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!userData) return <div>User not found.</div>;

  return (
    <div>
      <h1>{isOwnProfile ? 'My Profile' : `${userData.username}'s Profile`}</h1>

      <ProfileView userData={userData} avatarUrl={avatarUrl} />

      {isOwnProfile && (
        <>
          <hr style={styles.hr} />
          <ProfileEditForms
            initialUserData={userData}
            initialAvatarUrl={avatarUrl}
            onProfileRefresh={handleProfileRefresh}
          />
        </>
      )}
    </div>
  );
}

const styles = {
  hr: { borderColor: '#333', marginBottom: '20px' }
};