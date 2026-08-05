import React from 'react'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import { Link } from 'react-router-dom';
import "../css/style.css"; 
import "../css/mainPage.css"; 
import MountainVideoBg from '../components/mountain/MountainVideoBg';

const MainPage = () => {
  return (
    <div className="wrapper mainpage_wrapper">
      {/* 12초 주기의 교차 페이드 영상 배경 컴포넌트 */}
      <MountainVideoBg />
      
      <Header />
      
      <div className="hero_section">
        <img src="/images/main/item_1.png" alt="Hiking Boot" className="hero_item item_boot" />
        <img src="/images/main/item_2.png" alt="Picnic Basket" className="hero_item item_basket" />
        <img src="/images/logo/logo.png" alt="Peak-nic Logo" className="hero_logo" />
      </div>

      <div className="content_section">
        <div className="inner2">
          
          {/* 가독성을 대폭 끌어올려주는 글래스모피즘 카드 영역 */}
          <div className="glass_card">
            <p className="decor_text">등산과 소풍의 경계에서, 정상에서의 달콤한 휴식</p>
            <br /><h1>Peak-nic에 오신 것을 환영합니다!</h1>
            
            <p className="description">
              산을 사랑하는 사람들과 함께 정상을 오르고, <br/>
              그곳에서 펼쳐지는 작은 소풍을 즐기는 공간입니다. <br/>
              등산화 끈을 동여매고, 맛있는 도시락을 준비하세요. <br/>
              함께할 크루들이 당신을 기다립니다.
            </p>

            <div className="cta_buttons">
              <Link to="/mountain/list" className="btn_main btn_explore">산으로 떠나기</Link>
              <Link to="/crew" className="btn_main btn_crew">함께할 크루 찾기</Link>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}

export default MainPage