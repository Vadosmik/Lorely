import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';

import { profileService } from '../../services/ProfileServiece.js';
import { storageService } from '../../services/StorageService.js';

export default function ProfileEditForms({ initialUserData, initialAvatarUrl, onProfileRefresh }) {
  const [formData, setFormData] = useState(initialUserData);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(initialAvatarUrl);
  const [selectedFile, setSelectedFile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState('');

  const { route } = useLocation();

  useEffect(() => {
    setFormData(initialUserData);
    setCurrentAvatarUrl(initialAvatarUrl);
  }, [initialUserData, initialAvatarUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setCurrentAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Updating profile...');

    const updatePayload = {};
    ['username', 'email', 'bio', 'birthday_date'].forEach((field) => {
      if (formData[field] !== initialUserData[field]) {
        updatePayload[field] = formData[field];
      }
    });

    if (Object.keys(updatePayload).length === 0) {
      setStatus('No changes detected.');
      return;
    }

    try {
      await profileService.updateMyInfo(updatePayload);
      setStatus('Profile updated successfully!');
      if (onProfileRefresh) await onProfileRefresh(formData.username);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleSubmitPass = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatus('Error: New passwords do not match!');
      return;
    }
    try {
      await profileService.updateMyPassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword
      });
      setStatus('Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return setStatus('Error: Please select a file first!');

    try {
      if (formData?.ava_pic_path) {
        try { await storageService.deleteFile(formData.ava_pic_path); } catch (e) {}
      }
      const newAvaPath = await storageService.uploadFile('avatars', selectedFile);
      await profileService.updateMyInfo({ ava_pic_path: newAvaPath });
      setSelectedFile(null);
      setStatus('Ava changed successfully!');
      if (onProfileRefresh) await onProfileRefresh(formData.username);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

 const handleAvatarDelete = async () => {
    if (!formData?.ava_pic_path) return setStatus("You don't have an avatar to delete.");

    try {
      await storageService.deleteFile(formData.ava_pic_path);
      await profileService.updateMyInfo({ ava_pic_path: null });
      setSelectedFile(null);
      setStatus('Ava deleted successfully!');
      if (onProfileRefresh) await onProfileRefresh(formData.username);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  if (!formData) return null;

  return (
    <>
      <h2>Update Ava</h2>
      <form onSubmit={handleAvatarSubmit}>
        <label htmlFor="avatar" style={{ cursor: 'pointer' }}>
          <img src={currentAvatarUrl || '/default_ava.jpg'} style={styles.avatarImg} alt="Avatar" />
        </label>
        <input id="avatar" type="file" name="avatar" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        <button type="submit">Update Ava</button>
        <button type="button" onClick={handleAvatarDelete}>Delete Ava</button>
      </form>

      <h2>Update Data</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="luesername">Username:</label>
          <input type="text" id="luesername" name="username" minLength={3} maxLength={20} pattern="^[a-zA-Z0-9_]+$" value={formData.username || ''} onInput={handleChange} required />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="lmail">Email:</label>
          <input type="email" id="lmail" name="email" value={formData.email || ''} onInput={handleChange} required />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="lbio">Bio:</label>
          <textarea id="lbio" name="bio" style={{ resize: 'vertical', minHeight: '60px' }} value={formData.bio || ''} onInput={handleChange} />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="lbirthday">Birthday Date:</label>
          <input type="date" id="lbirthday" name="birthday_date" value={formData.birthday_date || ''} onInput={handleChange} />
        </div>
        <button type="submit">Update</button>
      </form>

      <hr style={styles.hr} />
      <h2>Update Password</h2>
      <form onSubmit={handleSubmitPass}>
        <div style={styles.formGroup}>
          <label htmlFor="oldPassword">Old Password:</label>
          <input type="password" id="oldPassword" name="oldPassword" value={passwordForm.oldPassword} onInput={handlePasswordChange} required />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="newPassword">New Password:</label>
          <input type="password" id="newPassword" name="newPassword" value={passwordForm.newPassword} onInput={handlePasswordChange} minLength={8} pattern="^[-a-zA-Z0-9+*=_!?@#$%&~.]+$" required />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input type="password" id="confirmPassword" name="confirmPassword" value={passwordForm.confirmPassword} onInput={handlePasswordChange} required />
        </div>
        <button type="submit">Update Password</button>
      </form>
      {status && <p>{status}</p>}
    </>
  );
}

const styles = {
  hr: { borderColor: '#333', marginBottom: '20px' },
  formGroup: { marginBottom: '15px' },
  avatarImg: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }
};