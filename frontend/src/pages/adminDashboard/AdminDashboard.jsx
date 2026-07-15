import { useLocation } from 'preact-iso';
import { useState, useCallback, useEffect } from 'preact/hooks';

import GenreCategoryView from './GenreCategoryView'
import RoleView from './RoleView'

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
    </>
  )
}