import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '8px 16px',
        fontWeight: 600,
        color: '#36ae9a'
      }}>
        Tháng {label}: <span style={{ fontWeight: 700 }}>{payload[0].value}</span> sự cố
      </div>
    );
  }
  return null;
};

const NurseDashboardChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col items-center justify-center">
        <h3 className="font-bold text-lg text-center mb-4 text-[#36ae9a] tracking-wide uppercase drop-shadow">
          Biểu đồ sự cố y tế theo tháng
        </h3>
        <div className="text-gray-400 text-lg font-semibold py-12">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h3 className="font-bold text-lg text-center mb-4 text-[#36ae9a] tracking-wide uppercase drop-shadow">
        Biểu đồ sự cố y tế theo tháng
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="thang" label={{ value: 'Tháng trong năm', position: 'bottom', offset: 10, fill: '#36ae9a', fontWeight: 700, fontSize: 16 }} />
          <YAxis label={{ value: 'Số sự cố y tế', angle: -90, position: 'insideLeft', fill: '#36ae9a', fontWeight: 700, fontSize: 16 }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" />
          <Bar dataKey="suco" name="Số sự cố" fill="#36ae9a" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NurseDashboardChart; 