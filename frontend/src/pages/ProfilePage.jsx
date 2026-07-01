import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';
import { profileService } from '../services/ProfileServiece.js';
import { storageService } from '../services/storageService.js';

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [initialData, setInitialData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');

  const { route } = useLocation();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await profileService.getMe();

        if (data && data.birthday_date) {
          data.birthday_date = data.birthday_date.split('T')[0];
        }

        setUserData(data);
        setInitialData(data);

        if (data && data.ava_pic_path) {
          const blob = await storageService.getFile(data.ava_pic_path);
          const url = URL.createObjectURL(blob);
          setAvatarUrl(url);
        }
      } catch (err) {
        setError('Failed to fetch profile data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value === '' ? null : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Updating profile...');

    const updatePayload = {};
    const fields = ['username', 'email', 'bio', 'birthday_date'];

    fields.forEach((field) => {
      if (userData[field] !== initialData[field]) {
        updatePayload[field] = userData[field];
      }
    });

    if (Object.keys(updatePayload).length === 0) {
      setStatus('No changes detected.');
      return;
    }

    try {
      await profileService.updateMyInfo(updatePayload);

      setInitialData({ ...userData });
      if (onProfileUpdate) await onProfileUpdate();

      setStatus('Profile updated successfully!');

      if (userData?.username) {
        route(`/${userData.username}`);
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleSubmitPass = async (e) => {
    e.preventDefault();
    setStatus('Changing password...');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatus('Error: New passwords do not match!');
      return;
    }

    try {
      const passwordPayload = {
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword
      };

      await profileService.updateMyPassword(passwordPayload);
      setStatus('Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatus('Error: Please select a file first!');
      return;
    }

    setStatus('Changing ava...');

    try {
      if (userData && userData.ava_pic_path) {
        try {
          await storageService.deleteFile(userData.ava_pic_path);
        } catch (delErr) {
          console.warn("Old file not found on storage, skipping deletion:", delErr);
        }
      }

      const newAvaPath = await storageService.uploadFile('avatars', selectedFile);

      const updatePayload = {
        ava_pic_path: newAvaPath
      };

      const updatedUser = await profileService.updateMyInfo(updatePayload);
      setUserData(updatedUser);
      setSelectedFile(null);

      setStatus('Ava changed successfully!');
      if (userData?.username) {
        route(`/${userData.username}`);
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleAvatarDelete = async () => {
    if (!userData?.ava_pic_path) {
      setStatus('You don\'t have an avatar to delete.');
      return;
    }

    setStatus('Deleting ava...');

    try {
      await storageService.deleteFile(userData.ava_pic_path);

      const updatePayload = {
        ava_pic_path: null
      };

      const updatedUser = await profileService.updateMyInfo(updatePayload);

      setUserData(updatedUser);
      setAvatarUrl(null);
      setSelectedFile(null);

      setStatus('Ava deleted successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  if (loading) return <div style={styles.center}>Loading profile...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div>
      <h1>Profile</h1>

      <img
        src={avatarUrl || '/default_ava.jpg'}
        alt="User Avatar"
        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
      />

      <h3>Username:</h3>
      <p>{userData.username}</p>

      <h3>Email:</h3>
      <p>{userData.email}</p>

      <h3>Bio:</h3>
      <p>{userData.bio}</p>

      <h3>Birthday date:</h3>
      <p>{userData.birthday_date}</p>

      <hr style={styles.hr} />

      <h2>Update Data</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="luesername" style={styles.label}>Username:</label>
          <input
            type="text"
            id="luesername"
            name="username"
            style={styles.input}
            minLength={3}
            maxLength={20}
            pattern="^[a-zA-Z0-9_]+$"
            value={userData?.username || ''}
            onInput={handleChange}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="lmail" style={styles.label}>Email:</label>
          <input
            type="email"
            id="lmail"
            name="email"
            style={styles.input}
            value={userData?.email || ''}
            onInput={handleChange}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="lbio" style={styles.label}>Bio:</label>
          <textarea
            id="lbio"
            name="bio"
            style={{ ...styles.input, resize: 'vertical', minHeight: '60px' }}
            value={userData?.bio || ''}
            onInput={handleChange}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="lbirthday" style={styles.label}>Birthday Date:</label>
          <input
            type="date"
            id="lbirthday"
            name="birthday_date"
            style={styles.input}
            value={userData?.birthday_date || ''}
            onInput={handleChange}
          />
        </div>

        <button type="submit" style={styles.submitBtn}>Update</button>
      </form>

      <hr style={styles.hr} />

      <h2>Update Password</h2>
      <form onSubmit={handleSubmitPass}>
        <div style={styles.formGroup}>
          <label htmlFor="oldPassword" style={styles.label}>Old Password:</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={passwordForm.oldPassword}
            onInput={handlePasswordChange}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="newPassword" style={styles.label}>New Password:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={passwordForm.newPassword}
            onInput={handlePasswordChange}
            minLength={8}
            pattern="^[-a-zA-Z0-9+*=_!?@#$%&~.]+$"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="confirmPassword" style={styles.label}>Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onInput={handlePasswordChange}
            required
          />
        </div>

        <button type="submit" style={styles.submitBtn}>Update Password</button>
      </form>

      <hr style={styles.hr} />

      <h2>Update Ava</h2>
      <form onSubmit={handleAvatarSubmit}>
        <label htmlFor="avatar" style={{ cursor: 'pointer' }}>
          <img
            src={avatarUrl || '/default_ava.jpg'}
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
            alt="Avatar"
          />
        </label>

        <input
          id="avatar"
          type="file"
          name="avatar"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button type="submit">
          Update Ava
        </button>

        {/* NAPRAWIONO: Zmiana typu na 'button' i dodanie onClick */}
        <button type="button" onClick={handleAvatarDelete}>
          Delete Ava
        </button>
      </form>

      {status && <p>{status}</p>}
    </div>
  );
}

const styles = {
  hr: {
    borderColor: '#333',
    marginBottom: '20px',
  }
};