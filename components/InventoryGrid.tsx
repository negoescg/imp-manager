'use client';
import React, { useState } from 'react';
import DataGrid, {
  Column,
  Paging,
  Pager,
  Editing,
  Lookup,
  RequiredRule,
  CustomRule,
  MasterDetail,
  Selection,
  DataGridTypes,
} from 'devextreme-react/data-grid';
import { useQuery } from '@tanstack/react-query';
import {
  addInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  getItemTypes,
  getUnitOfMeasure,
  updateInventoryItem,
} from '@/server/actions/inventory.actions';
import CustomStore from 'devextreme/data/custom_store';
import Link from 'next/link';
import InventoryTransactionGrid from './InventoryTransactionGrid';

const InventoryGrid = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => getInventoryItems(),
  });

  const { data: itemTypes } = useQuery({
    queryKey: ['itemType'],
    queryFn: async () => getItemTypes(),
  });
  const { data: unitOfMeasure } = useQuery({
    queryKey: ['measure'],
    queryFn: async () => getUnitOfMeasure(),
  });

  const [inventoryData] = useState(
    new CustomStore({
      key: 'item_id',
      load: async () => data ?? [],
      insert: async (values) => addInventoryItem(values).finally(refetch),
      update: async (key, values) => updateInventoryItem(key, values).finally(refetch),
      remove: async (key) => deleteInventoryItem(key).finally(refetch),
    }),
  );

  const handleUniqueNameValidation = (options) => {
    const itemId = options.data?.item_id ?? 0;

    if (itemId === 0 || !itemId) {
      return !data?.some((item) => item.item_name === options.value);
    }

    return !data?.some((item) => item.item_id !== itemId && item.item_name === options.value);
  };

  const onSelectionChanged = (e: DataGridTypes.SelectionChangedEvent) => {
    e.component.collapseAll(-1);
    e.component.expandRow(e.currentSelectedRowKeys[0]);
  };

  const renderDetail = (props: DataGridTypes.MasterDetailTemplateData) => {
    const { item_id } = props.data;
    return <InventoryTransactionGrid itemId={item_id} />;
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory items</div>;

  return (
    <DataGrid
      dataSource={inventoryData}
      keyExpr="item_id"
      onInitNewRow={(e) => {
        e.data.date_created = new Date();
      }}
      onRowValidating={(e) => {
        console.log('validating', e);
        if (e.newData.item_type_id === 2 && (!e.newData.item_sku || e.newData.item_sku.trim() === '')) {
          e.isValid = false;
          e.errorText = 'SKU is required for this item type.';
        }
      }}
      onSelectionChanged={onSelectionChanged}
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
      <Paging enabled={true} defaultPageSize={10} />
      <Pager
        visible={true}
        showPageSizeSelector={true}
        allowedPageSizes={[10, 15, 20]}
        showNavigationButtons={true}
        showInfo={true}
      />
      <Column dataField="item_name" caption="Name">
        <RequiredRule />
        <CustomRule validationCallback={handleUniqueNameValidation} message="Name must be unique" />
      </Column>
      {/* <Column dataField="item_description" caption="Description" /> */}
      <Column dataField="item_sku" caption="SKU"></Column>
      <Column dataField="quantity" caption="Quantity" allowEditing={false} />
      <Column
        dataField="date_created"
        caption="Date Created"
        dataType="date"
        allowEditing={false}
        sortOrder="desc"
        sortIndex={0}
      />
      <Column dataField="item_type_id" caption="Type">
        <RequiredRule message="Type is required" />
        <Lookup
          dataSource={itemTypes?.map((it) => ({ item_type_id: it.type_id, text: it.type_name }))}
          valueExpr="item_type_id"
          displayExpr="text"
        />
      </Column>

      <Column dataField="unit_of_measure_id" caption="Unit Of Measure">
        <RequiredRule message="Unit of Measure is required" />
        <Lookup
          dataSource={unitOfMeasure?.map((um) => ({ unit_of_measure_id: um.unit_id, text: um.unit_name }))}
          valueExpr="unit_of_measure_id"
          displayExpr="text"
        />
      </Column>
      <Column
        dataField="item_id"
        caption="Action"
        allowEditing={false}
        cellRender={(cellData) => {
          if (!cellData.value) {
            return <span></span>;
          } else {
            return (
              <Link href={`/inventory/${cellData.value}`} title="history">
                History
              </Link>
            );
          }
        }}
      />
      <Selection mode="single" />
      <MasterDetail enabled={false} render={renderDetail} />
    </DataGrid>
  );
};

export default InventoryGrid;
