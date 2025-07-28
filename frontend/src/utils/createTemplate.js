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
            "Năm học": "2020-2025",
            "Tên phụ huynh": "Nguyễn Văn B",
            "SĐT phụ huynh": "0912345678", // Cột đã được format thành text
            "Email phụ huynh": "parentA@email.com",
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

    // Format toàn bộ cột số điện thoại thành text
    const range = XLSX.utils.decode_range(ws["!ref"]);

    // Đặt format cho toàn bộ cột số điện thoại (cột 7)
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: 7 }); // Cột SĐT phụ huynh (index 7)
        if (ws[cellAddress]) {
            // Đặt format cho cell số điện thoại
            ws[cellAddress].t = "s"; // String type
            ws[cellAddress].z = "@"; // Text format
        }
    }

    // Thêm format cho cột số điện thoại trong sheet
    if (!ws["!cols"]) ws["!cols"] = [];
    if (!ws["!cols"][7]) ws["!cols"][7] = {};
    ws["!cols"][7].customWidth = true;
    ws["!cols"][7].width = 15;

    // Đặt format cho header cột số điện thoại
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: 7 });
    if (ws[headerCell]) {
        ws[headerCell].t = "s";
        ws[headerCell].z = "@";
    }

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
