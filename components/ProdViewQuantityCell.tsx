import { DataGridTypes } from 'devextreme-react/cjs/data-grid';
import React from 'react';

const ProdViewQuantityCell = (cellData: DataGridTypes.ColumnCellTemplateData) => {
  return (
    cellData.value.sku && (
      <div className="flex w-full justify-between">
        <div className="w-1/3 bg-white flex justify-end">{cellData.value.required}</div>
        <div className="w-1/3 bg-blue-400 flex justify-end">{cellData.value.completed}</div>
        <div className="w-1/3 bg-red-400 flex justify-end">{cellData.value.stock}</div>
      </div>
    )
  );
};
export default ProdViewQuantityCell;
