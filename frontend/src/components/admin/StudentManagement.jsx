import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    ReloadOutlined,
    UserOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    Tooltip,
    Popconfirm,
    Statistic,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { Option } = Select;

const StudentManagement = () => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
    });

    const [searchForm] = Form.useForm();

    // Function to search
    const handleSearch = (values) => {
        const { studentCode, name, class: studentClass } = values;

        let filtered = [...students];

        if (studentCode) {
            filtered = filtered.filter((student) =>
                student.studentCode
                    ?.toLowerCase()
                    .includes(studentCode.toLowerCase())
            );
        }

        if (name) {
            filtered = filtered.filter((student) =>
                student.name?.toLowerCase().includes(name.toLowerCase())
            );
        }

        if (studentClass) {
            filtered = filtered.filter((student) =>
                student.class
                    ?.toLowerCase()
                    .includes(studentClass.toLowerCase())
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
                message.error(
                    "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
                );
                setTableLoading(false);
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/admin/students/",
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            console.log("Students API Response:", response.data); // Debug log

            if (response.data.success && response.data.data) {
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
                    createdAt: user.createdAt,
                }));

                setStudents(formattedStudents);
                setFilteredStudents(formattedStudents);

                // Tính toán thống kê
                const total = formattedStudents.length;
                const active = formattedStudents.filter(
                    (student) => student.status === "active"
                ).length;
                const inactive = total - active;

                setStats({ total, active, inactive });
            } else {
                message.error("Dữ liệu không hợp lệ từ server");
            }
        } catch (error) {
            console.error("Chi tiết lỗi:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                message.error(
                    error.response.data?.error ||
                        error.response.data?.message ||
                        "Không thể tải danh sách học sinh"
                );
            } else if (error.request) {
                console.error("Request error:", error.request);
                message.error(
                    "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
                );
            } else {
                console.error("Error:", error.message);
                message.error("Có lỗi xảy ra khi tải dữ liệu");
            }
        } finally {
            setTableLoading(false);
        }
    };

    // Fetch students on component mount
    useEffect(() => {
        fetchStudents();
    }, []);

    const getGenderLabel = (gender) => {
        switch (gender) {
            case "male":
                return "Nam";
            case "female":
                return "Nữ";
            case "other":
                return "Khác";
            default:
                return gender;
        }
    };

    const getGenderColor = (gender) => {
        switch (gender) {
            case "male":
                return "blue";
            case "female":
                return "pink";
            case "other":
                return "purple";
            default:
                return "default";
        }
    };

    const columns = [
        {
            title: "Mã học sinh",
            dataIndex: "studentCode",
            key: "studentCode",
            render: (code) => (
                <span className="font-mono text-blue-600">{code}</span>
            ),
        },
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name) => <span className="font-medium">{name}</span>,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (email) => <span className="text-blue-600">{email}</span>,
        },
        {
            title: "Lớp",
            dataIndex: "class",
            key: "class",
            filters: [
                { text: "Lớp 1", value: "1" },
                { text: "Lớp 2", value: "2" },
                { text: "Lớp 3", value: "3" },
                { text: "Lớp 4", value: "4" },
                { text: "Lớp 5", value: "5" },
            ],
            onFilter: (value, record) => record.class?.includes(value),
        },
        {
            title: "Khối",
            dataIndex: "grade",
            key: "grade",
            sorter: (a, b) => a.grade - b.grade,
            render: (grade) => <Tag color="orange">Khối {grade}</Tag>,
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            filters: [
                { text: "Nam", value: "male" },
                { text: "Nữ", value: "female" },
                { text: "Khác", value: "other" },
            ],
            onFilter: (value, record) => record.gender === value,
            render: (gender) => (
                <Tag color={getGenderColor(gender)}>
                    {getGenderLabel(gender)}
                </Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            filters: [
                { text: "Hoạt động", value: "active" },
                { text: "Không hoạt động", value: "inactive" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={status === "active" ? "green" : "red"}>
                    {status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa thông tin học sinh">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            size="small"
                        >
                            Sửa
                        </Button>
                    </Tooltip>
                    <Popconfirm
                        title="Xóa học sinh"
                        description="Bạn có chắc chắn muốn xóa học sinh này? Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Tooltip title="Xóa học sinh">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            >
                                Xóa
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingStudent(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        form.setFieldsValue({
            name: student.name,
            email: student.email,
            dateOfBirth: student.dateOfBirth
                ? dayjs(student.dateOfBirth)
                : null,
            gender: student.gender,
            grade: Number(student.grade),
            class: student.class,
            emergencyContact: student.emergencyContact,
            emergencyPhone: student.emergencyPhone,
            bloodType: student.bloodType,
        });
        setIsModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
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
                bloodType: values.bloodType,
                parentName: values.parentName,
            };

            setLoading(true);
            try {
                const authToken = localStorage.getItem("token");
                if (!authToken) {
                    message.error(
                        "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
                    );
                    setLoading(false);
                    setIsModalVisible(false);
                    return;
                }

                if (editingStudent) {
                    // Update student
                    const updateValues = {
                        fullName: values.name,
                        email: values.email,
                        phone: values.emergencyPhone,
                        dateOfBirth: values.dateOfBirth.toISOString(),
                        gender: values.gender,
                        grade: parseInt(values.grade),
                        class: values.class,
                        emergencyContact: values.emergencyContact,
                        emergencyPhone: values.emergencyPhone,
                        bloodType: values.bloodType,
                    };

                    await axios.put(
                        `http://localhost:5000/admin/students/${editingStudent.id}`,
                        updateValues,
                        {
                            headers: {
                                Authorization: `Bearer ${authToken}`,
                            },
                        }
                    );
                    message.success("Cập nhật học sinh thành công");
                } else {
                    // Add new student
                    await axios.post(
                        "http://localhost:5000/admin/students",
                        formattedValues,
                        {
                            headers: {
                                Authorization: `Bearer ${authToken}`,
                            },
                        }
                    );
                    message.success("Thêm học sinh thành công");
                }
                fetchStudents();
                setIsModalVisible(false);
            } catch (error) {
                message.error(
                    error.response?.data?.error ||
                        "Không thể thực hiện thao tác"
                );
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        } catch (error) {
            console.error("Lỗi xác thực:", error);
        }
    };

    const handleDelete = async (studentId) => {
        setTableLoading(true);
        try {
            const authToken = localStorage.getItem("token");
            if (!authToken) {
                message.error(
                    "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
                );
                setTableLoading(false);
                return;
            }

            await axios.delete(
                `http://localhost:5000/admin/users/${studentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            message.success("Xóa học sinh thành công");
            fetchStudents();
        } catch (error) {
            message.error(
                error.response?.data?.error || "Không thể xóa học sinh"
            );
            console.error("Lỗi khi xóa học sinh:", error);
        } finally {
            setTableLoading(false);
        }
    };

    const handleResetSearch = () => {
        searchForm.resetFields();
        setFilteredStudents(students);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    Quản lý học sinh
                </h1>
                <div className="flex gap-2">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchStudents}
                        loading={tableLoading}
                    >
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Thêm học sinh
                    </Button>
                </div>
            </div>

            {/* Thống kê */}
            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Tổng số học sinh"
                            value={stats.total}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Học sinh hoạt động"
                            value={stats.active}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Học sinh không hoạt động"
                            value={stats.inactive}
                            valueStyle={{ color: "#cf1322" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Tìm kiếm */}
            <Card title="Tìm kiếm học sinh" className="shadow-sm">
                <Form
                    form={searchForm}
                    onFinish={handleSearch}
                    layout="vertical"
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="studentCode" label="Mã học sinh">
                                <Input
                                    placeholder="Nhập mã học sinh"
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="name" label="Tên học sinh">
                                <Input
                                    placeholder="Nhập tên học sinh"
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="class" label="Lớp">
                                <Input placeholder="Nhập lớp" allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} className="text-right">
                            <Space>
                                <Button onClick={handleResetSearch}>
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

            {/* Bảng dữ liệu */}
            <Card className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={filteredStudents}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} học sinh`,
                    }}
                    loading={tableLoading}
                    scroll={{ x: 1400 }}
                />
            </Card>

            {/* Modal thêm/sửa học sinh */}
            <Modal
                title={
                    editingStudent
                        ? "Sửa thông tin học sinh"
                        : "Thêm học sinh mới"
                }
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => setIsModalVisible(false)}
                okText={editingStudent ? "Cập nhật" : "Thêm"}
                cancelText="Hủy"
                confirmLoading={loading}
                width={700}
                destroyOnClose
            >
                <Spin spinning={loading}>
                    <Form form={form} layout="vertical">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="Họ và tên"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập họ và tên!",
                                        },
                                        {
                                            min: 2,
                                            message:
                                                "Tên phải có ít nhất 2 ký tự!",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập họ và tên học sinh" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập email!",
                                        },
                                        {
                                            type: "email",
                                            message: "Email không hợp lệ!",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập email" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="dateOfBirth"
                                    label="Ngày sinh"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn ngày sinh!",
                                        },
                                    ]}
                                >
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        placeholder="Chọn ngày sinh"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="gender"
                                    label="Giới tính"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn giới tính!",
                                        },
                                    ]}
                                >
                                    <Select placeholder="Chọn giới tính">
                                        <Option value="male">Nam</Option>
                                        <Option value="female">Nữ</Option>
                                        <Option value="other">Khác</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="grade"
                                    label="Khối"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập khối!",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        min={1}
                                        max={12}
                                        style={{ width: "100%" }}
                                        placeholder="Nhập khối"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="class"
                                    label="Lớp"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập lớp!",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập lớp" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="bloodType" label="Nhóm máu">
                                    <Select
                                        placeholder="Chọn nhóm máu"
                                        allowClear
                                    >
                                        <Option value="A+">A+</Option>
                                        <Option value="A-">A-</Option>
                                        <Option value="B+">B+</Option>
                                        <Option value="B-">B-</Option>
                                        <Option value="AB+">AB+</Option>
                                        <Option value="AB-">AB-</Option>
                                        <Option value="O+">O+</Option>
                                        <Option value="O-">O-</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="emergencyContact"
                                    label="Người liên hệ khẩn cấp"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng nhập tên người liên hệ!",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập tên người liên hệ" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="emergencyPhone"
                            label="Số điện thoại liên hệ khẩn cấp"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập số điện thoại!",
                                },
                                {
                                    pattern: /^[0-9+\-\s()]+$/,
                                    message: "Số điện thoại không hợp lệ!",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>

                        {!editingStudent && (
                            <Form.Item
                                name="parentName"
                                label="Tên phụ huynh"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tên phụ huynh!",
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập tên phụ huynh" />
                            </Form.Item>
                        )}
                    </Form>
                </Spin>
            </Modal>
        </div>
    );
};

export default StudentManagement;
