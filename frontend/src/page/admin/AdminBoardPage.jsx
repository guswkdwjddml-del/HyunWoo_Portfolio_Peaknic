import React from 'react'
import AdminBoardList from '../../components/admin/board/AdminBoardList'
import { Outlet } from 'react-router-dom'

const AdminBoardPage = () => {
  return (
    <>
      <Outlet />
    </>
  )
}

export default AdminBoardPage
