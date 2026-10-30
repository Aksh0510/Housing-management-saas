import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: keyof T;
  header: ReactNode;
  render?: (row: T, rowIndex: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T | ((row: T, rowIndex: number) => string | number);
  caption?: string;
  emptyMessage?: string;
}

export default function Table<T>({
  columns,
  data,
  rowKey,
  caption,
  emptyMessage = 'No records to display.',
}: TableProps<T>) {
  if (columns.length === 0) {
    throw new Error('Table requires at least one column.');
  }

  const getRowKey = (row: T, rowIndex: number) =>
    typeof rowKey === 'function' ? rowKey(row, rowIndex) : String(row[rowKey]);

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="sticky top-0 bg-surface-light text-xs uppercase tracking-wide text-text-secondary">
          <tr>
            {columns.map((column, index) => (
              <th
                key={`${String(column.key)}-${index}`}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 font-semibold ${
                  column.align === 'right'
                    ? 'text-right'
                    : column.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                } ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-text-secondary">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex)} className="hover:bg-surface-light/70">
                {columns.map((column, columnIndex) => (
                  <td
                    key={`${String(column.key)}-${columnIndex}`}
                    className={`px-4 py-3 text-text ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    } ${column.className ?? ''}`}
                  >
                    {column.render
                      ? column.render(row, rowIndex)
                      : String(row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
