import { useState, useEffect } from 'preact/hooks';

import { useToast } from '../../context/ToastContext.jsx';

import { profileService } from '../../services/ProfileService.js';
import { storageService } from '../../services/StorageService.js';

import CachedImage from '../../components/common/CachedImage';
import { invalidateImageCache, DEFAULT_AVATAR } from '../../utils/imageCache';

export default function ProfileEditForms({ initialUserData, onProfileRefresh }) {
  const [formData, setFormData] = useState(initialUserData);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    setFormData(initialUserData);
    setSelectedFile(null);
    setCurrentAvatarUrl(null);
  }, [initialUserData]);

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
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => setCurrentAvatarUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showToast('Updating profile data...', 'info');

    const updatePayload = {};
    ['username', 'email', 'bio', 'birthday_date'].forEach((field) => {
      if (formData[field] !== initialUserData[field]) {
        updatePayload[field] = formData[field];
      }
    });

    if (Object.keys(updatePayload).length === 0) {
      showToast('No changes detected.', 'info');
      return;
    }

    try {
      await profileService.updateMyInfo(updatePayload);
      showToast('Profile updated successfully!', 'success');
      if (onProfileRefresh) await onProfileRefresh(formData.username);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleSubmitPass = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    try {
      showToast('Changing password...', 'info');
      await profileService.updateMyPassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword
      });
      showToast('Password changed successfully!', 'success');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return showToast('Please select a file first!', 'error');

    const oldAvaPath = formData?.ava_pic_path;

    try {
      showToast('Uploading new avatar...', 'info');
      if (oldAvaPath) {
        invalidateImageCache(oldAvaPath);
        try {
          await storageService.deleteFile(oldAvaPath);
        } catch (e) { }
      }

      const newAvaPath = await storageService.uploadFile('avatars', selectedFile);
      await profileService.updateMyInfo({ ava_pic_path: newAvaPath });

      setSelectedFile(null);
      setCurrentAvatarUrl(null);

      showToast('Avatar changed successfully!', 'success');
      if (onProfileRefresh) await onProfileRefresh(formData.username);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleAvatarDelete = async () => {
    const oldAvaPath = formData?.ava_pic_path;
    if (!oldAvaPath) {
      return showToast("You don't have an avatar to delete.", 'error');
    }

    try {
      showToast('Deleting avatar...', 'info');

      invalidateImageCache(oldAvaPath);

      await storageService.deleteFile(oldAvaPath);
      await profileService.updateMyInfo({ ava_pic_path: null });

      setSelectedFile(null);
      setCurrentAvatarUrl(null);

      showToast('Avatar deleted successfully!', 'success');
      if (onProfileRefresh) await onProfileRefresh(formData.username);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  if (!formData) return null;

  return (
    <>
      <h2>Update Ava</h2>
      <form onSubmit={handleAvatarSubmit}>
        <label htmlFor="avatar" style={{ cursor: 'pointer' }}>
          <CachedImage
            path={formData.ava_pic_path}
            previewUrl={currentAvatarUrl}
            fallback={DEFAULT_AVATAR}
            alt="User Avatar"
            style={styles.avatarImg}
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
    </>
  );
}

const styles = {
  formGroup: { marginBottom: '15px' },
  avatarImg: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }
};