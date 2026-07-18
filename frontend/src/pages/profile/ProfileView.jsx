import { formatDateByLang } from '../../utils/dateFormatter'
import CachedImage from '../../components/common/CachedImage'

import { DEFAULT_AVATAR } from '../../utils/imageCache';

export default function ProfileView({ title, userData, avatarUrl, currentLang }) {
  return (
    <>
      {title}
      <div style={styles.avatarContainer}>
        <CachedImage 
          path={userData.ava_pic_path}
          fallback={DEFAULT_AVATAR}
          alt="User Avatar"
          style={styles.avatarImg}
        />
      </div>

      <div style={styles.infoGrid}>
        <span style={styles.label}>Username</span>
        <p style={styles.value}>{userData.username}</p>

        <span style={styles.label}>Email</span>
        <p style={styles.value}>{userData.email}</p>

        <div style={styles.infoGroup}>
          <span style={styles.label}>Bio:</span>
          <span style={styles.value}>{userData.bio || '—'}</span>
        </div>

        <div style={styles.infoGroup}>
          <span style={styles.label}>Birthday date:</span>
          <span style={styles.value}>{formatDateByLang(userData.birthday_date, currentLang)}</span> 
        </div>
      </div>
    </>
  )
}

const styles = {
  avatarContainer: {
    width: '140px',
    height: '200px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-text-muted)',
  },
  value: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: 'var(--color-text)',
    margin: 0,
  },
};