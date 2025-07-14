import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#36ae9a', '#f87171'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '12px 16px',
        fontWeight: 600,
        color: '#36ae9a',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        fontSize: '14px'
      }}>
        {name}: <span style={{ fontWeight: 700, color: '#059669' }}>{value}</span>
      </div>
    );
  }
  return null;
};

const ManagerDashboardPieChart = ({ vaccinated = 0, total = 0 }) => {
  const unvaccinated = Math.max(total - vaccinated, 0);
  const data = [
    { name: 'Đã tiêm chủng', value: vaccinated },
    { name: 'Chưa tiêm chủng', value: unvaccinated },
  ];

  if (vaccinated === 0 && unvaccinated === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col items-center justify-center">
        <h3 className="font-bold text-xl text-center mb-6 text-[#36ae9a] tracking-wide uppercase">
          Tỷ lệ tiêm chủng học sinh
        </h3>
        <div className="text-gray-400 text-lg font-semibold py-16">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h3 className="font-bold text-xl text-center mb-6 text-[#36ae9a] tracking-wide uppercase">
        Tỷ lệ tiêm chủng học sinh
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="#ffffff"
                strokeWidth={3}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ManagerDashboardPieChart; 