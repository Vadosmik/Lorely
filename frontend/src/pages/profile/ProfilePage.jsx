import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../../context/LanguageContext.jsx';

import { profileService } from '../../services/ProfileService.js';

import { toISODateString } from '../../utils/dateFormatter.js';

import ProfileView from './ProfileView.jsx';
import ProfileEditForms from './ProfileEditForms.jsx';

export default function ProfilePage({ username, onProfileUpdate }) {
  const [userData, setUserData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const { currentLang } = useLanguage();
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
        displayData.birthday_date = toISODateString(displayData.birthday_date);
      }

      setUserData(displayData);
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
      <ProfileView
        title={<h1>{isOwnProfile ? 'My Profile' : `${userData.username}'s Profile`}</h1>}
        userData={userData}
        currentLang={currentLang}
      />

      {isOwnProfile && (
        <ProfileEditForms
          initialUserData={userData}
          onProfileRefresh={handleProfileRefresh}
        />
      )}
    </div>
  );
}

const styles = {

};



// zrobić kaszowanie zdj utilitu, a potem common element CachedImage ktury bedzie miał logike z util
// import CachedImage from '../common/CachedImage';

// <CachedImage 
//   path={userData.ava_pic_path} 
//   fallback="/default_ava.jpg"
//   alt="User Avatar"
//   style={styles.avatarImg}
// />