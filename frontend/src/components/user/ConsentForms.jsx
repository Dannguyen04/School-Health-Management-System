import {
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  List,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { useState } from "react";

const { Title, Text } = Typography;

const UserConsentForms = () => {
  const [selectedChild, setSelectedChild] = useState("child1");
  const [selectedForm, setSelectedForm] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Mock data - replace with actual API data
  const children = [
    { value: "child1", label: "Nguyễn Văn A" },
    { value: "child2", label: "Nguyễn Văn B" },
  ];

  const [forms, setForms] = useState([
    {
      id: 1,
      title: "Đồng ý tiêm chủng",
      type: "vaccination",
      description: "Form đồng ý cho phép tiêm chủng các loại vaccine theo lịch",
      status: "pending",
      submittedDate: "2024-03-10",
    },
    {
      id: 2,
      title: "Đồng ý khám sức khỏe",
      type: "checkup",
      description: "Form đồng ý cho phép khám sức khỏe định kỳ",
      status: "approved",
      submittedDate: "2024-03-05",
    },
  ]);

  const getStatusTag = (status) => {
    const statusConfig = {
      approved: { color: "success", text: "Đã đồng ý" },
      rejected: { color: "error", text: "Không đồng ý" },
      pending: { color: "warning", text: "Chưa xác nhận" },
    };

    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleConsent = (formId, approved) => {
    Modal.confirm({
      title: approved ? "Xác nhận đồng ý" : "Xác nhận không đồng ý",
      content: "Bạn có chắc chắn về quyết định này?",
      onOk: () => {
        setForms(
          forms.map((form) =>
            form.id === formId
              ? { ...form, status: approved ? "approved" : "rejected" }
              : form
          )
        );
        message.success(
          approved
            ? "Đã xác nhận đồng ý thành công"
            : "Đã xác nhận không đồng ý"
        );
        setIsModalVisible(false);
      },
    });
  };

  return (
    <div className="min-h-[60vh] flex justify-center items-start bg-[#f6fcfa] py-10">
      <div className="w-full max-w-3xl">
        <Card
          className="rounded-3xl shadow-lg border-0 mt-12"
          style={{
            background: "#fff",
            borderRadius: "1.5rem",
            boxShadow: "0px 3px 16px rgba(0,0,0,0.10)",
            padding: "2rem",
            marginTop: "3rem",
          }}
        >
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <Title level={2} className="!text-[#36ae9a] !mb-0">
                Form đồng ý
              </Title>
              <Text type="secondary">
                Danh sách các form đồng ý cho học sinh
              </Text>
            </div>
            <Select
              style={{ width: 200 }}
              value={selectedChild}
              onChange={setSelectedChild}
              options={children}
            />
          </div>

          <Card
            className="rounded-xl border-0 shadow-none"
            style={{ marginBottom: 24 }}
          >
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}
              dataSource={forms}
              renderItem={(form) => (
                <List.Item>
                  <Card
                    title={
                      <Space>
                        <FileTextOutlined />
                        {form.title}
                      </Space>
                    }
                    extra={getStatusTag(form.status)}
                  >
                    <Text>{form.description}</Text>
                    <div className="mt-4">
                      <Text type="secondary">
                        Ngày gửi: {form.submittedDate}
                      </Text>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Space>
                        <Button
                          type="primary"
                          icon={<CheckOutlined />}
                          onClick={() => handleConsent(form.id, true)}
                          disabled={form.status !== "pending"}
                        >
                          Tôi đồng ý
                        </Button>
                        <Button
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => handleConsent(form.id, false)}
                          disabled={form.status !== "pending"}
                        >
                          Tôi không đồng ý
                        </Button>
                      </Space>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </Card>

          <Modal
            title={selectedForm?.title}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={800}
          >
            {selectedForm && (
              <div className="space-y-4">
                <div>
                  <Text strong>Mô tả:</Text>
                  <p>{selectedForm.description}</p>
                </div>
                <div>
                  <Text strong>Trạng thái:</Text>
                  <p>{getStatusTag(selectedForm.status)}</p>
                </div>
                <div>
                  <Text strong>Ngày gửi:</Text>
                  <p>{selectedForm.submittedDate}</p>
                </div>
              </div>
            )}
          </Modal>
        </Card>
      </div>
    </div>
  );
};

export default UserConsentForms;
