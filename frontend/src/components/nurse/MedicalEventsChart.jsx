import React from "react";
import { Column } from "@ant-design/charts";

const data = [
    { thang: "1", suco: 3 },
    { thang: "2", suco: 5 },
    { thang: "3", suco: 2 },
    { thang: "4", suco: 6 },
    { thang: "5", suco: 4 },
    { thang: "6", suco: 7 },
    { thang: "7", suco: 1 },
    { thang: "8", suco: 0 },
    { thang: "9", suco: 3 },
    { thang: "10", suco: 2 },
    { thang: "11", suco: 4 },
    { thang: "12", suco: 5 },
];

const config = {
    data,
    xField: "thang",
    yField: "suco",
    label: {
        position: "middle",
        style: {
            fill: "#fff",
            opacity: 0.6,
        },
    },
    xAxis: {
        title: { text: "Tháng" },
    },
    yAxis: {
        title: { text: "Số sự cố" },
        minInterval: 1,
    },
    color: "#1890ff",
    columnWidthRatio: 0.6,
    height: 300,
    tooltip: {
        formatter: (datum) => ({ name: "Số sự cố", value: datum.suco }),
    },
};

const MedicalEventsChart = () => (
    <div>
        <h3 className="font-semibold mb-2">Biểu đồ sự cố y tế theo tháng</h3>
        <Column {...config} />
    </div>
);

export default MedicalEventsChart;
