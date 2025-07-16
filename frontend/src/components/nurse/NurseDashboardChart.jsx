import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { ExclamationCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons';

// CustomTooltip cho từng loại chart
const CustomTooltip = ({ active, payload, label, chartType }) => {
  if (active && payload && payload.length) {
    let labelText = '';
    let valueText = '';
    if (chartType === 'event') {
      labelText = `Tháng ${label}`;
      valueText = `${payload[0].value} sự cố`;
    } else if (chartType === 'medicine') {
      labelText = `Tháng ${label}`;
      valueText = `${payload[0].value} đơn thuốc đã duyệt`;
    }
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '12px 16px',
        fontWeight: 600,
        color: chartType === 'event' ? '#36ae9a' : '#fa8c16',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        fontSize: '14px'
      }}>
        {labelText}: <span style={{ fontWeight: 700, color: chartType === 'event' ? '#059669' : '#fa8c16' }}>{valueText}</span>
      </div>
    );
  }
  return null;
};

const EventIcon = <ExclamationCircleOutlined style={{ fontSize: 32, color: '#36ae9a', marginRight: 12 }} />;
const MedicineIcon = <MedicineBoxOutlined style={{ fontSize: 32, color: '#fa8c16', marginRight: 12 }} />;

const legendStyle = {
  paddingBottom: 0,
  fontWeight: 500,
  fontSize: 15,
  color: '#6b7280',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 8,
};

const NurseDashboardChart = ({ data = [], color = '#36ae9a', icon = EventIcon, chartType = 'event' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-[#e0f7fa] to-[#fff] rounded-2xl shadow-2xl p-10 mb-8 flex flex-col items-center justify-center border-2 border-[#36ae9a]/20">
        <h3 className="font-bold text-2xl text-center mb-6 flex items-center justify-center gap-2 text-[#36ae9a] tracking-wide uppercase">
          {icon} Biểu đồ sự cố y tế theo tháng
        </h3>
        <div className="text-gray-400 text-lg font-semibold py-16">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-[#e0f7fa] to-[#fff] rounded-2xl shadow-2xl p-10 mb-8 border-2 border-[#36ae9a]/20">
      <h3 className="font-bold text-2xl text-center mb-6 flex items-center justify-center gap-2 text-[#36ae9a] tracking-wide uppercase">
        {icon} Biểu đồ sự cố y tế theo tháng
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
              fill: color, 
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
              fill: '#888888', 
              fontWeight: 400, 
              fontSize: 13, 
            }} 
            allowDecimals={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip chartType={chartType} />} cursor={{ fill: '#e0f7fa', opacity: 0.2 }} />
          <Legend 
            verticalAlign="top"
            align="center"
            iconType="rect"
            wrapperStyle={legendStyle}
            formatter={(value) => <span style={{ color: color, fontWeight: 600, fontSize: 16 }}>{value}</span>}
          />
          <Bar 
            dataKey="suco" 
            name="Số sự cố" 
            fill={color} 
            radius={[8, 8, 0, 0]}
            stroke="#059669"
            strokeWidth={2}
            label={{ position: 'top', fill: color, fontWeight: 700, fontSize: 18 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ApprovedMedicinesChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-[#fff7e6] to-[#fff] rounded-2xl shadow-2xl p-10 mb-8 flex flex-col items-center justify-center border-2 border-[#fa8c16]/20">
        <h3 className="font-bold text-2xl text-center mb-6 flex items-center justify-center gap-2 text-[#fa8c16] tracking-wide uppercase">
          {MedicineIcon} Biểu đồ thuốc đã duyệt theo tháng
        </h3>
        <div className="text-gray-400 text-lg font-semibold py-16">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-[#fff7e6] to-[#fff] rounded-2xl shadow-2xl p-10 mb-8 border-2 border-[#fa8c16]/20">
      <h3 className="font-bold text-2xl text-center mb-6 flex items-center justify-center gap-2 text-[#fa8c16] tracking-wide uppercase">
        {MedicineIcon} Biểu đồ thuốc đã duyệt theo tháng
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
              fill: '#fa8c16', 
              fontWeight: 700, 
              fontSize: 16 
            }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            label={{ 
              value: 'Số đơn thuốc đã duyệt', 
              angle: -90, 
              position: 'insideLeft', 
              fill: '#888888', 
              fontWeight: 400, 
              fontSize: 13, 
            }} 
            allowDecimals={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip chartType="medicine" />} cursor={{ fill: '#fff7e6', opacity: 0.2 }} />
          <Legend 
            verticalAlign="top"
            align="center"
            iconType="rect"
            wrapperStyle={{ ...legendStyle, color: '#fa8c16' }}
            formatter={(value) => <span style={{ color: '#fa8c16', fontWeight: 600, fontSize: 16 }}>{value}</span>}
          />
          <Bar 
            dataKey="approved" 
            name="Số đơn thuốc đã duyệt" 
            fill="#fa8c16" 
            radius={[8, 8, 0, 0]}
            stroke="#fa8c16"
            strokeWidth={2}
            label={{ position: 'top', fill: '#fa8c16', fontWeight: 700, fontSize: 18 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NurseDashboardChart; 