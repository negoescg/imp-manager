'use client';
import React, { useEffect, useState } from 'react';
import DataGrid, { Column, Paging, Pager, Editing, Lookup, RequiredRule, CustomRule } from 'devextreme-react/data-grid';
import { useQuery } from '@tanstack/react-query';
import { getInventoryItems } from '@/server/actions/inventory.actions';
import CustomStore from 'devextreme/data/custom_store';
import {
  addProductComposition,
  deleteProductComposition,
  getProductComposition,
  updateProductComposition,
} from '@/server/actions/product.actions';

type Props = {
  itemId: number;
};
const ProductCompositionGrid = ({ itemId }: Props) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['productComposition', itemId],
    queryFn: async () => getProductComposition(itemId),
    enabled: !!itemId,
  });

  const { data: inventoryItems } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => getInventoryItems(),
  });

  const handleUniqueMaterialValidation = (options) => {
    const itemId = options.data?.composition_id ?? 0;

    if (itemId === 0 || !itemId) {
      return !data?.some((item) => item.item_id === options.value);
    }

    return !data?.some((item) => item.composition_id !== itemId && item.item_id === options.value);
  };

  const [compositionData, setCompositionData] = useState(new CustomStore());
  useEffect(() => {
    setCompositionData(
      new CustomStore({
        key: 'composition_id',
        load: async () => data ?? [],
        insert: async (values) => addProductComposition(values, itemId).finally(refetch),
        update: async (key, values) => updateProductComposition(key, values, itemId).finally(refetch),
        remove: async (key) => deleteProductComposition(key, itemId).finally(refetch),
      }),
    );
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory items</div>;
  return (
    <DataGrid
      dataSource={compositionData}
      keyExpr="composition_id"
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
        <CustomRule
          validationCallback={handleUniqueMaterialValidation}
          message="Material already added to composition"
        />
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

export default ProductCompositionGrid;
