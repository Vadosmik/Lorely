import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../../context/LanguageContext.jsx';

import { profileService } from '../../services/ProfileService.js';

import { toISODateString } from '../../utils/dateFormatter.js';

import ProfileView from './ProfileView.jsx';
import ProfileEditForms from './ProfileEditForms.jsx';

const langOptions = {
  "en": "English",
  "pl": "Polski",
  "by": "Беларуская",
  "ru": "Русский"
};

export default function ProfilePage({ currentUser, username, onProfileUpdate, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const { currentLang, changeLang } = useLanguage();
  const { route } = useLocation();

  const fetchProfile = async () => {
    try {
      if (currentUser && currentUser.username === username) {
        setIsOwnProfile(true);
        setUserData({
          ...currentUser,
          birthday_date: currentUser.birthday_date ? toISODateString(currentUser.birthday_date) : null
        });
      } else {
        setIsOwnProfile(false);
        const externalData = await profileService.getUserByUsername(username);
        if (externalData && externalData.birthday_date) {
          externalData.birthday_date = toISODateString(externalData.birthday_date);
        }
        setUserData(externalData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, currentUser]);

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
    <>
      <section>
        {isOwnProfile && (
          <div style={styles.setting}>
            <button onClick={onLogout} style={{ ...styles.link, ...styles.button }}>{('logout')}</button>
            <select value={currentLang} onChange={(e) => changeLang(e.target.value)} >
              {Object.entries(langOptions).map(([code, name]) => (
                <option key={code} value={code}> {name} </option>
              ))}
            </select>
          </div>
        )}
      </section>
      <section>
        <ProfileView
          title={<h1>{isOwnProfile ? 'My Profile' : `${userData.username}'s Profile`}</h1>}
          userData={userData}
          currentLang={currentLang}
        />
      </section>

      <section>
        {isOwnProfile && (
          <ProfileEditForms
            initialUserData={userData}
            onProfileRefresh={handleProfileRefresh}
          />
        )}
      </section>
    </>
  );
}

const styles = {
  setting: {
    display: 'flex',
    justifyContent: 'space-between',
  }
};