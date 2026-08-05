import React, { useState } from 'react'
import AdminHeader from '../components/admin/common/AdminHeader'
import AdminLeft from '../components/admin/common/AdminLeft'
import { Outlet } from 'react-router-dom'
import '../css/style.css'

const AdminLayout = () => {

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="adminLayout">
      <AdminHeader
        setMenuOpen={setMenuOpen}
      />
      <AdminLeft
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      <div className="adminContent">
        <Outlet />
      </div>

      {/* 모바일 오버레이 */}
      {
        menuOpen &&
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      }

    </div>
  )
}

export default AdminLayout
