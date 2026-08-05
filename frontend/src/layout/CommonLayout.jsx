import React from 'react'
import { Outlet } from 'react-router-dom'
import "../css/style.css";

import Footer from '../components/common/Footer'
import Header from '../components/common/Header'

const CommonLayout = () => {
  return (
    <>
      <Header />
      <div className="inner">
        <Outlet />
      </div>
      <Footer />
    </>
  )
}

export default CommonLayout;
