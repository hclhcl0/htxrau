import React from 'react';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import { ExcelTableClient } from './ExcelTableClient';
import { getMediaUrl } from '@/lib/mediaUrl';

export async function ExcelTableServerBlock({
  title,
  file,
  sheetName,
  hasHeader,
  displayStyle = 'table',
  showDownload,
}: any) {
  if (!file || !file.filename) return null;

  let headers: string[] = [];
  let rows: any[][] = [];

  try {
    const filePath = path.join(process.cwd(), 'media', file.filename);
    let buffer: Buffer;

    if (fs.existsSync(filePath)) {
      buffer = await fs.promises.readFile(filePath);
    } else if (file.url) {
      const downloadUrl = file.url.startsWith('http') ? file.url : `http://127.0.0.1:${process.env.PORT || 3000}${file.url}`;
      const res = await fetch(downloadUrl);
      const arrayBuf = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
    } else {
      return null;
    }

    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheetToRead =
      sheetName && workbook.SheetNames.includes(sheetName)
        ? sheetName
        : workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetToRead];
    const tableData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!tableData || tableData.length === 0) return null;

    if (hasHeader && tableData.length > 0) {
      headers = tableData[0].map((h: any) => {
        const s = String(h ?? '');
        // If all caps, lowercase it
        const isAllCaps = s === s.toUpperCase() && /[A-Z]/i.test(s);
        return isAllCaps ? s.toLowerCase() : s;
      });
      rows = tableData.slice(1);
    } else {
      headers = tableData[0].map((_: any, i: number) => `Cột ${i + 1}`);
      rows = tableData;
    }
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return (
      <div className="my-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
        Không thể đọc được file Excel. Vui lòng kiểm tra lại định dạng file.
      </div>
    );
  }

  if (rows.length === 0) return null;

  return (
    <div className="!mt-0 mb-6 w-full max-w-full min-w-0 not-prose">
      <ExcelTableClient
        headers={headers}
        rows={rows}
        displayStyle={displayStyle}
        fileUrl={showDownload ? getMediaUrl(file, '') : undefined}
        fileName={file.filename}
      />
    </div>
  );
}
