import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

const COLORS = ['#a78bfa', '#ff6b6b']; // Purple and red

const ManagerHealthCheckPieChart = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participated, setParticipated] = useState(0);
  const [declined, setDeclined] = useState(0);
  const [total, setTotal] = useState(0);

  // Fetch danh sách campaign khi mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const res = await api.get('/medical-campaigns');
        if (res.data && res.data.data) {
          setCampaigns(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedCampaign(res.data.data[0].id);
          }
        }
      } catch (err) {
        setError('Lỗi khi lấy danh sách chiến dịch');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Fetch dữ liệu chi tiết khi chọn campaign
  useEffect(() => {
    if (!selectedCampaign) return;
    const fetchCampaignDetail = async () => {
      setLoading(true);
      try {
        // Lấy danh sách medical checks theo campaign
        const res = await api.get(`/medical-checks/campaign/${selectedCampaign}`);
        if (res.data && res.data.data) {
          const checks = res.data.data;
          setTotal(checks.length);
          setParticipated(checks.filter(c => c.status === 'COMPLETED').length);
          setDeclined(checks.filter(c => c.status === 'DECLINED').length);
        }
      } catch (err) {
        setError('Lỗi khi lấy dữ liệu chiến dịch');
        setTotal(0);
        setParticipated(0);
        setDeclined(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaignDetail();
  }, [selectedCampaign]);

  const data = [
    { name: 'Tham gia', value: participated },
    { name: 'Từ chối', value: declined },
  ];

  // Custom label to show name and value outside the slice
  const renderLabel = ({ name, value, cx, cy, midAngle, outerRadius, fill, index }) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 24;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill={COLORS[index]}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontWeight={600}
        fontSize={16}
      >
        {`${name}: ${value}`}
      </text>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow p-10 mb-8 border border-[#e5e7eb]">
      <h3 className="font-bold text-xl text-center mb-8 text-[#a78bfa] tracking-wide uppercase">
        TỶ LỆ THAM GIA KHÁM SỨC KHỎE
      </h3>
      <div className="mb-6 flex justify-center">
        <Listbox value={selectedCampaign} onChange={setSelectedCampaign}>
          <div className="relative w-72">
            <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-2 pl-4 pr-10 text-left border border-[#a78bfa] shadow-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa] text-lg font-semibold transition hover:border-[#7c3aed] hover:shadow-xl">
              <span className="block truncate">
                {campaigns.find(c => c.id === selectedCampaign)?.name || 'Chọn chiến dịch'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              {campaigns.map((c) => (
                <Listbox.Option
                  key={c.id}
                  value={c.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-[#ede9fe] text-[#a78bfa]' : 'text-gray-900'}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{c.name}</span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#a78bfa]">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
      {loading ? (
        <div className="text-center text-gray-400 py-16">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-16">{error}</div>
      ) : total === 0 ? (
        <div className="text-gray-400 text-lg font-semibold py-16">Không có dữ liệu để hiển thị</div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
              nameKey="name"
              label={renderLabel}
              labelLine={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend iconType="circle" formatter={(value, entry, index) => (
              <span style={{ color: COLORS[index], fontWeight: 600 }}>{value}</span>
            )} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ManagerHealthCheckPieChart; 