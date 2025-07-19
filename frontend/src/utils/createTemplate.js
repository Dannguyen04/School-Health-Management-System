import * as XLSX from "xlsx";

export const createImportTemplate = () => {
    // Dữ liệu mẫu cho template
    const sampleData = [
        {
            "Họ và tên": "Nguyễn Văn A",
            "Ngày sinh": "14/05/2012",
            "Giới tính": "Nam",
            Khối: "1",
            Lớp: "1A",
            "Năm học": "2025-2030",
            "Tên phụ huynh": "Nguyễn Văn B",
            "SĐT phụ huynh": "0912345678",
            "Email phụ huynh": "parentA@email.com",
        },
        {
            "Họ và tên": "Trần Thị C",
            "Ngày sinh": "20/08/2013",
            "Giới tính": "Nữ",
            Khối: "5",
            Lớp: "5B",
            "Năm học": "2020-2025",
            "Tên phụ huynh": "Trần Văn D",
            "SĐT phụ huynh": "0987654321",
            "Email phụ huynh": "parentB@email.com",
        },
    ];

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Đặt độ rộng cột
    const colWidths = [
        { wch: 20 }, // Họ và tên
        { wch: 12 }, // Ngày sinh
        { wch: 10 }, // Giới tính
        { wch: 8 }, // Khối
        { wch: 8 }, // Lớp
        { wch: 12 }, // Năm học
        { wch: 20 }, // Tên phụ huynh
        { wch: 15 }, // SĐT phụ huynh
        { wch: 25 }, // Email phụ huynh
    ];
    ws["!cols"] = colWidths;

    // Thêm sheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, "Import Template");

    // Tạo file blob
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    // Tạo URL và download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_import_parents_students.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);
};
