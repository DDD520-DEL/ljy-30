import type { BorrowRecord, BorrowType, BorrowStatus } from '@/types';

const CSV_HEADERS = [
  'id',
  'type',
  'itemName',
  'itemEmoji',
  'itemId',
  'quantity',
  'roommateId',
  'roommateName',
  'roommateAvatar',
  'borrowDate',
  'expectedReturnDate',
  'actualReturnDate',
  'status',
  'note',
  'createdAt',
  'updatedAt',
];

function escapeCSV(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function unescapeCSV(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/""/g, '"');
  }
  return value;
}

export function recordsToCSV(records: BorrowRecord[]): string {
  const headerLine = CSV_HEADERS.join(',');
  const dataLines = records.map((record) =>
    CSV_HEADERS.map((header) => {
      const value = record[header as keyof BorrowRecord];
      return escapeCSV(value as string | number | boolean | undefined | null);
    }).join(',')
  );
  return [headerLine, ...dataLines].join('\r\n');
}

export function csvToRecords(csv: string): BorrowRecord[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const headerMap = new Map(headers.map((h, i) => [h, i]));

  const requiredFields = [
    'type',
    'itemName',
    'itemEmoji',
    'roommateId',
    'roommateName',
    'roommateAvatar',
    'borrowDate',
    'expectedReturnDate',
    'status',
  ];

  const missingRequired = requiredFields.filter((f) => !headerMap.has(f));
  if (missingRequired.length > 0) {
    throw new Error(`CSV 缺少必要字段: ${missingRequired.join(', ')}`);
  }

  const getField = (row: string[], field: string): string => {
    const idx = headerMap.get(field);
    if (idx === undefined || idx >= row.length) return '';
    return unescapeCSV(row[idx]);
  };

  const records: BorrowRecord[] = [];
  const now = new Date().toISOString();

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.every((cell) => cell.trim() === '')) continue;

    const type = getField(row, 'type') as BorrowType;
    if (type !== 'lend' && type !== 'borrow') {
      throw new Error(`第 ${i + 1} 行: type 必须是 'lend' 或 'borrow'`);
    }

    const status = getField(row, 'status') as BorrowStatus;
    if (status !== 'active' && status !== 'returned' && status !== 'overdue') {
      throw new Error(`第 ${i + 1} 行: status 必须是 'active'、'returned' 或 'overdue'`);
    }

    const quantityStr = getField(row, 'quantity');
    const quantity = quantityStr ? parseInt(quantityStr, 10) : undefined;

    const record: BorrowRecord = {
      id: getField(row, 'id') || '',
      type,
      itemName: getField(row, 'itemName'),
      itemEmoji: getField(row, 'itemEmoji'),
      itemId: getField(row, 'itemId') || undefined,
      quantity: isNaN(quantity as number) ? undefined : quantity,
      roommateId: getField(row, 'roommateId'),
      roommateName: getField(row, 'roommateName'),
      roommateAvatar: getField(row, 'roommateAvatar'),
      borrowDate: getField(row, 'borrowDate'),
      expectedReturnDate: getField(row, 'expectedReturnDate'),
      actualReturnDate: getField(row, 'actualReturnDate') || undefined,
      status,
      note: getField(row, 'note') || undefined,
      createdAt: getField(row, 'createdAt') || now,
      updatedAt: getField(row, 'updatedAt') || now,
    };

    records.push(record);
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);

  return result;
}

export function downloadCSV(content: string, filename: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDateForFilename(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}${m}${d}_${h}${min}`;
}
