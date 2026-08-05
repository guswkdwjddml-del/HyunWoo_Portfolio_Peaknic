import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import "../../../css/payment/kakaoApproval.css";
import { removeCartItem } from '../../../store/slice/cartSlice';
import { paymentKakaoApprove } from '../../../store/slice/paymentSlice';
import { showApiError } from '../../../utils/commonModule';

const KakaoApproval = () => { // yein 작성

  // 파라미터로 전달된 orderNumber / pgToken 가져오기
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const pgToken = searchParams.get('pg_token');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 승인 상태 관리 -> pending / success / error
  const [status, setStatus] = useState('pending');

  // StrictMode로 인한 중복 호출 방지 -> useEffect()가 두 번씩 호출되기 때문
  // const calledRef = useRef(false);

  // 카카오페이 결제 승인 요청
  useEffect(() => {
    // StrictMode 켜져있을 때 사용
    // if (calledRef.current) return;
    // calledRef.current = true;

    // pgToken이 없으면 에러 처리
    if (!pgToken) {
      setStatus('error');
      return;
    }

    const kakaoApproveFn = async () => {
      try {
        const cartItemIds = await dispatch(paymentKakaoApprove({ orderNumber, pgToken })).unwrap();
        dispatch(removeCartItem(cartItemIds)); // 결제 승인 후 장바구니 아이템 삭제
        setStatus('success');
      } catch (error) {
        setStatus('error');
        showApiError(error);
      }
    }

    kakaoApproveFn();
  }, [orderNumber, pgToken, dispatch])

  // 승인 상태가 success(성공)이라면 결제 내역 페이지로 이동
  useEffect(() => {
    if (status === 'success') {
      navigate(`/payment/list`, { replace: true });
    }
  }, [status, navigate])

  if (status === 'pending') {
    return (
      <div className="approval-pending">
        <p>결제 승인 처리 중입니다...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="approval-error">
        <p>결제 승인에 실패했습니다.</p>
        <button onClick={() => navigate(`/`)}>고객센터 문의하기</button>
      </div>
    )
  }

  return null;
}

export default KakaoApproval