import { useLocation } from 'preact-iso';
import { useState, useCallback, useEffect } from 'preact/hooks';

import { adminService } from '../../services/AdminService';
import { useToast } from '../../context/ToastContext';

import GenreCategoryView from './GenreCategoryView'
import RoleView from './RoleView'
import UserView from './UserView';

export default function AdminDashboard() {
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
    <>
      {/* category/genre view */}
      <section>
        <GenreCategoryView />
      </section>

      {/* UserRole */}
      <section>
        <RoleView
          users={users}
          onUsersChanged={loadUsers}
        />
      </section>

      {/* UserList */}
      <section>
        <UserView
          users={users}
        />
      </section>
    </>
  )
}


{/*
  logic
  Page - pobiera główną informacje i wyłowyje widoki

  cosView - przyjmuje info z page i odwzorowuje ich na to jak ma wyswietlić
  
  */}