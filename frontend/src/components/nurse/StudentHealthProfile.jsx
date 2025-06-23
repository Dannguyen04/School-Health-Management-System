import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
// import { nurseAPI } from "../../utils/api";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const StudentHealthProfile = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [error, setError] = useState(null);

  // Sample data structure based on HealthProfile model
  const sampleStudents = [
    {
      id: "1",
      studentCode: "HS001",
      fullName: "Nguyễn Văn An",
      class: "10A1",
      grade: "10",
      healthProfile: {
        allergies: ["Penicillin", "Đậu phộng", "Hải sản"],
        chronicDiseases: ["Hen suyễn", "Tiểu đường type 1"],
        medications: ["Ventolin", "Insulin"],
        treatmentHistory:
          "Đã điều trị hen suyễn từ năm 2020, tiểu đường từ 2022",
        vision: "Cận thị -2.5 độ, đeo kính",
        hearing: "Bình thường",
        height: 165,
        weight: 55,
        notes:
          "Học sinh cần theo dõi đường huyết thường xuyên, mang theo thuốc hen suyễn",
      },
    },
    {
      id: "2",
      studentCode: "HS002",
      fullName: "Trần Thị Bình",
      class: "11A2",
      grade: "11",
      healthProfile: {
        allergies: ["Sulfa"],
        chronicDiseases: [],
        medications: [],
        treatmentHistory: "Không có",
        vision: "10/10",
        hearing: "Bình thường",
        height: 160,
        weight: 48,
        notes: "Sức khỏe tốt, không có vấn đề đặc biệt",
      },
    },
    {
      id: "3",
      studentCode: "HS003",
      fullName: "Lê Văn Cường",
      class: "9A1",
      grade: "9",
      healthProfile: {
        allergies: ["Latex"],
        chronicDiseases: ["Bệnh tim bẩm sinh"],
        medications: ["Aspirin", "Beta-blocker"],
        treatmentHistory: "Phẫu thuật tim năm 2018, cần theo dõi định kỳ",
        vision: "10/10",
        hearing: "Bình thường",
        height: 170,
        weight: 60,
        notes: "Hạn chế vận động mạnh, cần theo dõi nhịp tim",
      },
    },
  ];

  const fetchStudents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      setTimeout(() => {
        setStudents(sampleStudents);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Không thể tải danh sách học sinh"
      );
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRefresh = () => {
    fetchStudents(true);
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setIsProfileModalVisible(true);
  };

  const handleEditProfile = (student) => {
    setSelectedStudent(student);
    form.setFieldsValue({
      allergies: student.healthProfile?.allergies || [],
      chronicDiseases: student.healthProfile?.chronicDiseases || [],
      medications: student.healthProfile?.medications || [],
      treatmentHistory: student.healthProfile?.treatmentHistory || "",
      vision: student.healthProfile?.vision || "",
      hearing: student.healthProfile?.hearing || "",
      height: student.healthProfile?.height || null,
      weight: student.healthProfile?.weight || null,
      notes: student.healthProfile?.notes || "",
    });
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async (values) => {
    try {
      // TODO: Replace with actual API call
      // await nurseAPI.updateHealthProfile(selectedStudent.id, values);
      console.log("Saving health profile:", values);

      // Update local state
      const updatedStudents = students.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              healthProfile: { ...student.healthProfile, ...values },
            }
          : student
      );
      setStudents(updatedStudents);

      setIsEditModalVisible(false);
      setSelectedStudent(null);
    } catch (err) {
      console.error("Error saving health profile:", err);
    }
  };

  // Xóa học sinh
  const handleDeleteStudent = (studentId) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  const columns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
      width: 120,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
      width: 80,
    },
    {
      title: "Dị ứng",
      dataIndex: ["healthProfile", "allergies"],
      key: "allergies",
      render: (allergies) => (
        <div>
          {allergies && allergies.length > 0 ? (
            allergies.slice(0, 2).map((allergy) => (
              <Tag color="red" key={allergy} size="small">
                {allergy}
              </Tag>
            ))
          ) : (
            <Text type="secondary">Không có</Text>
          )}
          {allergies && allergies.length > 2 && (
            <Tag color="red" size="small">
              +{allergies.length - 2}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Bệnh mãn tính",
      dataIndex: ["healthProfile", "chronicDiseases"],
      key: "chronicDiseases",
      render: (diseases) => (
        <div>
          {diseases && diseases.length > 0 ? (
            diseases.slice(0, 1).map((disease) => (
              <Tag color="orange" key={disease} size="small">
                {disease}
              </Tag>
            ))
          ) : (
            <Text type="secondary">Không có</Text>
          )}
          {diseases && diseases.length > 1 && (
            <Tag color="orange" size="small">
              +{diseases.length - 1}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Thị lực",
      dataIndex: ["healthProfile", "vision"],
      key: "vision",
      width: 120,
      render: (vision) => <Text>{vision || "Chưa cập nhật"}</Text>,
    },
    {
      title: "Chiều cao/Cân nặng",
      key: "heightWeight",
      width: 140,
      render: (_, record) => {
        const { height, weight } = record.healthProfile || {};
        return (
          <Text>
            {height && weight ? `${height}cm / ${weight}kg` : "Chưa cập nhật"}
          </Text>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewProfile(record)}
          ></Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditProfile(record)}
          ></Button>
          <Popconfirm
            title="Xóa học sinh"
            description="Bạn có chắc chắn muốn xóa học sinh này?"
            onConfirm={() => handleDeleteStudent(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button danger size="small" icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderHealthProfile = (profile) => {
    if (!profile) {
      return <Empty description="Chưa có hồ sơ sức khỏe" />;
    }

    return (
      <div className="space-y-4">
        {/* Allergies Section */}
        <Card
          size="small"
          title="Dị ứng"
          className="border-l-4 border-l-red-500"
        >
          {profile.allergies && profile.allergies.length > 0 ? (
            <div className="space-y-2">
              {profile.allergies.map((allergy, index) => (
                <Tag color="red" key={index} size="large">
                  {allergy}
                </Tag>
              ))}
            </div>
          ) : (
            <Text type="secondary">Không có dị ứng</Text>
          )}
        </Card>

        {/* Chronic Diseases Section */}
        <Card
          size="small"
          title="Bệnh mãn tính"
          className="border-l-4 border-l-orange-500"
        >
          {profile.chronicDiseases && profile.chronicDiseases.length > 0 ? (
            <div className="space-y-2">
              {profile.chronicDiseases.map((disease, index) => (
                <Tag color="orange" key={index} size="large">
                  {disease}
                </Tag>
              ))}
            </div>
          ) : (
            <Text type="secondary">Không có bệnh mãn tính</Text>
          )}
        </Card>

        {/* Current Medications */}
        <Card
          size="small"
          title="Thuốc đang sử dụng"
          className="border-l-4 border-l-blue-500"
        >
          {profile.medications && profile.medications.length > 0 ? (
            <div className="space-y-2">
              {profile.medications.map((medication, index) => (
                <Tag color="blue" key={index} size="large">
                  {medication}
                </Tag>
              ))}
            </div>
          ) : (
            <Text type="secondary">Không có thuốc đang sử dụng</Text>
          )}
        </Card>

        {/* Physical Measurements */}
        <Row gutter={16}>
          <Col span={12}>
            <Card
              size="small"
              title="Thông số cơ thể"
              className="border-l-4 border-l-green-500"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Chiều cao">
                  {profile.height ? `${profile.height} cm` : "Chưa cập nhật"}
                </Descriptions.Item>
                <Descriptions.Item label="Cân nặng">
                  {profile.weight ? `${profile.weight} kg` : "Chưa cập nhật"}
                </Descriptions.Item>
                <Descriptions.Item label="Thị lực">
                  {profile.vision || "Chưa cập nhật"}
                </Descriptions.Item>
                <Descriptions.Item label="Thính lực">
                  {profile.hearing || "Chưa cập nhật"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              size="small"
              title="Tiền sử điều trị"
              className="border-l-4 border-l-purple-500"
            >
              <Text>
                {profile.treatmentHistory || "Không có tiền sử điều trị"}
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Notes */}
        {profile.notes && (
          <Card
            size="small"
            title="Ghi chú"
            className="border-l-4 border-l-gray-500"
          >
            <Text>{profile.notes}</Text>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        className="mb-4"
        action={
          <Button
            type="link"
            onClick={handleRefresh}
            icon={<ReloadOutlined />}
            className="text-red-600 hover:text-red-800"
          >
            Thử lại
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2">
            Hồ sơ sức khỏe học sinh
          </Title>
          <Text type="secondary">
            Quản lý và theo dõi thông tin sức khỏe của học sinh
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={refreshing}
          type="primary"
          ghost
        >
          Làm mới
        </Button>
      </div>

      <Card>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="studentCode" label="Mã học sinh">
                <Input placeholder="Nhập mã học sinh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="name" label="Tên học sinh">
                <Input placeholder="Nhập tên học sinh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="class" label="Lớp">
                <Input placeholder="Nhập lớp" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="text-right">
              <Space>
                <Button>Xóa bộ lọc</Button>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                >
                  Tìm kiếm
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          pagination={{
            pageSize: 5,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* View Profile Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <UserOutlined className="text-blue-500" />
            <span>Hồ sơ sức khỏe - {selectedStudent?.fullName}</span>
          </div>
        }
        open={isProfileModalVisible}
        onCancel={() => {
          setIsProfileModalVisible(false);
          setSelectedStudent(null);
        }}
        footer={[
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsProfileModalVisible(false);
              handleEditProfile(selectedStudent);
            }}
          >
            Cập nhật
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setIsProfileModalVisible(false);
              setSelectedStudent(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedStudent && (
          <div className="space-y-4">
            <Card size="small" title="Thông tin học sinh">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Mã học sinh">
                  {selectedStudent.studentCode}
                </Descriptions.Item>
                <Descriptions.Item label="Họ và tên">
                  {selectedStudent.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="Lớp">
                  {selectedStudent.class}
                </Descriptions.Item>
                <Descriptions.Item label="Khối">
                  {selectedStudent.grade}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider />

            {renderHealthProfile(selectedStudent.healthProfile)}
          </div>
        )}
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        title="Cập nhật hồ sơ sức khỏe"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedStudent(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
          className="space-y-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="allergies" label="Dị ứng">
                <Select mode="tags" placeholder="Nhập các dị ứng" allowClear />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="chronicDiseases" label="Bệnh mãn tính">
                <Select
                  mode="tags"
                  placeholder="Nhập các bệnh mãn tính"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="medications" label="Thuốc đang sử dụng">
            <Select
              mode="tags"
              placeholder="Nhập các thuốc đang sử dụng"
              allowClear
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="height" label="Chiều cao (cm)">
                <InputNumber
                  min={0}
                  max={300}
                  placeholder="Nhập chiều cao"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="weight" label="Cân nặng (kg)">
                <InputNumber
                  min={0}
                  max={500}
                  placeholder="Nhập cân nặng"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vision" label="Thị lực">
                <Input placeholder="Ví dụ: 10/10, Cận thị -2.5 độ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hearing" label="Thính lực">
                <Input placeholder="Ví dụ: Bình thường, Khiếm thính" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="treatmentHistory" label="Tiền sử điều trị">
            <TextArea rows={3} placeholder="Nhập tiền sử điều trị y tế" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập các ghi chú về sức khỏe" />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => {
                setIsEditModalVisible(false);
                setSelectedStudent(null);
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentHealthProfile;
