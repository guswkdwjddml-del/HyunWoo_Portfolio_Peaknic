import axios from 'axios';

let kakaoMapPromise = null;

const CrewLoadKakaoMap = () => {
  if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
    return new Promise((resolve) => window.kakao.maps.load(resolve));
  }

  if (kakaoMapPromise) {
    return kakaoMapPromise;
  }

  kakaoMapPromise = new Promise(async (resolve, reject) => {
    try {
      // 1. 백엔드 MapController에서 카카오맵 API 키 가져오기
      const res = await axios.get(`/api/map/key`);
      const apiKey = res.data.kakaoMapKey;

      if (!apiKey) {
        throw new Error("백엔드에서 카카오맵 키를 받아오지 못했습니다.");
      }

      const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');

      if (existingScript) {
        existingScript.addEventListener('load', () => {
          window.kakao.maps.load(resolve);
        });
        existingScript.addEventListener('error', reject);
        return;
      }

      // 2. 받아온 키를 사용하여 동적으로 스크립트 주입
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer&autoload=false`;
      script.async = true;

      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(resolve);
        } else {
          reject(new Error("카카오맵 객체를 찾을 수 없습니다."));
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);

    } catch (error) {
      reject(error);
    }
  });

  return kakaoMapPromise;
};

export default CrewLoadKakaoMap;