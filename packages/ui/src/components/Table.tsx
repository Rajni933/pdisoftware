import React from 'react';
import { StatusRail, StatusRailVariant } from './StatusRail';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto border border-line rounded-panel bg-surface">
      <table className="w-full text-left border-collapse tnum" {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead className={`border-b border-line bg-canvas ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-line text-sm ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  status?: StatusRailVariant;
  children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({
  status,
  children,
  className = '',
  ...props
}) => {
  return (
    <tr
      className={`relative h-11 hover:bg-surface-hover transition-colors group ${className}`}
      {...props}
    >
      {status ? (
        <td className="relative p-0 w-0">
          <StatusRail status={status} />
        </td>
      ) : null}
      {children}
    </tr>
  );
};

export interface TableCellHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  isNumeric?: boolean;
}

export const TableCellHead: React.FC<TableCellHeadProps> = ({
  children,
  isNumeric = false,
  className = '',
  ...props
}) => {
  return (
    <th
      className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-accent border-b border-line ${
        isNumeric ? 'text-right' : 'text-left'
      } ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  isNumeric?: boolean;
  isMono?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  isNumeric = false,
  isMono = false,
  className = '',
  ...props
}) => {
  return (
    <td
      className={`px-3 py-2 text-sm text-ink-2 ${isNumeric ? 'text-right tabular-nums' : 'text-left'} ${
        isMono ? 'font-mono text-ink' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};
