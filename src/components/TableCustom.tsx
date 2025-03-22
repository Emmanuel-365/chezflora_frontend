import React from 'react';

interface TableCustomProps {
  children: React.ReactNode;
  className?: string;
}

export const TableCustom: React.FC<TableCustomProps> = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-lg border border-[#F5E8C7] ${className}`}>
      <table className="min-w-full divide-y divide-[#F5E8C7]">{children}</table>
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead className="bg-light-beige/50">
      <tr>{children}</tr>
    </thead>
  );
};

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, className = '' }) => {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-medium text-soft-brown uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody className="bg-[#F5F5F5] divide-y divide-[#F5E8C7]">{children}</tbody>;
};

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({ children, onClick, className = '' }) => {
  return (
    <tr
      className={`${onClick ? 'cursor-pointer hover:bg-light-beige/20' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-soft-brown ${className}`}>
      {children}
    </td>
  );
};