// ... existing code ...
import NurseDashboardChart, { ApprovedMedicinesChart } from "./NurseDashboardChart";
// ... existing code ...
// Thêm state cho thuốc đã duyệt
const [approvedMedicines, setApprovedMedicines] = useState([]);
// ... existing code ...
const fetchApprovedMedicines = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/api/nurse/approved-medications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.success) {
      setApprovedMedicines(response.data.data || []);
    } else {
      setApprovedMedicines([]);
    }
  } catch {
    setApprovedMedicines([]);
  }
};
// ... existing code ...
useEffect(() => {
  fetchDashboardData();
  fetchApprovedMedicines();
}, []);
// ... existing code ...
// Tổng hợp số thuốc đã duyệt theo tháng cho chart
const approvedMedicinesByMonth = Array.from({ length: 12 }, (_, i) => {
  const month = (i + 1).toString();
  const count = (approvedMedicines || []).filter((med) => {
    if (med.status !== "APPROVED" || !med.updatedAt) return false;
    const date = new Date(med.updatedAt);
    return date.getMonth() + 1 === i + 1;
  }).length;
  return { thang: month, approved: count };
});
// ... existing code ...
{/* Biểu đồ sự cố y tế và thuốc đã duyệt */}
<Row gutter={[24, 24]} className="mb-8">
  <Col xs={24} md={12}>
    <Card className="shadow-lg rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xl font-bold flex items-center gap-2">
          <ExclamationCircleOutlined className="text-red-500" /> Biểu đồ sự cố y tế
        </span>
      </div>
      <NurseDashboardChart data={eventsByMonth} color="#36ae9a" icon={<ExclamationCircleOutlined className="text-red-500" />} chartType="event" />
    </Card>
  </Col>
  <Col xs={24} md={12}>
    <Card className="shadow-lg rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xl font-bold flex items-center gap-2">
          <MedicineBoxOutlined className="text-[#fa8c16]" /> Biểu đồ thuốc đã duyệt
        </span>
      </div>
      <ApprovedMedicinesChart data={approvedMedicinesByMonth} />
    </Card>
  </Col>
</Row>
// ... existing code ...