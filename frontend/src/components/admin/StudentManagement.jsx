import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const { Option } = Select;

const StudentManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [students, setStudents] = useState([]); // State for real student data
  const [filteredStudents, setFilteredStudents] = useState([]); // State for filtered students
  const [tableLoading, setTableLoading] = useState(false); // Loading for table

  const [searchForm] = Form.useForm();

  // Validation schema for student form
  const studentValidationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Vui lòng nhập họ và tên")
      .min(2, "Tên phải có ít nhất 2 ký tự")
      .max(50, "Tên không được quá 50 ký tự"),
    email: Yup.string()
      .required("Vui lòng nhập email")
      .email("Email không hợp lệ"),
    dateOfBirth: Yup.date()
      .required("Vui lòng chọn ngày sinh")
      .max(new Date(), "Ngày sinh không thể là tương lai"),
    gender: Yup.string()
      .required("Vui lòng chọn giới tính")
      .oneOf(["male", "female"], "Giới tính không hợp lệ"),
    grade: Yup.number()
      .required("Vui lòng chọn khối")
      .min(1, "Khối phải từ 1-5")
      .max(5, "Khối phải từ 1-5"),
    class: Yup.string()
      .required("Vui lòng nhập lớp")
      .min(1, "Lớp không được để trống")
      .test(
        "class-format",
        "Lớp phải có định dạng: [Khối][Chữ cái A-E] (VD: 1A, 2B, 3C)",
        function (value) {
          if (!value) return false;

          const grade = this.parent.grade;
          if (!grade) return true; // Nếu chưa chọn khối thì không validate

          // Regex để kiểm tra định dạng: [Khối][Chữ cái A-E]
          const classRegex = new RegExp(`^${grade}[A-E]$`);

          if (!classRegex.test(value)) {
            return false;
          }

          return true;
        }
      ),
    emergencyContact: Yup.string()
      .required("Vui lòng nhập tên người liên hệ")
      .min(2, "Tên người liên hệ phải có ít nhất 2 ký tự"),
    emergencyPhone: Yup.string()
      .required("Vui lòng nhập số điện thoại")
      .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
    parentName: Yup.string()
      .required("Vui lòng nhập tên phụ huynh")
      .min(2, "Tên phụ huynh phải có ít nhất 2 ký tự"),
  });

  // Function to search
  const handleSearch = (values) => {
    const { studentCode, name, class: studentClass } = values;

    let filtered = [...students];

    if (studentCode?.trim()) {
      filtered = filtered.filter((student) =>
        student.studentCode
          ?.toLowerCase()
          .includes(studentCode.trim().toLowerCase())
      );
    }

    if (name?.trim()) {
      filtered = filtered.filter((student) =>
        student.name?.toLowerCase().includes(name.trim().toLowerCase())
      );
    }

    if (studentClass?.trim()) {
      filtered = filtered.filter((student) =>
        student.class?.toLowerCase().includes(studentClass.trim().toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  // Function to fetch students
  const fetchStudents = async () => {
    setTableLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setTableLoading(false);
        return;
      }

      const response = await axios.get("/api/admin/students", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Map the fetched data to match the table's expected structure
      const formattedStudents = response.data.data.map((user) => ({
        id: user.id,
        studentCode: user.studentProfile?.studentCode,
        name: user.fullName,
        email: user.email,
        dateOfBirth: user.studentProfile?.dateOfBirth,
        gender: user.studentProfile?.gender,
        class: user.studentProfile?.class,
        grade: user.studentProfile?.grade,
        bloodType: user.studentProfile?.bloodType,
        emergencyContact: user.studentProfile?.emergencyContact,
        emergencyPhone: user.studentProfile?.emergencyPhone,
        status: user.isActive ? "active" : "inactive",
      }));
      setStudents(formattedStudents);
      setFilteredStudents(formattedStudents); // Initialize filtered students with all students
    } catch (error) {
      message.error(
        error.response?.data?.error || "Không thể tải danh sách học sinh"
      );
      console.error("Lỗi khi tải danh sách học sinh:", error);
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const columns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Khối",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa học sinh"
            description={`Bạn có chắc chắn muốn xóa học sinh "${record.name}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingStudent(null);
    setIsModalVisible(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setTableLoading(true);
      const formattedValues = editingStudent
        ? {
            studentCode: values.studentCode,
            fullName: values.name,
            email: values.email,
            phone: values.emergencyPhone,
            dateOfBirth: values.dateOfBirth.toISOString(),
            gender: values.gender,
            grade: parseInt(values.grade),
            class: values.class,
            emergencyContact: values.emergencyContact,
            emergencyPhone: values.emergencyPhone,
            parentName: values.parentName,
          }
        : {
            fullName: values.name,
            email: values.email,
            phone: values.emergencyPhone,
            password: "defaultPassword123",
            dateOfBirth: values.dateOfBirth.toISOString(),
            gender: values.gender,
            grade: parseInt(values.grade),
            class: values.class,
            emergencyContact: values.emergencyContact,
            emergencyPhone: values.emergencyPhone,
            parentName: values.parentName,
          };

      if (editingStudent) {
        // Update student
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          message.error(
            "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
          );
          setTableLoading(false);
          setIsModalVisible(false);
          return;
        }

        const updateValues = {
          studentCode: values.studentCode,
          fullName: values.name,
          email: values.email,
          phone: values.emergencyPhone,
          dateOfBirth: values.dateOfBirth.toISOString(),
          gender: values.gender,
          grade: parseInt(values.grade),
          class: values.class,
          emergencyContact: values.emergencyContact,
          emergencyPhone: values.emergencyPhone,
        };

        await axios.put(
          `/api/admin/students/${editingStudent.id}`,
          updateValues,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        message.success("Cập nhật học sinh thành công");
        fetchStudents();
      } else {
        // Add new student
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          message.error(
            "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
          );
          setTableLoading(false);
          setIsModalVisible(false);
          return;
        }

        await axios.post("/api/admin/students", formattedValues, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        message.success("Thêm học sinh thành công");
        fetchStudents();
      }
      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      message.error(
        error.response?.data?.error || "Không thể thực hiện thao tác"
      );
      console.error("Lỗi:", error);
    } finally {
      setSubmitting(false);
      setTableLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingStudent(null);
  };

  const handleDelete = async (studentId) => {
    setTableLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setTableLoading(false);
        return;
      }
      // Call deleteUser endpoint for students
      await axios.delete(`/api/admin/users/${studentId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      message.success("Xóa học sinh thành công");
      fetchStudents(); // Refresh data after deletion
    } catch (error) {
      message.error(error.response?.data?.error || "Không thể xóa học sinh");
      console.error("Lỗi khi xóa học sinh:", error);
    } finally {
      setTableLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý học sinh</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm học sinh
        </Button>
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
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
                <Button
                  onClick={() => {
                    searchForm.resetFields();
                    setFilteredStudents(students);
                  }}
                >
                  Xóa bộ lọc
                </Button>
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

      <Table
        columns={columns}
        dataSource={filteredStudents}
        rowKey="id"
        pagination={{ pageSize: 5, showQuickJumper: true }}
        loading={tableLoading}
      />

      <Modal
        title={editingStudent ? "Sửa thông tin học sinh" : "Thêm học sinh mới"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Formik
          initialValues={
            editingStudent
              ? {
                  studentCode: editingStudent.studentCode || "",
                  name: editingStudent.name || "",
                  email: editingStudent.email || "",
                  dateOfBirth: editingStudent.dateOfBirth
                    ? dayjs(editingStudent.dateOfBirth)
                    : dayjs(),
                  gender: editingStudent.gender || "male",
                  grade: editingStudent.grade
                    ? Number(editingStudent.grade)
                    : 1,
                  class: editingStudent.class || "",
                  emergencyContact: editingStudent.emergencyContact || "",
                  emergencyPhone: editingStudent.emergencyPhone || "",
                  parentName: editingStudent.parentName || "",
                }
              : {
                  studentCode: "",
                  name: "",
                  email: "",
                  dateOfBirth: dayjs(),
                  gender: "male",
                  grade: 1,
                  class: "",
                  emergencyContact: "",
                  emergencyPhone: "",
                  parentName: "",
                }
          }
          validationSchema={studentValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form layout="vertical" onFinish={handleSubmit}>
              {editingStudent && (
                <Form.Item
                  label="Mã học sinh"
                  validateStatus={
                    touched.studentCode && errors.studentCode ? "error" : ""
                  }
                  help={touched.studentCode && errors.studentCode}
                >
                  <Input
                    name="studentCode"
                    value={values.studentCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                </Form.Item>
              )}
              <Form.Item
                label="Họ và tên"
                validateStatus={touched.name && errors.name ? "error" : ""}
                help={touched.name && errors.name}
              >
                <Input
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập họ và tên"
                />
              </Form.Item>
              <Form.Item
                label="Email"
                validateStatus={touched.email && errors.email ? "error" : ""}
                help={touched.email && errors.email}
              >
                <Input
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập email"
                />
              </Form.Item>
              <Form.Item
                label="Ngày sinh"
                validateStatus={
                  touched.dateOfBirth && errors.dateOfBirth ? "error" : ""
                }
                help={touched.dateOfBirth && errors.dateOfBirth}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  value={values.dateOfBirth}
                  onChange={(date) => setFieldValue("dateOfBirth", date)}
                  onBlur={handleBlur}
                />
              </Form.Item>
              <Form.Item
                label="Giới tính"
                validateStatus={touched.gender && errors.gender ? "error" : ""}
                help={touched.gender && errors.gender}
              >
                <Select
                  value={values.gender}
                  onChange={(value) => setFieldValue("gender", value)}
                  onBlur={handleBlur}
                >
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Khối"
                validateStatus={touched.grade && errors.grade ? "error" : ""}
                help={touched.grade && errors.grade}
              >
                <Select
                  value={values.grade}
                  onChange={(value) => setFieldValue("grade", value)}
                  onBlur={handleBlur}
                >
                  <Option value={1}>1</Option>
                  <Option value={2}>2</Option>
                  <Option value={3}>3</Option>
                  <Option value={4}>4</Option>
                  <Option value={5}>5</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Lớp"
                validateStatus={touched.class && errors.class ? "error" : ""}
                help={touched.class && errors.class}
              >
                <Input
                  name="class"
                  value={values.class}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập lớp"
                />
              </Form.Item>
              <Form.Item
                label="Người liên hệ khẩn cấp"
                validateStatus={
                  touched.emergencyContact && errors.emergencyContact
                    ? "error"
                    : ""
                }
                help={touched.emergencyContact && errors.emergencyContact}
              >
                <Input
                  name="emergencyContact"
                  value={values.emergencyContact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập tên người liên hệ"
                />
              </Form.Item>
              <Form.Item
                label="Số điện thoại liên hệ khẩn cấp"
                validateStatus={
                  touched.emergencyPhone && errors.emergencyPhone ? "error" : ""
                }
                help={touched.emergencyPhone && errors.emergencyPhone}
              >
                <Input
                  name="emergencyPhone"
                  value={values.emergencyPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập số điện thoại"
                />
              </Form.Item>
              <Form.Item
                label="Tên phụ huynh"
                validateStatus={
                  touched.parentName && errors.parentName ? "error" : ""
                }
                help={touched.parentName && errors.parentName}
              >
                <Input
                  name="parentName"
                  value={values.parentName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập tên phụ huynh"
                />
              </Form.Item>
              <div style={{ textAlign: "right", marginTop: 24 }}>
                <Space>
                  <Button onClick={handleModalCancel}>Hủy</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                  >
                    {editingStudent ? "Cập nhật" : "Thêm"}
                  </Button>
                </Space>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default StudentManagement;
