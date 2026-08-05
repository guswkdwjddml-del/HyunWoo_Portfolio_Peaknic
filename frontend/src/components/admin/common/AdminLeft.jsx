import React from 'react'
import { NavLink } from 'react-router-dom'



const AdminLeft = ({ menuOpen, setMenuOpen }) => {

  const boardMenus = [
    { name: "공지사항", category: "notice" },
    { name: "FAQ", category: "faq" },
    { name: "자유게시판", category: "free" },
    { name: "크루리뷰", category: "review" },
  ];

  const closeMenu = () => {
    if (setMenuOpen) {
      setMenuOpen(false);
    }
  };

  return (
    <div className={`adminLeft ${menuOpen ? "open" : ""}`}>
      <div className="adminLeft-con">
        <h1>
          <NavLink to={`/admin`} onClick={closeMenu}>DASHBOARD</NavLink>
        </h1>
        <ul>
          <li>
            <NavLink to={`/admin/member`} onClick={closeMenu}>
              회원관리
            </NavLink>
          </li>
          <li>
            <NavLink to={`/admin/mountain`} onClick={closeMenu}>
              산정보관리
            </NavLink>
          </li>
          <li>
            <NavLink to={`/admin/crew`} onClick={closeMenu}>
              크루관리
            </NavLink>
          </li>
          <li>
            <span>게시판 관리</span>
            <ul className='submenu'>
              {boardMenus.map((menu) => (
                <li key={menu.category}>
                  <NavLink to={`/admin/board/${menu.category}`} onClick={closeMenu}>
                    {menu.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <NavLink to={`/admin/payment`} onClick={closeMenu}>
              결제관리
            </NavLink>
          </li>
          <li>
            <NavLink to={`/admin/notification`}>
              알림관리
            </NavLink>
          </li>
          <li className='adminLeft-bottom'>
            <h1 className="logo">
              <NavLink to={`/`}>
                <img src="/images/logo/logo.png" alt="Peak-nic Logo" className="hero_logo" />
              </NavLink>
            </h1>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default AdminLeft