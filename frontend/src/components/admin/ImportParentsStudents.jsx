import React, { useState } from "react";
import {
    Button,
    Upload,
    message as antdMessage,
    Typography,
    Space,
    Alert,
    Modal,
    Table,
    Tooltip,
} from "antd";
import {
    UploadOutlined,
    FileExcelOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    MailOutlined,
    PhoneOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import axios from "axios";

const { Text } = Typography;

// Validate helpers
const validateEmail = (email) => /.+@.+\..+/.test(email);
const validatePhone = (phone) => /^\d{8,15}$/.test(phone || "");
const validateGender = (gender) =>
    ["Nam", "Nữ", "nam", "nữ", "male", "female"].includes(
        (gender || "").toLowerCase()
    );
const validateDate = (date) => !isNaN(new Date(date).getTime());

function validateRow(row) {
    const errors = [];
    if (!row.parentName) errors.push("Thiếu tên phụ huynh");
    // Sửa lại validate email phụ huynh: kiểm tra đúng trường và loại bỏ khoảng trắng
    if (!row.parentEmail) errors.push("Thiếu email phụ huynh");
    else if (!validateEmail(row.parentEmail))
        errors.push("Email phụ huynh không hợp lệ");
    if (!row.parentPhone) errors.push("Thiếu SĐT phụ huynh");
    else if (!validatePhone(row.parentPhone))
        errors.push("SĐT phụ huynh không hợp lệ");
    if (!row.studentName) errors.push("Thiếu tên học sinh");
    if (!row.studentCode) errors.push("Thiếu mã học sinh");
    if (!row.studentEmail) errors.push("Thiếu email học sinh");
    else if (!validateEmail(row.studentEmail))
        errors.push("Email học sinh không hợp lệ");
    if (!row.studentGender) errors.push("Thiếu giới tính học sinh");
    else if (!validateGender(row.studentGender))
        errors.push("Giới tính học sinh không hợp lệ");
    if (!row.studentDOB) errors.push("Thiếu ngày sinh học sinh");
    else if (!validateDate(row.studentDOB))
        errors.push("Ngày sinh học sinh không hợp lệ");
    if (!row.studentClass) errors.push("Thiếu lớp học");
    if (!row.studentGrade) errors.push("Thiếu khối học");
    return errors;
}

// Hàm tìm key gần đúng theo tên cột (bỏ qua khoảng trắng, không phân biệt hoa thường)
function getColKey(row, colName) {
    return Object.keys(row).find(
        (k) =>
            k.replace(/\s/g, "").toLowerCase() ===
            colName.replace(/\s/g, "").toLowerCase()
    );
}

// Hàm làm sạch chuỗi: loại bỏ dấu phẩy, dấu cách, dấu /, ký tự xuống dòng ở đầu/cuối
function cleanString(str) {
    return String(str || "")
        .replace(/[\s,\/\n\r]+$/g, "") // Xóa ở cuối
        .replace(/^[\s,\/\n\r]+/g, "") // Xóa ở đầu
        .trim();
}

// Hàm chuyển số serial Excel thành chuỗi ngày yyyy-MM-dd
function excelDateToString(serial) {
    if (!serial || isNaN(serial)) return serial;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const day = String(date_info.getUTCDate()).padStart(2, "0");
    const month = String(date_info.getUTCMonth() + 1).padStart(2, "0");
    const year = date_info.getUTCFullYear();
    // Trả về yyyy-MM-dd để Date JS nhận diện đúng
    return `${year}-${month}-${day}`;
}

// Hàm chuẩn hóa chuỗi ngày về yyyy-MM-dd
function normalizeDateString(dateStr) {
    if (!dateStr) return "";
    // Nếu là số serial Excel
    if (!isNaN(dateStr) && typeof dateStr === "number") {
        return excelDateToString(dateStr);
    }
    // Nếu là chuỗi yyyy-MM-dd (đúng chuẩn)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Nếu là chuỗi dd/MM/yyyy hoặc MM/dd/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [d1, d2, y] = dateStr.split("/");
        // Nếu d1 > 12 thì chắc chắn là dd/MM/yyyy
        if (parseInt(d1, 10) > 12) {
            return `${y}-${d2.padStart(2, "0")}-${d1.padStart(2, "0")}`;
        }
        // Nếu d2 > 12 thì chắc chắn là MM/dd/yyyy
        if (parseInt(d2, 10) > 12) {
            return `${y}-${d1.padStart(2, "0")}-${d2.padStart(2, "0")}`;
        }
        // Mặc định coi là dd/MM/yyyy
        return `${y}-${d2.padStart(2, "0")}-${d1.padStart(2, "0")}`;
    }
    // Nếu là chuỗi khác, trả về như cũ
    return dateStr;
}

