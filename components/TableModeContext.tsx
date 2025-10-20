"use client";

import { createContext, useState } from "react";

interface TableModeContextType {
  tableMode: boolean;
  setTableMode: (mode: boolean) => void;
}

export const TableContext = createContext<TableModeContextType | undefined>(
  undefined
);

function TableModeContext({ children }: { children: React.ReactNode }) {
  const [tableMode, setTableMode] = useState(true);

  return (
    <TableContext.Provider value={{ tableMode, setTableMode }}>
      {children}
    </TableContext.Provider>
  );
}

export default TableModeContext;
