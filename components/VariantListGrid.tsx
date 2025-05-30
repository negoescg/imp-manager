import { VariantDetail } from '@/interfaces/list.interfaces';
import React, { useState } from 'react';
import DataGrid, { Column, Editing } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import { updateProductionListItem } from '@/server/actions/production.actions';

type Props = {
  listId: number;
  variants: VariantDetail[];
  name: string;
  type: string;
  refetch: (variant, values, name, type) => void;
};

const VariantListGrid = ({ listId, variants, refetch, name, type }: Props) => {
  const [variantStore] = useState(
    new CustomStore({
      key: 'id',
      load: async () => variants ?? [],
      update: async (key, values) =>
        updateProductionListItem(key, values).finally(() =>
          refetch(
            variants.find((x) => x.id == key),
            values,
            name,
            type,
          ),
        ),
    }),
  );
  return (
    <DataGrid
      dataSource={variantStore}
      keyExpr="id"
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
      <Column dataField="description" caption="Description" allowEditing={false} />
      <Column dataField="required" caption="Required" dataType="number" />
      <Column dataField="completed" caption="Completed" dataType="number" />
      <Column dataField="took_from_stock" caption="Took From Stock" dataType="number" />
    </DataGrid>
  );
};

export default VariantListGrid;
