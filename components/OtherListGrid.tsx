import { ProductDetail } from '@/interfaces/list.interfaces';
import DataGrid, { Column, DataGridTypes, Export, Editing } from 'devextreme-react/data-grid';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import CustomStore from 'devextreme/data/custom_store';
import { useState } from 'react';
import { updateProductionListItem } from '@/server/actions/production.actions';

type Props = {
  id: number;
  products: ProductDetail[];
};

const OtherListGrid = ({ id, products }: Props) => {
  const processData = (products: ProductDetail[]) => {
    return products.map((product) => {
      const variantQuantities = {
        id: 0,
        sku: '',
        name: '',
        type: '',
        required: 0,
        completed: 0,
        took_from_stock: 0,
      };
      product.variants?.forEach((variant) => {
        variantQuantities.sku = variant.sku ?? '';
        variantQuantities.type = variant.type ?? '';
        variantQuantities.id = variant.id ?? '';
        variantQuantities.required = variant.required ?? '';
        variantQuantities.took_from_stock = variant.took_from_stock ?? '';
        variantQuantities.completed = variant.completed ?? '';
      });

      variantQuantities.name = product.name;
      return {
        ...variantQuantities,
      };
    });
  };

  const [variantStore] = useState(
    new CustomStore({
      key: 'id',
      load: async () => processData(products) ?? [],
      update: async (key, values) => updateProductionListItem(key, values).finally(() => console.warn('update')),
    }),
  );

  const onExporting = (e: DataGridTypes.ExportingEvent) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');

    exportDataGrid({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Others.xlsx');
      });
    });
  };

  return (
    <DataGrid
      dataSource={variantStore}
      onExporting={onExporting}
      showBorders={true}
      showColumnLines={true}
      showRowLines={true}
      rowAlternationEnabled={true}>
      <Editing
        refreshMode="reshape"
        mode="row"
        allowUpdating={true}
        allowAdding={false}
        allowDeleting={false}
        useIcons={true}
        newRowPosition="first"
      />
      <Column dataField="sku" caption="SKU" allowEditing={false} />
      <Column dataField="name" caption="Name" allowEditing={false} />
      <Column dataField="type" caption="Type" allowEditing={false} />
      <Column dataField="required" caption="Required" dataType="number" />
      <Column dataField="completed" caption="Completed" dataType="number" />
      <Column dataField="took_from_stock" caption="Took From Stock" dataType="number" />
      <Export enabled={true} />
    </DataGrid>
  );
};

export default OtherListGrid;
