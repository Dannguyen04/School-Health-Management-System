import { Calendar, Card, Select, Tag, Typography } from "antd";
import { useState } from "react";

const { Title } = Typography;

const VaccinationSchedule = () => {
  const [selectedChild, setSelectedChild] = useState("child1");

  // Mock data - replace with actual API data
  const children = [
    { value: "child1", label: "Nguyễn Văn A" },
    { value: "child2", label: "Nguyễn Văn B" },
  ];

  const events = [
    {
      date: "2024-03-15",
      type: "vaccination",
      name: "Vaccine 5 trong 1",
      status: "completed",
    },
    {
      date: "2024-03-20",
      type: "checkup",
      name: "Khám sức khỏe định kỳ",
      status: "upcoming",
    },
    {
      date: "2024-03-25",
      type: "vaccination",
      name: "Vaccine cúm",
      status: "pending",
    },
  ];

  const getStatusTag = (status) => {
    const statusConfig = {
      completed: { color: "success", text: "✅ Hoàn tất" },
      upcoming: { color: "processing", text: "🕒 Sắp tới" },
      pending: { color: "warning", text: "❌ Chưa xác nhận" },
    };

    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const dateCellRender = (date) => {
    const formattedDate = date.format("YYYY-MM-DD");
    const dayEvents = events.filter((event) => event.date === formattedDate);

    return (
      <ul className="events">
        {dayEvents.map((event, index) => (
          <li key={index}>
            <div className="flex items-center gap-2">
              <span>{event.name}</span>
              {getStatusTag(event.status)}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Lịch tiêm & khám</Title>
        <Select
          style={{ width: 200 }}
          value={selectedChild}
          onChange={setSelectedChild}
          options={children}
        />
      </div>

      <Card>
        <Calendar
          dateCellRender={dateCellRender}
          mode="month"
          className="vaccination-calendar"
        />
      </Card>

      <style jsx>{`
        .events {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .events li {
          margin: 4px 0;
          font-size: 12px;
        }
        .vaccination-calendar :global(.ant-picker-calendar-date-content) {
          height: auto;
          min-height: 80px;
        }
      `}</style>
    </div>
  );
};

export default VaccinationSchedule;
