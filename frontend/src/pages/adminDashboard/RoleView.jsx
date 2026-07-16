import { useLocation } from 'preact-iso';
import { useState, useCallback, useEffect } from 'preact/hooks';

import { roleService } from '../../services/RoleService';
import { adminService } from '../../services/AdminService';
import { useToast } from '../../context/ToastContext';

export default function RoleView() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [newRole, setNewRole] = useState({ title: '' });
  const [pendingDelete, setPendingDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const { showToast } = useToast();

  const loadUsers = async () => {
    try {
      const fetchedUsers = await adminService.getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      showToast(err.message || 'Failed to fetch users.', 'error');
    }
  }

  const loadRoles = async () => {
    try {
      const fetchedRoles = await roleService.getRoles();
      setRoles(fetchedRoles);
    } catch (err) {
      showToast(err.message || 'Failed to fetch roles.', 'error');
    }
  }

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [])

  const handleRoleClick = async (userId, roleId) => {
    const key = `${userId}-${roleId}`;

    if (pendingDelete === key) {
      if (window.confirm("Are you sure you want to remove this role from the user?")) {
        try {
          const res = await roleService.removeRoleFromUser(userId, roleId);
          showToast(res.message || 'Role removed successfully', 'success');
          setPendingDelete(null);
          await loadUsers();
        } catch (err) {
          showToast(err.message || 'Failed to remove role', 'error');
        }
      } else {
        setPendingDelete(null);
      }
    } else {
      setPendingDelete(key);

      setTimeout(() => {
        setPendingDelete(prev => prev === key ? null : prev);
      }, 3000);
    }
  };

  const handleDeleteRole = async (roleId) => {
    const key = `system-${roleId}`;

    if (pendingDelete === key) {
      if (window.confirm("Are you sure you want to completely delete this role?")) {
        try {
          await roleService.deleteRole(roleId);
          showToast('Role deleted from system', 'success');
          setPendingDelete(null);
          await loadRoles();
          await loadUsers();
        } catch (err) {
          showToast(err.message || 'Failed to delete role', 'error');
        }
      } else {
        setPendingDelete(null);
      }
    } else {
      setPendingDelete(key);
      setTimeout(() => {
        setPendingDelete(prev => prev === key ? null : prev);
      }, 3000);
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedRoleId) {
      showToast('Please select both a user and a role', 'error');
      return;
    }

    try {
      const res = await roleService.assignRoleToUser(Number(selectedUserId), Number(selectedRoleId));
      showToast(res.message || 'Role assigned successfully', 'success');
      setSelectedUserId('');
      setSelectedRoleId('');
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'Error assigning role', 'error');
    }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!newRole.title) return;

    try {
      await roleService.createRole(newRole.title);
      setNewRole({ title: '' });
      await loadRoles();
    } catch (err) {
      alert(err.message || 'Error creating role');
    }
  };

  const filteredUsers = users
    .filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  return (
    <>
      <h3>Users with role</h3>
      {users.map(user => {
        if (user.roles.length === 0) return null;

        return (
          <li key={user.id} style={styles.listItem}>
            <span style={styles.username}>{user.username}</span>
            <div style={styles.badgeContainer}>
              {user.roles.map(r => {
                const isPending = pendingDelete === `${user.id}-${r.id}`;
                return (
                  <span
                    key={r.id}
                    onClick={() => handleRoleClick(user.id, r.id)}
                    style={{
                      ...styles.roleBadge,
                      ...(isPending ? styles.roleBadgeDelete : {})
                    }}
                    title={isPending ? "Click again to confirm delete" : "Click to remove role"}
                  >
                    {r.title}
                  </span>
                );
              })}
            </div>
          </li>
        );
      })}

      <h3>Roles <span style={{ fontWeight: 200, fontSize: '13px', color: 'var(--color-text)', fontStyle: 'italic' }}>(Click twice to delete completely)</span></h3 >
      <div style={styles.badgeContainer}>
        {roles.map(role => {
          const isPending = pendingDelete === `system-${role.id}`;
          return (
            <span
              key={role.id}
              onClick={() => handleDeleteRole(role.id)}
              style={{
                ...styles.roleBadge,
                ...(isPending ? styles.roleBadgeDelete : {})
              }}
              title={isPending ? "Click again to confirm delete" : "Click to delete role"}
            >
              {role.title}
            </span>
          );
        })}
      </div>

      <h3>Assign role to user</h3>
      <form onSubmit={handleAssignRole}>
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
              setSelectedUserId(foundUser.id);
            } else {
              setSelectedUserId("");
            }
          }}
        />
        <datalist id="users-list">
          {filteredUsers.map(user => (
            <option key={user.id} value={user.username} />
          ))}
        </datalist>

        <select
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
        >
          <option value="">-- Select Role --</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>
              {role.title}
            </option>
          ))}
        </select>
        <button type="submit" style={styles.saveBtn}>Assign role to user</button>
      </form>


      <h3>Add new role</h3>
      <form onSubmit={handleSaveRole}>
        <label>Role Title</label>
        <input
          type="text"
          placeholder="Role Title"
          value={newRole.title}
          onInput={(e) => setNewRole({ ...newRole, title: e.target.value })}
        />
        <button type="submit" style={styles.saveBtn}>Create Role</button>
      </form>
    </>
  )
}

const styles = {
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    margin: '6px 0',
    borderRadius: '8px',
    border: '1px solid #333',
    listStyle: 'none',
  },
  username: {
    fontWeight: 'bold',
    color: 'var(--color-text-muted)',
  },
  badgeContainer: {
    display: 'flex',
    gap: '6px'
  },
  noRole: {
    fontSize: '11px',
    color: 'var(--color-text)',
    fontStyle: 'italic',
  },
  roleBadgeDelete: {
    backgroundColor: 'var(--color-error)',
    animation: 'pulse 1s infinite',
  },
  roleBadge: {
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    padding: '3px 8px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
}