import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#36ae9a', '#f87171'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '8px 16px',
        fontWeight: 600,
        color: '#36ae9a'
      }}>
        {name}: <span style={{ fontWeight: 700 }}>{value}</span>
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
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col items-center justify-center">
        <h3 className="font-bold text-lg text-center mb-4 text-[#36ae9a] tracking-wide uppercase drop-shadow">
          Tỷ lệ tiêm chủng học sinh
        </h3>
        <div className="text-gray-400 text-lg font-semibold py-12">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h3 className="font-bold text-lg text-center mb-4 text-[#36ae9a] tracking-wide uppercase drop-shadow">
        Tỷ lệ tiêm chủng học sinh
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ManagerDashboardPieChart; 