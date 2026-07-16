import { useLocation } from 'preact-iso';
import { useState, useCallback, useEffect } from 'preact/hooks';
import CachedImage from '../../components/common/CachedImage'
import { DEFAULT_AVATAR } from '../../utils/imageCache';

import { adminService } from '../../services/AdminService';
import { useToast } from '../../context/ToastContext';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const { showToast } = useToast();

  const loadUsers = async () => {
    try {
      const fetchedUsers = await adminService.getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      showToast(err.message || 'Failed to fetch users.', 'error');
    }
  }

  useEffect(() => {
    loadUsers();
  }, [])

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Users Management ({users.length})</h3>

      <div style={styles.usersGrid}>
        {users.map(user => {
          const isActive = user.is_active;
          const isDeleted = !!user.deleted_at;

          return (
            <div key={user.id} style={styles.userCard}>

              {/* NAGŁÓWEK KARTY: Awatar, Nick, Główne statusy */}
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                  {user.ava_pic_path ? (
                    <CachedImage
                      path={user.ava_pic_path}
                      fallback={DEFAULT_AVATAR}
                      alt={user.username}
                      style={styles.avatarImg}
                    />
                  ) : (
                    user.username.substring(0, 2).toUpperCase()
                  )}
                </div>

                <div style={styles.headerMeta}>
                  <h4 style={styles.username}>
                    {user.username}
                    <span style={styles.userId}>#{user.id}</span>
                  </h4>
                  <p style={styles.email}>{user.email}</p>
                </div>

                {/* Statusy użytkownika */}
                <div style={styles.statusContainer}>
                  {isDeleted ? (
                    <span style={{ ...styles.badge, ...styles.badgeDeleted }}>Deleted</span>
                  ) : isActive ? (
                    <span style={{ ...styles.badge, ...styles.badgeActive }}>Active</span>
                  ) : (
                    <span style={{ ...styles.badge, ...styles.badgeInactive }}>Inactive</span>
                  )}
                </div>
              </div>

              {/* BIO */}
              <div style={styles.bioSection}>
                <span style={styles.label}>Bio</span>
                <p style={styles.bioText}>{user.bio || 'No bio provided.'}</p>
              </div>

              {/* ROLE UŻYTKOWNIKA */}
              <div style={styles.rolesSection}>
                <span style={styles.label}>Roles</span>
                <div style={styles.rolesList}>
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map(role => (
                      <span key={role.id} style={styles.roleBadge}>
                        {role.title}
                      </span>
                    ))
                  ) : (
                    <span style={styles.noRoles}>No roles assigned</span>
                  )}
                </div>
              </div>

              <hr style={styles.divider} />

              {/* METADANE DLA ADMINA (Daty) */}
              <div style={styles.metaGrid}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Registered</span>
                  <span style={styles.metaValue}>{(user.created_at)}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Birthday</span>
                  <span style={styles.metaValue}>{(user.birthday_date)}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Last Login</span>
                  <span style={styles.metaValue}>{(user.last_login_at)}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>ToS Accepted</span>
                  <span style={styles.metaValue}>{user.tos_accepted_at ? 'Yes' : 'No'}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    marginBottom: '20px',
    color: 'var(--color-text)',
  },
  usersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  userCard: {
    background: '#1e1e1e', // Ciemny, elegancki motyw
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#444',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  headerMeta: {
    flexGrow: 1,
  },
  username: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#fff',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  userId: {
    fontSize: '0.8rem',
    color: '#666',
  },
  email: {
    margin: '2px 0 0 0',
    fontSize: '0.85rem',
    color: '#aaa',
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  badge: {
    fontSize: '0.75rem',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: 'bold',
  },
  badgeActive: {
    background: 'rgba(40, 167, 69, 0.2)',
    color: '#28a745',
  },
  badgeInactive: {
    background: 'rgba(255, 193, 7, 0.2)',
    color: '#ffc107',
  },
  badgeDeleted: {
    background: 'rgba(220, 53, 69, 0.2)',
    color: '#dc3545',
  },
  label: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: '#666',
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '4px',
  },
  bioSection: {
    background: '#151515',
    padding: '8px 12px',
    borderRadius: '6px',
  },
  bioText: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#ccc',
    fontStyle: 'italic',
  },
  rolesSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  rolesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '4px',
  },
  roleBadge: {
    background: '#3498db',
    color: '#fff',
    fontSize: '0.75rem',
    padding: '3px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  noRoles: {
    fontSize: '0.85rem',
    color: '#555',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #333',
    margin: '8px 0',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  metaLabel: {
    fontSize: '0.7rem',
    color: '#555',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: '0.85rem',
    color: '#bbb',
  },
}