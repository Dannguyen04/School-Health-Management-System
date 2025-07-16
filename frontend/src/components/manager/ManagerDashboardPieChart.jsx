import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

const COLORS = ['#20bfa9', '#ff6b6b']; // Teal and red

const ManagerDashboardPieChart = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vaccinated, setVaccinated] = useState(0);
  const [total, setTotal] = useState(0);

  // Fetch danh sách campaign khi mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const res = await api.get('/manager/vaccination-campaigns');
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
      setError(null);
      try {
        // Ưu tiên gọi API manager
        const res = await api.get(`/manager/vaccination-campaigns/${selectedCampaign}`);
        if (res.data && res.data.data) {
          const campaign = res.data.data;
          if (typeof campaign.vaccinatedStudents === 'number' && typeof campaign.totalStudents === 'number') {
            setTotal(campaign.totalStudents);
            setVaccinated(campaign.vaccinatedStudents);
            setError(null);
            setLoading(false);
            return;
          }
        }
        // Nếu không có số liệu, fallback sang API nurse
        throw new Error('No campaign stats');
      } catch (err) {
        // Fallback sang API nurse
        try {
          const res2 = await api.get(`/nurse/vaccination-campaigns/${selectedCampaign}/students`);
          if (res2.data && res2.data.data) {
            const students = res2.data.data;
            setTotal(students.length);
            setVaccinated(students.filter(s => s.vaccinationStatus === 'COMPLETED').length);
            setError(null);
          }
        } catch (err2) {
          setError('Lỗi khi lấy dữ liệu chiến dịch');
          setTotal(0);
          setVaccinated(0);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCampaignDetail();
  }, [selectedCampaign]);

  const unvaccinated = Math.max(total - vaccinated, 0);
  const data = [
    { name: 'Đã tiêm chủng', value: vaccinated },
    { name: 'Chưa tiêm chủng', value: unvaccinated },
  ];

  // Custom label to show name and percent outside the slice
  const renderLabel = ({ name, percent, cx, cy, midAngle, outerRadius, fill, index }) => {
    if (percent === 0) return null;
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
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow p-10 mb-8 border border-[#e5e7eb]">
      <h3 className="font-bold text-xl text-center mb-8 text-[#20bfa9] tracking-wide uppercase">
        TỶ LỆ TIÊM CHỦNG HỌC SINH
      </h3>
      <div className="mb-6 flex justify-center">
        <Listbox value={selectedCampaign} onChange={setSelectedCampaign}>
          <div className="relative w-72">
            <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-2 pl-4 pr-10 text-left border border-[#20bfa9] shadow-lg focus:outline-none focus:ring-2 focus:ring-[#20bfa9] text-lg font-semibold transition hover:border-[#089981] hover:shadow-xl">
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
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-[#e6fcf7] text-[#20bfa9]' : 'text-gray-900'}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{c.name}</span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#20bfa9]">
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

export default ManagerDashboardPieChart; 