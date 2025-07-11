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
    Divider,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    Tooltip,
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
    const [students, setStudents] = useState([]); // State for real student data
    const [filteredStudents, setFilteredStudents] = useState([]); // State for filtered students
    const [tableLoading, setTableLoading] = useState(false); // Loading for table
    const [parents, setParents] = useState([]); // State for parents
    const [parentLoading, setParentLoading] = useState(false); // Loading for parents

    // Parent modal states
    const [isParentModalVisible, setIsParentModalVisible] = useState(false);
    const [parentForm] = Form.useForm();
    const [selectedParent, setSelectedParent] = useState(null);
    const [parentModalLoading, setParentModalLoading] = useState(false);
    const [parentSearchTerm, setParentSearchTerm] = useState(""); // Add search term state

    const [searchForm] = Form.useForm();

    // Function to fetch parents
    const fetchParents = async () => {
        setParentLoading(true);
        try {
            const authToken = localStorage.getItem("token");
            if (!authToken) {
                message.error(
                    "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
                );
                setParentLoading(false);
                return;
            }

            const response = await axios.get("/api/admin/parents", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            setParents(response.data.data);
        } catch (error) {
            message.error(
                error.response?.data?.error ||
                    "Không thể tải danh sách phụ huynh"
            );
            console.error("Lỗi khi tải danh sách phụ huynh:", error);
        } finally {
            setParentLoading(false);
        }
    };

    // Function to search
    const handleSearch = (values) => {
        const { studentCode, name, class: studentClass } = values;

        let filtered = [...students];

        if (studentCode?.trim()) {
            filtered = filtered.filter((student) =>
                student.studentCode
                    ?.trim()
                    .toLowerCase()
                    .includes(studentCode.trim().toLowerCase())
            );
        }

        if (name?.trim()) {
            filtered = filtered.filter((student) =>
                student.name
                    ?.trim()
                    .toLowerCase()
                    .includes(name.trim().toLowerCase())
            );
        }

        if (studentClass?.trim()) {
            filtered = filtered.filter((student) =>
                student.class
                    ?.trim()
                    .toLowerCase()
                    .includes(studentClass.trim().toLowerCase())
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
                status: user.isActive ? "active" : "inactive",
            }));
            setStudents(formattedStudents);
            setFilteredStudents(formattedStudents); // Initialize filtered students with all students
        } catch (error) {
            message.error(
                error.response?.data?.error ||
                    "Không thể tải danh sách học sinh"
            );
            console.error("Lỗi khi tải danh sách học sinh:", error);
        } finally {
            setTableLoading(false);
        }
    };

    // Fetch students on component mount
    useEffect(() => {
        fetchStudents();
        fetchParents();
    }, []);

    // Parent modal functions
    const handleOpenParentModal = () => {
        setIsParentModalVisible(true);
        parentForm.resetFields();
        setSelectedParent(null);
        setParentSearchTerm(""); // Reset search term
    };

    const handleParentSelection = (parentId) => {
        const parent = parents.find((p) => p.id === parentId);
        setSelectedParent(parent);
    };

    // Filter parents based on search term
    const filteredParents = parents.filter(
        (parent) =>
            parent.fullName
                ?.toLowerCase()
                .includes(parentSearchTerm.trim().toLowerCase()) ||
            parent.email
                ?.toLowerCase()
                .includes(parentSearchTerm.trim().toLowerCase()) ||
            parent.phone?.includes(parentSearchTerm.trim())
    );

    const handleCreateNewParent = async () => {
        try {
            const values = await parentForm.validateFields();
            setParentModalLoading(true);

            const authToken = localStorage.getItem("token");
            if (!authToken) {
                message.error(
                    "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
                );
                return;
            }

            const response = await axios.post(
                "/api/admin/parents",
                {
                    name: values.newParentName,
                    email: values.newParentEmail,
                    phone: values.newParentPhone,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const newParent = response.data.data;
            setParents([...parents, newParent]);
            setSelectedParent(newParent);
            message.success("Tạo phụ huynh mới thành công");
        } catch (error) {
            message.error(
                error.response?.data?.error || "Không thể tạo phụ huynh mới"
            );
            console.error("Lỗi khi tạo phụ huynh:", error);
        } finally {
            setParentModalLoading(false);
        }
    };

    const handleConfirmParent = () => {
        if (!selectedParent) {
            message.error("Vui lòng chọn hoặc tạo phụ huynh");
            return;
        }
        setIsParentModalVisible(false);
        // Set the selected parent in the main form
        form.setFieldsValue({
            selectedParentId: selectedParent.id,
            selectedParentName: selectedParent.fullName,
        });
    };

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
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingStudent(null);
        form.resetFields();
        setSelectedParent(null);
        setIsModalVisible(true);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        form.setFieldsValue({
            studentCode: student.studentCode,
            name: student.name,
            email: student.email,
            dateOfBirth: dayjs(student.dateOfBirth),
            gender: student.gender,
            grade: Number(student.grade),
            class: student.class,
        });
        setSelectedParent(null);
        setIsModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Get parent data from selected parent
            let parentData = {};
            if (values.selectedParentId) {
                parentData.parentId = values.selectedParentId;
            }

            const formattedValues = editingStudent
                ? {
                      studentCode: values.studentCode,
                      fullName: values.name,
                      email: values.email,
                      phone: values.emergencyPhone,
                      password: "defaultPassword123",
                      dateOfBirth: values.dateOfBirth.toISOString(),
                      gender: values.gender,
                      grade: parseInt(values.grade),
                      class: values.class,
                      ...parentData,
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
                      ...parentData,
                  };

            if (editingStudent) {
                // Update student
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

                    const updateValues = {
                        studentCode: values.studentCode,
                        fullName: values.name,
                        email: values.email,
                        phone: values.emergencyPhone,
                        dateOfBirth: values.dateOfBirth.toISOString(),
                        gender: values.gender,
                        grade: parseInt(values.grade),
                        class: values.class,
                        ...parentData,
                    };

                    await axios.put(
                        `/api/admin/${editingStudent.id}`,
                        updateValues,
                        {
                            headers: {
                                Authorization: `Bearer ${authToken}`,
                            },
                        }
                    );
                    message.success("Cập nhật học sinh thành công");
                    fetchStudents();
                    fetchParents(); // Refresh parents list in case new parent was created
                } catch (error) {
                    message.error(
                        error.response?.data?.error ||
                            "Không thể cập nhật học sinh"
                    );
                    console.error("Lỗi khi cập nhật học sinh:", error);
                } finally {
                    setLoading(false);
                }
            } else {
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

                    await axios.post("/api/admin", formattedValues, {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    });

                    message.success("Thêm học sinh thành công");
                    fetchStudents();
                    fetchParents(); // Refresh parents list in case new parent was created
                } catch (error) {
                    message.error(
                        error.response?.data?.error || "Không thể thêm học sinh"
                    );
                    console.error("Lỗi khi thêm học sinh:", error);
                } finally {
                    setLoading(false);
                }
            }
            setIsModalVisible(false);
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
            // Call deleteUser endpoint for students
            await axios.delete(`/api/admin/${studentId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            message.success("Xóa học sinh thành công");
            fetchStudents(); // Refresh data after deletion
        } catch (error) {
            message.error(
                error.response?.data?.error || "Không thể xóa học sinh"
            );
            console.error("Lỗi khi xóa học sinh:", error);
        } finally {
            setTableLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý học sinh</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Thêm học sinh
                </Button>
            </div>

            <Card>
                <Form
                    form={searchForm}
                    onFinish={handleSearch}
                    layout="vertical"
                >
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
                title={
                    editingStudent
                        ? "Sửa thông tin học sinh"
                        : "Thêm học sinh mới"
                }
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => setIsModalVisible(false)}
                okText={editingStudent ? "Cập nhật" : "Thêm"}
                confirmLoading={loading}
            >
                <Spin spinning={loading}>
                    <Form form={form} layout="vertical">
                        {editingStudent && (
                            <Form.Item
                                name="studentCode"
                                label="Mã học sinh"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập mã học sinh!",
                                    },
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                        )}
                        <Form.Item
                            name="name"
                            label="Họ và tên"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập họ và tên!",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
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
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="dateOfBirth"
                            label="Ngày sinh"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn ngày sinh!",
                                },
                                {
                                    validator(_, value) {
                                        if (!value) return Promise.resolve();
                                        const today = new Date();
                                        const year = today.getFullYear();
                                        const minYear = year - 13; // lớn nhất 13 tuổi
                                        const maxYear = year - 6; // nhỏ nhất 6 tuổi
                                        const dobYear = value.year();
                                        if (
                                            dobYear < minYear ||
                                            dobYear > maxYear
                                        ) {
                                            return Promise.reject(
                                                new Error(
                                                    "Năm sinh không hợp lệ với học sinh tiểu học"
                                                )
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
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
                            <Select>
                                <Option value="male">Nam</Option>
                                <Option value="female">Nữ</Option>
                            </Select>
                        </Form.Item>
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
                            <Select>
                                <Option value="1">1</Option>
                                <Option value="2">2</Option>
                                <Option value="3">3</Option>
                                <Option value="4">4</Option>
                                <Option value="5">5</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="class"
                            label="Lớp"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập lớp!",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const grade = getFieldValue("grade");
                                        if (!grade || !value)
                                            return Promise.resolve();
                                        const regex = new RegExp(
                                            `^${grade}[A-E]$`
                                        );
                                        if (!regex.test(value)) {
                                            return Promise.reject(
                                                new Error(
                                                    "Lớp phải có định dạng: [Khối][Chữ cái A-E] (VD: 1A, 2B, 3C)"
                                                )
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="selectedParentId"
                            label="Phụ huynh"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn phụ huynh!",
                                },
                            ]}
                        >
                            <Input type="hidden" />
                        </Form.Item>

                        <Form.Item label="Chọn phụ huynh">
                            <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                            >
                                <Button
                                    type="dashed"
                                    onClick={handleOpenParentModal}
                                    style={{ width: "100%" }}
                                >
                                    {selectedParent
                                        ? `Đã chọn: ${selectedParent.fullName}`
                                        : "Chọn hoặc tạo phụ huynh"}
                                </Button>
                                {selectedParent && (
                                    <div
                                        style={{
                                            padding: "8px",
                                            background: "#f5f5f5",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        <div>
                                            <strong>Tên:</strong>{" "}
                                            {selectedParent.fullName}
                                        </div>
                                        <div>
                                            <strong>Email:</strong>{" "}
                                            {selectedParent.email}
                                        </div>
                                        <div>
                                            <strong>SĐT:</strong>{" "}
                                            {selectedParent.phone}
                                        </div>
                                    </div>
                                )}
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>

            {/* Parent Selection Modal */}
            <Modal
                title="Chọn hoặc tạo phụ huynh"
                open={isParentModalVisible}
                onCancel={() => setIsParentModalVisible(false)}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setIsParentModalVisible(false)}
                    >
                        Hủy
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        onClick={handleConfirmParent}
                        disabled={!selectedParent}
                    >
                        Xác nhận
                    </Button>,
                ]}
                width={800}
            >
                <div style={{ marginBottom: 16 }}>
                    <h4>Chọn phụ huynh hiện có:</h4>
                    <Input.Search
                        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                        value={parentSearchTerm}
                        onChange={(e) => setParentSearchTerm(e.target.value)}
                        style={{ marginBottom: 12 }}
                        allowClear
                    />
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Chọn phụ huynh từ danh sách"
                        loading={parentLoading}
                        onChange={handleParentSelection}
                        value={selectedParent?.id}
                        showSearch={false}
                    >
                        {filteredParents.length > 0 ? (
                            filteredParents.map((parent) => (
                                <Option key={parent.id} value={parent.id}>
                                    {parent.fullName} - {parent.email} -{" "}
                                    {parent.phone}
                                </Option>
                            ))
                        ) : (
                            <Option disabled value="">
                                {parentSearchTerm
                                    ? "Không tìm thấy phụ huynh phù hợp"
                                    : "Không có phụ huynh nào"}
                            </Option>
                        )}
                    </Select>
                    {parentSearchTerm && (
                        <div
                            style={{
                                marginTop: 8,
                                fontSize: "12px",
                                color: "#666",
                            }}
                        >
                            Tìm thấy {filteredParents.length} phụ huynh phù hợp
                        </div>
                    )}
                </div>

                <Divider>Hoặc</Divider>

                <div>
                    <h4>Tạo phụ huynh mới:</h4>
                    <Form form={parentForm} layout="vertical">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="newParentName"
                                    label="Tên phụ huynh"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng nhập tên phụ huynh!",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập tên phụ huynh" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="newParentEmail"
                                    label="Email phụ huynh"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng nhập email phụ huynh!",
                                        },
                                        {
                                            type: "email",
                                            message: "Email không hợp lệ!",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập email phụ huynh" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="newParentPhone"
                                    label="Số điện thoại"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng nhập số điện thoại!",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập số điện thoại" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Button
                            type="primary"
                            onClick={handleCreateNewParent}
                            loading={parentModalLoading}
                        >
                            Tạo phụ huynh mới
                        </Button>
                    </Form>
                </div>

                {selectedParent && (
                    <div
                        style={{
                            marginTop: 16,
                            padding: 12,
                            background: "#e6f7ff",
                            borderRadius: 4,
                        }}
                    >
                        <h4>Phụ huynh đã chọn:</h4>
                        <p>
                            <strong>Tên:</strong> {selectedParent.fullName}
                        </p>
                        <p>
                            <strong>Email:</strong> {selectedParent.email}
                        </p>
                        <p>
                            <strong>Số điện thoại:</strong>{" "}
                            {selectedParent.phone}
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentManagement;
