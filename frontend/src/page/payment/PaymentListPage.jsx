import { useSearchParams } from 'react-router-dom';
import PaymentCrewList from '../../components/payment/paymentList/PaymentCrewList';
import PaymentSubscribeList from '../../components/payment/paymentList/PaymentSubscribeList';
import "../../css/payment/paymentListPage.css";

const TABS = [
  { key: "CREW", label: "크루 결제" },
  { key: "SUBSCRIBE", label: "플랜 결제" },
];

const PaymentListPage = () => { // yein 작성

  // param값 가져오기 (CREW / SUBSCRIBE)
  const [searchParams, setSearchParams] = useSearchParams();

  // 기본값 CREW
  const activeTab = searchParams.get("tab") || "CREW";

  return (
    <div className="paymentList">
      <div className="paymentList-con">

        <h2>결제 내역</h2>

        <div className="payment-tabs">
          {TABS.map(tab => (
            <button key={tab.key}
              className={`payment-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setSearchParams({ tab: tab.key })}
            >{tab.label}</button>
          ))}
        </div>

        {activeTab === "CREW" ? <PaymentCrewList /> : <PaymentSubscribeList />}
      </div>
    </div>
  )
}

export default PaymentListPage