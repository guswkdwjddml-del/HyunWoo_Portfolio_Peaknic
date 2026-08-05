import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const statusMap = {
  RECRUITING: "모집중",
  CLOSED: "마감",
  COMPLETED: "완료",
  CANCELLED: "취소"
};

const COLORS = ['#63C29A', '#94A3B8', '#cbd5e1', '#f87171'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #E8EFEA",
          padding: "10px 14px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: "bold",
            color: "#334155",
            marginBottom: "6px"
          }}
        >
          {data.name}
        </p>

        <p
          style={{
            margin: 0,
            color: payload[0].color,
            fontSize: "13px"
          }}
        >
          크루 수 : <strong>{data.value}개</strong>
        </p>
      </div>
    );
  }

  return null;
};

const CrewPieChart = ({ data }) => {

  const chartData = (data ?? [])
    .filter(item => item.status !== "DELETED")
    .map(item => ({
      name: statusMap[item.status] || item.status,
      value: item.count
    }));

  return (
    <div className="chartBox">
      <h3>크루현황</h3>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              legendType='square'
              cx="50%"
              cy="46%"
              outerRadius="52%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              animationDuration={700}
            >
              {
                chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))
              }
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CrewPieChart;