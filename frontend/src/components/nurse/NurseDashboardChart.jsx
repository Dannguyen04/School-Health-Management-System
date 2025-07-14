import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
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
        Tháng {label}: <span style={{ fontWeight: 700, color: '#059669' }}>{payload[0].value}</span> sự cố
      </div>
    );
  }
  return null;
};

const NurseDashboardChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col items-center justify-center">
        <h3 className="font-bold text-xl text-center mb-6 text-[#36ae9a] tracking-wide uppercase">
          Biểu đồ sự cố y tế theo tháng
        </h3>
        <div className="text-gray-400 text-lg font-semibold py-16">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h3 className="font-bold text-xl text-center mb-6 text-[#36ae9a] tracking-wide uppercase">
        Biểu đồ sự cố y tế theo tháng
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="thang" 
            label={{ 
              value: 'Tháng trong năm', 
              position: 'bottom', 
              offset: 15, 
              fill: '#36ae9a', 
              fontWeight: 700, 
              fontSize: 16 
            }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            label={{ 
              value: 'Số sự cố y tế', 
              angle: -90, 
              position: 'insideLeft', 
              fill: '#36ae9a', 
              fontWeight: 700, 
              fontSize: 16 
            }} 
            allowDecimals={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
          <Bar 
            dataKey="suco" 
            name="Số sự cố" 
            fill="#36ae9a" 
            radius={[8, 8, 0, 0]}
            stroke="#059669"
            strokeWidth={2}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NurseDashboardChart; 