function ImportParentsStudents() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [validateLogs, setValidateLogs] = useState([]);
    const [detailModal, setDetailModal] = useState({ open: false, row: null });

    // Cải thiện UI/UX: Group header, căn giữa, màu sắc, icon, responsive
    const columns = [
        {
            title: "Mã HS",
            dataIndex: "studentCode",
            key: "studentCode",
            align: "center",
            width: 80,
        },
        {
            title: "Họ và tên",
            dataIndex: "studentName",
            key: "studentName",
            width: 140,
        },
        {
            title: "Lớp",
            dataIndex: "studentClass",
            key: "studentClass",
            align: "center",
            width: 70,
        },
        {
            title: "Tên PH",
            dataIndex: "parentName",
            key: "parentName",
            width: 120,
        },
        {
            title: <MailOutlined />,
            dataIndex: "parentEmail",
            key: "parentEmail",
            width: 150,
            render: (v) =>
                v && v.length > 18 ? (
                    <Tooltip title={v}>{v.slice(0, 15) + "..."}</Tooltip>
                ) : (
                    v
                ),
        },
        {
            title: <PhoneOutlined />,
            dataIndex: "parentPhone",
            key: "parentPhone",
            align: "center",
            width: 110,
        },
        {
            title: "Lỗi",
            dataIndex: "validateError",
            key: "validateError",
            width: 180,
            render: (text, record, idx) =>
                validateLogs[idx]?.length ? (
                    <Tooltip
                        title={
                            <div style={{ whiteSpace: "pre-line" }}>
                                {validateLogs[idx].join("\n")}
                            </div>
                        }
                        color="red"
                    >
                        <span
                            style={{
                                color: "#d4380d",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <ExclamationCircleOutlined
                                style={{ fontSize: 22, marginRight: 6 }}
                            />
                            {validateLogs[idx][0]}
                        </span>
                    </Tooltip>
                ) : (
                    <span
                        style={{
                            color: "#389e0d",
                            fontWeight: 600,
                            fontSize: 18,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        ✔
                    </span>
                ),
            align: "center",
        },
        {
            title: "",
            key: "detail",
            width: 60,
            render: (_, row) => (
                <Tooltip title="Xem chi tiết">
                    <Button
                        icon={<InfoCircleOutlined />}
                        size="small"
                        onClick={() => setDetailModal({ open: true, row })}
                    />
                </Tooltip>
            ),
            align: "center",
        },
    ];

    const handleChange = (info) => {
        setError("");
        setMessage("");
        if (info.file.status === "removed") {
            setFile(null);
            setPreviewData([]);
            setValidateLogs([]);
        } else if (
            info.file.status === "done" ||
            info.file.status === "uploading" ||
            info.file.status === "error"
        ) {
            setFile(info.file.originFileObj);
            // Đọc file Excel để preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet);
                // Mapping từ cột Excel mẫu sang key hệ thống, tự động nhận diện tên cột
                const mapped = json.map((row, idx) => {
                    // Lấy từng trường, nếu thiếu key thì gán rỗng
                    const getVal = (col) => {
                        const key = getColKey(row, col);
                        return typeof key !== "undefined" ? row[key] : "";
                    };
                    // Xử lý ngày sinh
                    let rawDOB = getVal("Ngày sinh");
                    let studentDOB = normalizeDateString(rawDOB);
                    const obj = {
                        parentName: cleanString(getVal("Tên phụ huynh")),
                        parentEmail: cleanString(getVal("Email phụ huynh")),
                        parentPhone: cleanString(getVal("SĐT phụ huynh")),
                        studentName: cleanString(getVal("Họ và tên")),
                        studentCode: cleanString(getVal("Mã học sinh")),
                        studentGender: cleanString(getVal("Giới tính")),
                        studentDOB,
                        studentClass: cleanString(getVal("Lớp")),
                        studentGrade: cleanString(getVal("Khối")),
                        studentEmail: cleanString(getVal("Email")),
                    };
                    if (Object.values(obj).every((v) => v === "")) {
                        console.log(
                            `Row ${idx} is empty or mapping failed. Row keys:`,
                            Object.keys(row)
                        );
                    }
                    return obj;
                });
                console.log("Mapped preview data:", mapped);
                setPreviewData(mapped);
                setValidateLogs(mapped.map(validateRow));
            };
            reader.readAsArrayBuffer(info.file.originFileObj);
        }
    };

    const beforeUpload = (file) => {
        const isExcel =
            file.type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "application/vnd.ms-excel";
        if (!isExcel) {
            antdMessage.error("Chỉ chấp nhận file Excel (.xlsx, .xls)");
        }
        return isExcel || Upload.LIST_IGNORE;
    };

    const handlePreview = () => {
        if (!previewData.length) {
            setError("Không có dữ liệu để xem trước!");
            return;
        }
        setModalOpen(true);
    };

    const handleImport = async () => {
        if (!file) {
            setError("Vui lòng chọn file Excel!");
            return;
        }
        setLoading(true);
        setError("");
        setMessage("");
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await axios.post(
                "/api/admin/import-parents-students",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            setMessage(
                res.data.message +
                    (res.data.count ? ` (${res.data.count} bản ghi)` : "")
            );
            if (res.data.errors && res.data.errors.length > 0) {
                setError(res.data.errors.join("\n"));
            }
            antdMessage.success("Import thành công!");
            setModalOpen(false);
            setFile(null);
            setPreviewData([]);
            setValidateLogs([]);
        } catch (err) {
            setError(err.response?.data?.error || "Import thất bại!");
            antdMessage.error("Import thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                border: "1px solid #eee",
                padding: 24,
                borderRadius: 8,
                maxWidth: 480,
                background: "#fafcff",
                marginBottom: 24,
            }}
        >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Text strong style={{ fontSize: 16 }}>
                    <FileExcelOutlined
                        style={{ color: "#52c41a", marginRight: 8 }}
                    />
                    Import phụ huynh & học sinh từ Excel
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                    Chọn file Excel mẫu (xlsx, xls) để thêm mới phụ huynh và học
                    sinh hàng loạt. <br />
                    <a href="/template_import_parents_students.xlsx" download>
                        {" "}
                        Tải file mẫu{" "}
                    </a>
                </Text>
                <Upload
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                    maxCount={1}
                    accept=".xlsx,.xls"
                    showUploadList={{ showRemoveIcon: true }}
                    fileList={file ? [{ name: file.name, status: "done" }] : []}
                    onRemove={() => {
                        setFile(null);
                        setPreviewData([]);
                        setValidateLogs([]);
                    }}
                >
                    <Button icon={<UploadOutlined />} disabled={loading}>
                        Chọn file Excel
                    </Button>
                </Upload>
                <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    disabled={!previewData.length}
                >
                    Xem trước dữ liệu
                </Button>
                <Modal
                    open={modalOpen}
                    title="Xác nhận dữ liệu import"
                    onCancel={() => setModalOpen(false)}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={() => setModalOpen(false)}
                        >
                            Hủy
                        </Button>,
                        <Button
                            key="import"
                            type="primary"
                            loading={loading}
                            onClick={handleImport}
                            disabled={validateLogs.some((e) => e.length)}
                        >
                            Xác nhận & Import
                        </Button>,
                    ]}
                    width={900}
                >
                    <Table
                        columns={columns}
                        dataSource={previewData.map((row, idx) => ({
                            ...row,
                            key: idx,
                        }))}
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: 900 }}
                        bordered
                        size="small"
                        rowClassName={(_, idx) =>
                            validateLogs[idx]?.length
                                ? "table-row-error"
                                : "table-row-ok"
                        }
                    />
                    <Alert
                        type="info"
                        message={
                            <span style={{ fontSize: 14 }}>
                                Chỉ những dòng{" "}
                                <b style={{ color: "#389e0d" }}>hợp lệ</b> mới
                                được import. Nếu có lỗi sẽ báo chi tiết sau khi
                                xác nhận.
                            </span>
                        }
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                </Modal>
                <Modal
                    open={detailModal.open}
                    title="Chi tiết dòng dữ liệu"
                    onCancel={() => setDetailModal({ open: false, row: null })}
                    footer={
                        <Button
                            onClick={() =>
                                setDetailModal({ open: false, row: null })
                            }
                        >
                            Đóng
                        </Button>
                    }
                    width={420}
                >
                    {detailModal.row && (
                        <div style={{ fontSize: 15 }}>
                            <b>Mã học sinh:</b> {detailModal.row.studentCode}
                            <br />
                            <b>Họ và tên:</b> {detailModal.row.studentName}
                            <br />
                            <b>Email học sinh:</b>{" "}
                            {detailModal.row.studentEmail}
                            <br />
                            <b>Ngày sinh:</b> {detailModal.row.studentDOB}
                            <br />
                            <b>Giới tính:</b> {detailModal.row.studentGender}
                            <br />
                            <b>Khối:</b> {detailModal.row.studentGrade}
                            <br />
                            <b>Lớp:</b> {detailModal.row.studentClass}
                            <br />
                            <b>Tên phụ huynh:</b> {detailModal.row.parentName}
                            <br />
                            <b>SĐT phụ huynh:</b> {detailModal.row.parentPhone}
                            <br />
                            <b>Email phụ huynh:</b>{" "}
                            {detailModal.row.parentEmail}
                            <br />
                        </div>
                    )}
                </Modal>
                {message && <Alert type="success" message={message} showIcon />}
                {error && <Alert type="error" message={error} showIcon />}
            </Space>
            <style>{`.table-row-error td { background: #fff1f0 !important; color: #d4380d !important; font-weight: 500; }
.table-row-ok td { background: #f6ffed !important; }
@media (max-width: 900px) {
  .ant-table { font-size: 12px; }
  .ant-modal { width: 98vw !important; }
}`}</style>
        </div>
    );
}

export default ImportParentsStudents;
