import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from "./store/store.jsx";
import axios from 'axios'; // 💡 [추가] Axios 임포트
import './js/refresh.js';


// 💡 [추가] 새로고침(F5) 대응 인증 헤더 복원 로직
// 브라우저 메모리가 초기화되어도 로컬 스토리지의 토큰을 꺼내 Axios 헤더에 주입합니다.
// const accessToken = localStorage.getItem('accessToken');
// if (accessToken) {
//   axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
// }

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={store}>
    <App />
  </Provider>    
  // </StrictMode>,
)