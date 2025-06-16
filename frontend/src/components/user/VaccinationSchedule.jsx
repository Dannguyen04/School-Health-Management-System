import { CalendarOutlined, HistoryOutlined } from "@ant-design/icons";
import { Card, Spin, Table, Tabs } from "antd";
import { useEffect, useState } from "react";

const { TabPane } = Tabs;

const dummyData = [
  {
    key: "1",
    date: "2025-06-15",
    type: "Vaccination",
    description: "COVID-19 Booster",
    status: "Scheduled",
  },
  {
    key: "2",
    date: "2025-05-01",
    type: "Checkup",
    description: "Annual Health Checkup",
    status: "Completed",
  },
];

const columns = [
  {
    title: "Ngày",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Loại",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (text) => (
      <span
        className={`px-2 py-1 rounded text-white ${
          text === "Scheduled" ? "bg-blue-500" : "bg-green-500"
        }`}
      >
        {text === "Scheduled" ? "Sắp diễn ra" : "Hoàn tất"}
      </span>
    ),
  },
];

const VaccinationSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setRecords(dummyData);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Card className="m-4 p-4 rounded-2xl shadow-md">
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <CalendarOutlined /> Lịch sắp tới
            </span>
          }
          key="1"
        >
          {loading ? (
            <Spin />
          ) : (
            <Table
              dataSource={records.filter((r) => r.status === "Scheduled")}
              columns={columns}
              pagination={false}
            />
          )}
        </TabPane>
        <TabPane
          tab={
            <span>
              <HistoryOutlined /> Lịch sử
            </span>
          }
          key="2"
        >
          {loading ? (
            <Spin />
          ) : (
            <Table
              dataSource={records.filter((r) => r.status === "Completed")}
              columns={columns}
              pagination={false}
            />
          )}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default VaccinationSchedule;
