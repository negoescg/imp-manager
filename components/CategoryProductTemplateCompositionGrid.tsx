'use client';
import React, { useEffect, useState } from 'react';
import DataGrid, { Column, Paging, Pager, Editing, Lookup, RequiredRule } from 'devextreme-react/data-grid';
import { useQuery } from '@tanstack/react-query';
import { getInventoryItems } from '@/server/actions/inventory.actions';
import CustomStore from 'devextreme/data/custom_store';
import {
  addTemplateComposition,
  deleteTemplateComposition,
  getCategoryTemplate,
  updateTemplateComposition,
} from '@/server/actions/category.actions';

type Props = {
  itemId: number;
};
const CategoryProductTemplateCompositionGrid = ({ itemId }: Props) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categoryTemplate', itemId],
    queryFn: async () => getCategoryTemplate(itemId),
    enabled: !!itemId,
  });

  const { data: inventoryItems } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => getInventoryItems(),
  });

  const [compositionData, setCompositionData] = useState(new CustomStore());
  useEffect(() => {
    setCompositionData(
      new CustomStore({
        key: 'id',
        load: async () => data ?? [],
        insert: async (values) => addTemplateComposition(values, itemId).finally(refetch),
        update: async (key, values) => updateTemplateComposition(key, values).finally(refetch),
        remove: async (key) => deleteTemplateComposition(key).finally(refetch),
      }),
    );
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory items</div>;
  return (
    <DataGrid
      dataSource={compositionData}
      keyExpr="id"
      showColumnLines={true}
      showRowLines={true}
      showBorders={true}
      rowAlternationEnabled={true}
      columnAutoWidth={true}
      searchPanel={{ visible: true, width: 240, placeholder: 'Search...' }}>
      <Editing
        refreshMode="reshape"
        mode="row"
        allowUpdating={true}
        allowAdding={true}
        allowDeleting={true}
        useIcons={true}
        newRowPosition="first"
      />
      <Paging enabled={true} defaultPageSize={3} />
      <Pager
        visible={true}
        showPageSizeSelector={true}
        allowedPageSizes={[3, 10, 20]}
        showNavigationButtons={true}
        showInfo={true}
      />
      <Column dataField="item_id" caption="Material">
        <RequiredRule message="Material is required" />
        <Lookup
          dataSource={inventoryItems?.map((um) => ({
            item_id: um.item_id,
            text: um.item_name,
          }))}
          valueExpr="item_id"
          displayExpr="text"
        />
      </Column>
      <Column dataField="quantity_required" caption="Quantity Required" dataType="number">
        <RequiredRule />
      </Column>
    </DataGrid>
  );
};

export default CategoryProductTemplateCompositionGrid;
