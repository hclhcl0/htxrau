'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, ChevronsLeft, ChevronsRight } from 'lucide-react';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function isNumericCell(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  const str = String(value).replace(/[,.\s]/g, '').replace(/[₫đ]/gi, '');
  return !isNaN(Number(str)) && str.length > 0;
}

function isMoneyColumn(headerStr: string): boolean {
  if (!headerStr) return false;
  const h = String(headerStr).toLowerCase();
  return h.includes('giá') || h.includes('tiền') || h.includes('phí') || h.includes('mức thu') || h.includes('price') || h.includes('chi phí');
}

function formatCell(value: any, isMoney?: boolean): string {
  if (value === null || value === undefined) return '';
  
  if (isMoney) {
    const str = String(value).replace(/[,.\s]/g, '').replace(/[₫đ]/gi, '');
    const num = Number(str);
    if (!isNaN(num) && str.length > 0) {
      return new Intl.NumberFormat('vi-VN').format(num);
    }
  }
  
  return String(value);
}

// ─────────────────────────────────────────────
// Pagination Controls
// ─────────────────────────────────────────────
function PaginationBar({
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  startRow,
  endRow,
  onPageChange,
  onRowsPerPageChange,
  fileUrl,
  fileName,
}: {
  currentPage: number;
  totalPages: number;
  totalRows: number;
  rowsPerPage: number | 'all';
  startRow: number;
  endRow: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (v: number | 'all') => void;
  fileUrl?: string;
  fileName?: string;
}) {
  const pageSizes = [10, 20, 50, 'all'] as const;

  // Generate page numbers with ellipsis
  const pages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const result: (number | '...')[] = [];
    result.push(1);
    if (currentPage > 3) result.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      result.push(i);
    }
    if (currentPage < totalPages - 2) result.push('...');
    result.push(totalPages);
    return result;
  }, [currentPage, totalPages]);

  return (
    <div className="mt-3 py-3 flex flex-col gap-3">
      {/* Row 1: info + page controls */}
      {rowsPerPage !== 'all' && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Info */}
          <span className="text-xs text-gray-500 shrink-0">
            Hiển thị <span className="font-semibold text-gray-700">{startRow}–{endRow}</span> trong{' '}
            <span className="font-semibold text-gray-700">{totalRows}</span> dòng
          </span>

          {/* Page buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Trang đầu"
            >
              <ChevronsLeft size={13} />
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Trang trước"
            >
              <ChevronLeft size={13} />
            </button>

            {pages.map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-semibold border transition-all ${
                    currentPage === p
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/40'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Trang sau"
            >
              <ChevronRight size={13} />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Trang cuối"
            >
              <ChevronsRight size={13} />
            </button>
          </div>

          {/* Rows per page */}
          <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
            <span>Hiển thị:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                const v = e.target.value;
                onRowsPerPageChange(v === 'all' ? 'all' : Number(v));
              }}
              className="border border-gray-200 rounded-md px-2 py-1 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/40 cursor-pointer"
            >
              {pageSizes.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'Tất cả' : `${s} dòng`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Row 2: download button */}
      {fileUrl && (
        <div className="flex justify-center">
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-transparent border border-emerald-600 !text-emerald-600 hover:bg-emerald-50 hover:!text-emerald-700 active:scale-95 !no-underline text-sm font-semibold transition-all"
          >
            <Download size={15} />
            Tải về file {fileName?.split('.').pop()?.toUpperCase() ?? 'Excel'}
          </a>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Table View
// ─────────────────────────────────────────────
function TableView({ headers, rows, startIndex }: { headers: string[]; rows: any[][]; startIndex: number }) {
  return (
    <div className="overflow-x-auto">
      {/* Mobile scroll hint */}
      {headers.length > 4 && (
        <p className="sm:hidden text-center text-[10px] text-gray-400 py-1 flex items-center justify-center gap-1">
          <ChevronLeft size={11} />
          Vuốt ngang để xem thêm
          <ChevronRight size={11} />
        </p>
      )}
      <table className="w-full text-left border-collapse !m-0 !border-0">
        <thead>
          <tr style={{ background: 'linear-gradient(90deg, var(--primary), var(--primary-dark, var(--primary)))' }}>
            <th className="!px-2 !py-1.5 !text-white font-bold text-[11px] text-center w-8 shrink-0 !border-t-0 !border-b-0 !border-l-0 !border-r !border-r-white/20 !bg-transparent">
              #
            </th>
            {headers.map((h, idx) => {
              const isMoney = isMoneyColumn(h);
              return (
              <th
                key={idx}
                scope="col"
                className={`!px-3 !py-1.5 !text-white font-bold text-[12px] whitespace-nowrap !border-t-0 !border-b-0 !border-l-0 !border-r !border-r-white/20 last:!border-r-0 !bg-transparent capitalize leading-snug ${isMoney ? '!text-right' : ''}`}
              >
                {h}
              </th>
            )})}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={`!border-b !border-gray-100 last:!border-b-0 transition-colors group ${
                rowIdx % 2 === 0 ? '!bg-white' : '!bg-[var(--primary)]/[0.03]'
              } hover:!bg-[var(--primary)]/[0.07]`}
            >
              {/* Row number */}
              <td className="px-2 py-2 text-center text-[11px] text-gray-400 font-medium !border-t-0 !border-b-0 !border-l-0 !border-r !border-r-gray-100 w-8 !bg-transparent">
                {startIndex + rowIdx}
              </td>
              {headers.map((_, cellIdx) => {
                const cell = row[cellIdx];
                const headerName = headers[cellIdx];
                const isMoney = isMoneyColumn(headerName);
                const numeric = isNumericCell(cell);
                const isAlignRight = isMoney || numeric;
                const isFirstCol = cellIdx === 0;
                return (
                  <td
                    key={cellIdx}
                    className={`px-3 py-2 text-[12.5px] !border-t-0 !border-b-0 !border-l-0 !border-r !border-r-gray-100 last:!border-r-0 leading-snug break-words !bg-transparent ${
                      isFirstCol
                        ? 'font-semibold !text-gray-800'
                        : isAlignRight
                        ? `!text-right ${numeric ? 'font-semibold !text-[var(--primary)] tabular-nums' : '!text-gray-700'}`
                        : '!text-gray-700'
                    }`}
                    style={{ minWidth: isFirstCol ? '150px' : undefined }}
                  >
                    {formatCell(cell, isMoney)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// Card View
// ─────────────────────────────────────────────
function CardView({ headers, rows, startIndex }: { headers: string[]; rows: any[][]; startIndex: number }) {
  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rows.map((row, rowIdx) => {
        const cardTitle = formatCell(row[0]) || `Mục ${startIndex + rowIdx}`;
        const rest = row.slice(1);
        return (
          <div
            key={rowIdx}
            className="relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[var(--primary)]/40 transition-all overflow-hidden flex flex-col"
          >
            {/* Accent strip */}
            <div className="h-1 w-full" style={{ background: 'var(--primary)' }} />

            {/* Row number badge */}
            <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold flex items-center justify-center">
              {startIndex + rowIdx}
            </span>

            {/* Card header */}
            <div className="px-3 py-2.5 bg-[var(--primary)]/[0.05] border-b border-[var(--primary)]/10">
              <h4 className="font-bold text-[13px] text-[var(--primary)] line-clamp-2 leading-snug pr-6 capitalize m-0">
                {cardTitle}
              </h4>
            </div>

            {/* Card body */}
            <div className="px-3 py-2 flex-1">
              <ul className="space-y-1 list-none p-0 m-0">
                {rest.map((cell, cellIdx) => {
                  if (cell === undefined || cell === null || cell === '') return null;
                  const label = headers[cellIdx + 1] ?? `Cột ${cellIdx + 2}`;
                  const isMoney = isMoneyColumn(label);
                  const numeric = isNumericCell(cell);
                  return (
                    <li key={cellIdx} className="flex justify-between items-start gap-2 py-0.5 border-b border-dashed border-gray-100 last:border-0">
                      <span className="text-gray-500 text-[11px] shrink-0 capitalize">{label}</span>
                      <span
                        className={`text-[12px] font-semibold text-right leading-tight ${
                          numeric ? 'text-[var(--primary)]' : 'text-gray-800'
                        }`}
                      >
                        {formatCell(cell, isMoney)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Client Component
// ─────────────────────────────────────────────
interface ExcelTableClientProps {
  headers: string[];
  rows: any[][];
  displayStyle?: 'table' | 'card';
  fileUrl?: string;
  fileName?: string;
}

export function ExcelTableClient({
  headers,
  rows,
  displayStyle = 'table',
  fileUrl,
  fileName,
}: ExcelTableClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(20);

  const totalRows = rows.length;
  const totalPages = rowsPerPage === 'all' ? 1 : Math.ceil(totalRows / rowsPerPage);

  const startIndex = rowsPerPage === 'all' ? 1 : (currentPage - 1) * rowsPerPage + 1;
  const endIndex = rowsPerPage === 'all' ? totalRows : Math.min(currentPage * rowsPerPage, totalRows);

  const visibleRows = useMemo(() => {
    if (rowsPerPage === 'all') return rows;
    return rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  }, [rows, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (v: number | 'all') => {
    setRowsPerPage(v);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Data view */}
      {displayStyle === 'card' ? (
        <CardView headers={headers} rows={visibleRows} startIndex={startIndex} />
      ) : (
        <TableView headers={headers} rows={visibleRows} startIndex={startIndex} />
      )}

      {/* Footer: pagination + download */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        startRow={startIndex}
        endRow={endIndex}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        fileUrl={fileUrl}
        fileName={fileName}
      />
    </>
  );
}
