import { useContext } from "react";
import { TableContext } from "@/components/TableModeContext";

function useTableMode() {
  const context = useContext(TableContext);

  if (!context) {
    throw Error(
      "useTableMode must be used within a TableMode Context Provider."
    );
  }

  return context;
}

export { useTableMode };
