'use client';
import React, { useState } from 'react';
import DataGrid, { Column, Paging, Pager, Editing, RequiredRule, CustomRule } from 'devextreme-react/data-grid';
import { useQuery } from '@tanstack/react-query';
import CustomStore from 'devextreme/data/custom_store';

import {
  addProductionListItem,
  deleteProductionListItem,
  getProductionListItems,
  updateProductionListItem,
} from '@/server/actions/production.actions';
import ProductionView from './ProductionView';
import { Switch } from 'devextreme-react';

type Props = {
  itemId: number;
};
const ProductionListItemGrid = ({ itemId }: Props) => {
  const [toggleView, setToggleView] = useState(false);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['listItem', itemId],
    queryFn: async () => getProductionListItems(itemId),
    enabled: !!itemId,
  });

  const [listItems] = useState(
    new CustomStore({
      key: 'id',
      load: async () => data ?? [],
      insert: async (values) => addProductionListItem(values, itemId).finally(refetch),
      update: async (key, values) => updateProductionListItem(key, values).finally(refetch),
      remove: async (key) => deleteProductionListItem(key).finally(refetch),
    }),
  );
  const handleUniqueSkuValidation = (options) => {
    const itemId = options.data?.id ?? 0;
    console.log(itemId, options.value, data);
    if (itemId === 0 || !itemId) {
      return !data?.some((item) => item.sku === options.value);
    }

    return !data?.some((item) => item.id !== itemId && item.sku === options.value);
  };
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory items</div>;
  return (
    <>
      <div>
        <span style={{ marginRight: 10 }}>Production View:</span>
        <Switch value={toggleView} onValueChange={(value) => setToggleView(value)} stylingMode="filled" />
      </div>
      {toggleView ? (
        <ProductionView data={data} itemId={itemId} />
      ) : (
        <DataGrid
          dataSource={listItems}
          keyExpr="id"
          showColumnLines={true}
          showRowLines={true}
          showBorders={true}
          rowAlternationEnabled={true}
          columnAutoWidth={true}
          onInitNewRow={(e) => {
            e.data.completed = 0;
            e.data.took_from_stock = 0;
          }}
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
          <Paging enabled={true} defaultPageSize={10} />
          <Pager
            visible={true}
            showPageSizeSelector={true}
            allowedPageSizes={[10, 15, 20]}
            showNavigationButtons={true}
            showInfo={true}
          />
          <Column dataField="sku" caption="SKU">
            <RequiredRule />
            <CustomRule validationCallback={handleUniqueSkuValidation} message="SKU must be unique" />
          </Column>
          <Column dataField="name" caption="Name">
            <RequiredRule />
          </Column>
          <Column dataField="required" caption="Quantity Required" dataType="number">
            <RequiredRule />
          </Column>
          <Column dataField="completed" caption="Quantity Produced" dataType="number"></Column>
          <Column dataField="took_from_stock" caption="Took from Stock" dataType="number"></Column>
        </DataGrid>
      )}
    </>
  );
};

export default ProductionListItemGrid;
