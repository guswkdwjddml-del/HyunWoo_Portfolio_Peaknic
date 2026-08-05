import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import "../../../css/payment/kakaoCancelFail.css";
import { paymentKakaoCancelFail } from '../../../store/slice/paymentSlice';
import { showApiError } from '../../../utils/commonModule';

// type: cancel / fail
const KakaoCancelFail = ({ type }) => { // yein 작성

  const { orderNumber } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // StrictMode로 인한 중복 호출 방지 -> useEffect()가 두 번씩 호출되기 때문
  // const calledRef = useRef(false);

  useEffect(() => {
    // StrictMode 켜져있을 때 사용
    // if (calledRef.current) return;
    // calledRef.current = true;

    const kakaoCancelFailFn = async () => {
      try {
        const message = await dispatch(paymentKakaoCancelFail({ orderNumber, type })).unwrap();
        alert(message);
      } catch (error) {
        showApiError(error);
      }
    }

    kakaoCancelFailFn();
  }, [orderNumber, type, dispatch])

  return (
    <div className="kakaoCancelFail">
      <div className={`kakaoCancelFail-con ${type}`}>
        <p>{type === 'cancel' ? '결제가 취소되었습니다.' : "결제에 실패했습니다."}</p>
        <button onClick={() => navigate(`/subscribe/plan`)}>구독 페이지로 돌아가기</button>
      </div>
    </div>
  )
}

export default KakaoCancelFail