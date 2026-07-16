import { useLocation } from 'preact-iso';
import { useState, useCallback, useEffect } from 'preact/hooks';

import GenreCategoryView from './GenreCategoryView'
import RoleView from './RoleView'
import UserList from './UserList';

export default function AdminDashboard() {
  return (
    <>
      {/* category/genre view */}
      <section>
        <GenreCategoryView />
      </section>

      {/* UserRole */}
      <section>
        <RoleView />
      </section>

      {/* UserList */}
      <section>
        <UserList />
      </section>
    </>
  )
}