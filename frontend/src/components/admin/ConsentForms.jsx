import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Select, Space, Table, Tag } from "antd";
import React, { useState } from "react";

const { Option } = Select;
const { TextArea } = Input;

const ConsentForms = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  // Mock data - replace with real data from API
  const [forms, setForms] = useState([
    {
      id: 1,
      studentName: "Nguyễn Văn A",
      grade: "5A",
      formType: "MEDICAL_CONSENT",
      status: "pending",
      submittedDate: "2024-03-15",
      parentName: "Nguyễn Thị B",
    },
    {
      id: 2,
      studentName: "Trần Thị C",
      grade: "4B",
      formType: "MEDICATION_CONSENT",
      status: "approved",
      submittedDate: "2024-03-14",
      parentName: "Trần Văn D",
    },
  ]);

  const columns = [
    {
      title: "Tên học sinh",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Lớp",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Loại biểu mẫu",
      dataIndex: "formType",
      key: "formType",
      render: (type) => (
        <Tag
          color={
            type === "MEDICAL_CONSENT"
              ? "blue"
              : type === "MEDICATION_CONSENT"
              ? "green"
              : "default"
          }
        >
          {type === "MEDICAL_CONSENT"
            ? "Đồng ý khám sức khỏe"
            : "Đồng ý sử dụng thuốc"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "approved"
              ? "green"
              : status === "pending"
              ? "orange"
              : "red"
          }
        >
          {status === "approved"
            ? "Đã duyệt"
            : status === "pending"
            ? "Đang chờ"
            : "Từ chối"}
        </Tag>
      ),
    },
    {
      title: "Ngày nộp",
      dataIndex: "submittedDate",
      key: "submittedDate",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>
            Xem
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                Duyệt
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleView = (form) => {
    setSelectedForm(form);
    setIsModalVisible(true);
  };

  const handleApprove = (formId) => {
    Modal.confirm({
      title: "Duyệt biểu mẫu",
      content: "Bạn có chắc chắn muốn duyệt biểu mẫu này?",
      onOk: () => {
        setForms(
          forms.map((form) =>
            form.id === formId ? { ...form, status: "approved" } : form
          )
        );
        message.success("Duyệt biểu mẫu thành công");
      },
    });
  };

  const handleReject = (formId) => {
    Modal.confirm({
      title: "Từ chối biểu mẫu",
      content: "Bạn có chắc chắn muốn từ chối biểu mẫu này?",
      onOk: () => {
        setForms(
          forms.map((form) =>
            form.id === formId ? { ...form, status: "rejected" } : form
          )
        );
        message.success("Từ chối biểu mẫu thành công");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Biểu mẫu đồng ý</h1>
      </div>

      <Table
        columns={columns}
        dataSource={forms}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Chi tiết biểu mẫu"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Tên học sinh:</p>
                <p>{selectedForm.studentName}</p>
              </div>
              <div>
                <p className="font-semibold">Lớp:</p>
                <p>{selectedForm.grade}</p>
              </div>
              <div>
                <p className="font-semibold">Tên phụ huynh:</p>
                <p>{selectedForm.parentName}</p>
              </div>
              <div>
                <p className="font-semibold">Loại biểu mẫu:</p>
                <p>
                  {selectedForm.formType === "MEDICAL_CONSENT"
                    ? "Đồng ý khám sức khỏe"
                    : "Đồng ý sử dụng thuốc"}
                </p>
              </div>
              <div>
                <p className="font-semibold">Trạng thái:</p>
                <Tag
                  color={
                    selectedForm.status === "approved"
                      ? "green"
                      : selectedForm.status === "pending"
                      ? "orange"
                      : "red"
                  }
                >
                  {selectedForm.status === "approved"
                    ? "Đã duyệt"
                    : selectedForm.status === "pending"
                    ? "Đang chờ"
                    : "Từ chối"}
                </Tag>
              </div>
              <div>
                <p className="font-semibold">Ngày nộp:</p>
                <p>{selectedForm.submittedDate}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold">Ghi chú thêm:</p>
              <TextArea
                rows={4}
                placeholder="Thêm ghi chú tại đây..."
                value={selectedForm.notes || ""}
                onChange={(e) => {
                  setSelectedForm({
                    ...selectedForm,
                    notes: e.target.value,
                  });
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsentForms;
