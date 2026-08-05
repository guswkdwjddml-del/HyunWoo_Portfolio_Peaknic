import React from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line
} from 'recharts';

const makeChartData = (data) => {
  const today = new Date();

  const lastDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (4 - i));

    const key = date.toISOString().substring(5, 10);

    const found = data.find(item => item.date === key);

    return {
      date: key,
      amount: found ? found.amount : 0,
      count: found ? found.count : 0
    };
  });

  return lastDays;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #E8EFEA',
        padding: '10px 14px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <p style={{
          margin: 0,
          fontWeight: 'bold',
          color: '#334155',
          marginBottom: '4px'
        }}>
          {label}
        </p>

        <p style={{
          margin: 0,
          color: '#63C29A',
          fontSize: '13px'
        }}>
          결제금액: <strong>{((data?.amount || 0) / 1000).toLocaleString()}천원</strong>
        </p>

        <p style={{
          margin: 0,
          color: '#64748B',
          fontSize: '13px',
          marginTop: '2px'
        }}>
          결제건수: <strong>{data.count}건</strong>
        </p>

      </div>
    );
  }

  return null;
};


const PaymentChart = ({ data }) => {

  const chartData = makeChartData(Array.isArray(data) ? data : []);
  const maxAmount = Math.max(...chartData.map(d => d.amount), 0);

  return (
    <div className="chartBox">
      <h3>최근 결제 추이</h3>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />

            {/* Y축 (결제금액 전용 및 단위 포맷팅) */}
            <YAxis
              width={35}
              tickMargin={8}
              tick={{ fontSize: 12 }}
              domain={[0, Math.ceil((maxAmount * 1.2) / 10000) * 10000]}
              stroke="#63C29A"
              tickFormatter={(value) => `${(value / 1000).toLocaleString()}`}
            />

            <Tooltip
              content={<CustomTooltip />}
              isAnimationActive={false}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: '8px',
                fontSize: '14px',
                color: '#334155'
              }}
              content={({ payload }) => (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px'
                }}>
                  {payload?.map((entry, index) => (
                    <span
                      key={`legend-${index}`}
                      style={{
                        color: entry.color,
                        fontSize: '14px'
                      }}
                    >
                      {entry.value}
                    </span>
                  ))}
                </div>
              )}
            />
            <Bar
              dataKey="amount"
              name="결제금액(단위: 천원)"
              fill="#63C29A"
              maxBarSize={25}
              radius={[6, 6, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PaymentChart