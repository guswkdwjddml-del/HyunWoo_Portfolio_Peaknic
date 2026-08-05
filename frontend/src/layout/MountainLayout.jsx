import React from 'react'

import Footer from '../components/common/Footer'
import Header from '../components/common/Header'
import { Outlet } from 'react-router-dom'

const MountainLayout = () => {
  return (
    <>
      <Header />

      <div className="mountain-con">
        <Outlet />
      </div>

      <Footer />
    </>
  )
}

export default MountainLayout