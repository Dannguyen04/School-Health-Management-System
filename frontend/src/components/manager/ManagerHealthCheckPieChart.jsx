import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

const COLORS = [
  'url(#checkedGradient)',
  'url(#notCheckedGradient)'
];

const ManagerHealthCheckPieChart = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checked, setChecked] = useState(0);
  const [notChecked, setNotChecked] = useState(0);
  const [total, setTotal] = useState(0);

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

  useEffect(() => {
    if (!selectedCampaign) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsRes, checksRes] = await Promise.all([
          api.get(`/medical-campaigns/${selectedCampaign}/students`),
          api.get(`/medical-checks/campaign/${selectedCampaign}`)
        ]);
        const allStudents = studentsRes.data.data;
        const checks = checksRes.data.data;
        const checkedStudentIds = new Set(checks.filter(c => c.status === 'COMPLETED').map(c => c.studentId));
        const soDaKham = checkedStudentIds.size;
        const soChuaKham = allStudents.length - soDaKham;
        setTotal(allStudents.length);
        setChecked(soDaKham);
        setNotChecked(soChuaKham);
      } catch (err) {
        setError('Lỗi khi lấy dữ liệu');
        setTotal(0);
        setChecked(0);
        setNotChecked(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCampaign]);

  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
  const data = [
    { name: 'Đã khám', value: checked },
    { name: 'Chưa khám', value: notChecked },
  ];

  // Custom legend
  const renderLegend = () => (
    <div className="flex justify-center gap-8 mt-6 text-base font-medium">
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 rounded-full" style={{ background: 'linear-gradient(90deg, #34d399 0%, #43e97b 100%)' }}></span>
        Đã khám
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 rounded-full" style={{ background: 'linear-gradient(90deg, #fb7185 0%, #ffb199 100%)' }}></span>
        Chưa khám
      </div>
    </div>
  );

  // Center label
  const renderCenterLabel = () => (
    <g>
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" fontSize="48" fontWeight="bold" fill="#34d399">
        {percent}%
      </text>
      <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="#888">
        Đã khám
      </text>
    </g>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-lg p-10 mb-8 border border-[#e5e7eb]">
      <h3 className="font-bold text-2xl text-center mb-8 text-[#34d399] tracking-wide uppercase font-sans">
        SỐ HỌC SINH THAM GIA KHÁM SỨC KHỎE
      </h3>
      <div className="mb-8 flex justify-center">
        <Listbox value={selectedCampaign} onChange={setSelectedCampaign}>
          <div className="relative w-80">
            <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-5 pr-12 text-left border border-[#34d399] shadow-lg focus:outline-none focus:ring-2 focus:ring-[#34d399] text-lg font-semibold transition hover:border-[#059669] hover:shadow-xl">
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
                    `relative cursor-pointer select-none py-3 pl-12 pr-4 text-lg ${active ? 'bg-[#f0fdf4] text-[#34d399]' : 'text-gray-900'}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{c.name}</span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#34d399]">
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
                  <linearGradient id="checkedGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#43e97b" />
                  </linearGradient>
                  <linearGradient id="notCheckedGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fb7185" />
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
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      style={{ filter: 'drop-shadow(0 4px 16px rgba(52,211,153,0.10))' }}
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
            <div className="bg-[#f0fdf4] rounded-xl px-6 py-3 shadow border border-[#34d399]/30">
              Đã khám: <span className="font-bold text-[#34d399]">{checked}</span>
            </div>
            <div className="bg-[#fff1f0] rounded-xl px-6 py-3 shadow border border-[#fb7185]/30">
              Chưa khám: <span className="font-bold text-[#fb7185]">{notChecked}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerHealthCheckPieChart; 