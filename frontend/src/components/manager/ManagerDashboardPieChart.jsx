import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

const COLORS = [
  'url(#vaccinatedGradient)',
  'url(#unvaccinatedGradient)'
];

const ManagerDashboardPieChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vaccinated, setVaccinated] = useState(0);
  const [total, setTotal] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/nurse/vaccination-campaigns', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success && Array.isArray(res.data.data)) {
          setCampaigns(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedCampaign(res.data.data[0].id);
          }
        } else {
          setCampaigns([]);
        }
      } catch {
        setCampaigns([]);
      }
    };
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (!selectedCampaign) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/nurse/vaccination-campaigns/${selectedCampaign}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success && res.data.data?.stats) {
          setVaccinated(res.data.data.stats.vaccinatedStudents || 0);
          setTotal(res.data.data.stats.totalStudents || 0);
        } else {
          setError('Không lấy được dữ liệu campaign');
          setVaccinated(0);
          setTotal(0);
        }
      } catch {
        setError('Lỗi khi lấy dữ liệu');
        setVaccinated(0);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCampaign]);

  const unvaccinated = Math.max(total - vaccinated, 0);
  const percent = total > 0 ? Math.round((vaccinated / total) * 100) : 0;
  const data = [
    { name: 'Đã tiêm chủng', value: vaccinated },
    { name: 'Chưa tiêm chủng', value: unvaccinated },
  ];

  // Custom legend
  const renderLegend = () => (
    <div className="flex justify-center gap-8 mt-6 text-base font-medium">
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 rounded-full" style={{ background: 'linear-gradient(90deg, #20bfa9 0%, #43e97b 100%)' }}></span>
        Đã tiêm chủng
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 rounded-full" style={{ background: 'linear-gradient(90deg, #ff6b6b 0%, #ffb199 100%)' }}></span>
        Chưa tiêm chủng
      </div>
    </div>
  );

  // Center label
  const renderCenterLabel = () => (
    <g>
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" fontSize="48" fontWeight="bold" fill="#20bfa9">
        {percent}%
      </text>
      <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="#888">
        Đã tiêm chủng
      </text>
    </g>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-lg p-10 mb-8 border border-[#e5e7eb]">
      <h3 className="font-bold text-2xl text-center mb-8 text-[#20bfa9] tracking-wide uppercase font-sans">
        TỶ LỆ TIÊM CHỦNG HỌC SINH
      </h3>
      <div className="mb-8 flex justify-center">
        <Listbox value={selectedCampaign} onChange={setSelectedCampaign}>
          <div className="relative w-80">
            <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-5 pr-12 text-left border border-[#20bfa9] shadow-lg focus:outline-none focus:ring-2 focus:ring-[#20bfa9] text-lg font-semibold transition hover:border-[#089981] hover:shadow-xl">
              <span className="block truncate">
                {campaigns.find(c => c.id === selectedCampaign)?.name || 'Chọn chiến dịch'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronUpDownIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              {campaigns.map((c) => (
                <Listbox.Option
                  key={c.id}
                  value={c.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-3 pl-12 pr-4 text-lg ${active ? 'bg-[#e6fcf7] text-[#20bfa9]' : 'text-gray-900'}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{c.name}</span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#20bfa9]">
                          <CheckIcon className="h-6 w-6" aria-hidden="true" />
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
        <div className="text-center text-gray-400 py-16 text-lg font-semibold">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-16 text-lg font-semibold">{error}</div>
      ) : total === 0 ? (
        <div className="text-gray-400 text-lg font-semibold py-16">Không có dữ liệu để hiển thị</div>
      ) : (
        <>
          <div className="relative flex justify-center items-center" style={{ minHeight: 370 }}>
            <ResponsiveContainer width={370} height={370}>
              <PieChart>
                <defs>
                  <linearGradient id="vaccinatedGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#20bfa9" />
                    <stop offset="100%" stopColor="#43e97b" />
                  </linearGradient>
                  <linearGradient id="unvaccinatedGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="100%" stopColor="#ffb199" />
                  </linearGradient>
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={110}
                  outerRadius={150}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={true}
                  labelLine={false}
                  stroke="#fff"
                  strokeWidth={3}
                  onMouseOver={(_, idx) => {
                    // Optionally: highlight on hover
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      style={{ filter: 'drop-shadow(0 4px 16px rgba(32,191,169,0.10))' }}
                    />
                  ))}
                </Pie>
                {renderCenterLabel()}
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload && payload.length ? (
                      <div className="rounded-xl bg-white/90 px-4 py-2 shadow text-base font-semibold border border-[#e5e7eb]">
                        <span style={{ color: payload[0].color }}>{payload[0].name}</span>: {payload[0].value}
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {renderLegend()}
          <div className="flex justify-center gap-8 mt-8 text-lg font-medium">
            <div className="bg-[#f6fcfa] rounded-xl px-6 py-3 shadow border border-[#e5e7eb]">
              Tổng số học sinh: <span className="font-bold text-[#1677ff]">{total}</span>
            </div>
            <div className="bg-[#e6fcf7] rounded-xl px-6 py-3 shadow border border-[#20bfa9]/30">
              Đã tiêm: <span className="font-bold text-[#20bfa9]">{vaccinated}</span>
            </div>
            <div className="bg-[#fff1f0] rounded-xl px-6 py-3 shadow border border-[#ff6b6b]/30">
              Chưa tiêm: <span className="font-bold text-[#ff6b6b]">{unvaccinated}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboardPieChart; 
