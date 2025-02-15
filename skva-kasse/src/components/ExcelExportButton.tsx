import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface ExcelExportButtonProps {
  data: any[]; // Je nach Datenstruktur kannst du den Typ genauer definieren
  fileName: string;
  sheetName?: string;
}

const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
  data,
  fileName,
  sheetName = "Sheet1",
}) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, `${fileName}.xlsx`);
  };

  return (
    <button type="button" onClick={exportToExcel}>
      Export als Excel
    </button>
  );
};

export default ExcelExportButton;