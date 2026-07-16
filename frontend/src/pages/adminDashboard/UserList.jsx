import { useLocation } from 'preact-iso';
import { useState, useCallback, useEffect } from 'preact/hooks';
import CachedImage from '../../components/common/CachedImage'
import { DEFAULT_AVATAR } from '../../utils/imageCache';

import { adminService } from '../../services/AdminService';
import { useToast } from '../../context/ToastContext';

export default function UserList() {
  const [users, setUsers] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleChoiseUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      showToast('Please select a user', 'error');
      return;
    }
  };

  const filteredUsers = users
    .filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  return (
    <>
      <h3 style={styles.header}>Users Management</h3>
      <form onSubmit={handleChoiseUser}>
        <input
          type="search"
          list="users-list"
          placeholder="Type to search user..."
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            setSearchQuery(value);

            const foundUser = users.find(user => user.username === value);
            if (foundUser) {
              setSelectedUser(foundUser);
            } else {
              setSelectedUser(null);
            }
          }}
        />
        <datalist id="users-list">
          {filteredUsers.map(user => (
            <option key={user.id} value={user.username} />
          ))}
        </datalist>
      </form>

      <div style={styles.userInfo}>
        {selectedUser ? (
          (() => {
            const isActive = selectedUser.is_active;
            const isDeleted = !!selectedUser.deleted_at;

            return (
              <>
                {/* NAGŁÓWEK KARTY: Awatar, Nick, Główne statusy */}
                <div style={styles.cardHeader}>
                  <div style={styles.avatar}>
                    {selectedUser.ava_pic_path ? (
                      <CachedImage
                        path={selectedUser.ava_pic_path}
                        fallback={DEFAULT_AVATAR}
                        alt={selectedUser.username}
                        style={styles.avatarImg}
                      />
                    ) : (
                      selectedUser.username.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <div style={styles.headerMeta}>
                    <h4 style={styles.username}>
                      {selectedUser.username}
                      <span style={styles.userId}>#{selectedUser.id}</span>
                    </h4>
                    <p style={styles.email}>{selectedUser.email}</p>
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
                  <p style={styles.bioText}>{selectedUser.bio || 'No bio provided.'}</p>
                </div>

                <div style={styles.rolesSection}>
                  <span style={styles.label}>Roles</span>
                  <div style={styles.rolesList}>
                    {selectedUser.roles && selectedUser.roles.length > 0 ? (
                      selectedUser.roles.map(role => (
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
                    <span style={styles.metaValue}>{(selectedUser.created_at)}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Birthday</span>
                    <span style={styles.metaValue}>{(selectedUser.birthday_date)}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Last Login</span>
                    <span style={styles.metaValue}>{(selectedUser.last_login_at)}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>ToS Accepted</span>
                    <span style={styles.metaValue}>{selectedUser.tos_accepted_at ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </>
            );
          })()
        ) : (
          <p>please select user</p>
        )}
      </div>
    </>
  )
}
const styles = {
  header: {
    marginBottom: '20px',
    color: 'var(--color-text)',
  },
  userInfo: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
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
    background: 'var(--color-accent)',
    color: 'var(--color-surface)',
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
    color: 'var(--color-text)',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  userId: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    opacity: 0.7,
  },
  email: {
    margin: '2px 0 0 0',
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
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
    background: 'rgba(40, 167, 69, 0.15)',
    color: '#28a745',
  },
  badgeInactive: {
    background: 'rgba(255, 193, 7, 0.15)',
    color: '#ffc107',
  },
  badgeDeleted: {
    background: 'rgba(220, 53, 69, 0.15)',
    color: '#dc3545',
  },
  label: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '4px',
  },
  bioSection: {
    background: 'var(--color-bg)',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
  },
  bioText: {
    margin: 0,
    fontSize: '0.9rem',
    color: 'var(--color-text)',
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
    background: 'var(--color-primary)',
    color: 'var(--color-text)',
    fontSize: '0.75rem',
    padding: '3px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    border: '1px solid var(--color-border)',
  },
  noRoles: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--color-border)',
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
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: '0.85rem',
    color: 'var(--color-text)',
  },
}