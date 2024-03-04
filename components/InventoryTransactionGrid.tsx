'use client';
import React, { useState } from 'react';
import DataGrid, { Column, Paging, Pager, Editing, Lookup, RequiredRule } from 'devextreme-react/data-grid';
import { useQuery } from '@tanstack/react-query';
import {
  addInventoryItemTransaction,
  deleteInventoryItemTransaction,
  getInventoryItemTransactions,
  getTransactionTypes,
  updateInventoryItemTransaction,
} from '@/server/actions/inventory.actions';
import CustomStore from 'devextreme/data/custom_store';

type Props = {
  itemId: number;
};
const InventoryTransactionGrid = ({ itemId }: Props) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inventoryTransaction', itemId],
    queryFn: async () => getInventoryItemTransactions(itemId),
    enabled: !!itemId,
  });

  const { data: transactionTypes } = useQuery({
    queryKey: ['transactionType'],
    queryFn: async () => getTransactionTypes(),
  });

  const [inventoryTransactionData] = useState(
    new CustomStore({
      key: 'transaction_id',
      load: async () => data ?? [],
      insert: async (values) => addInventoryItemTransaction(values, itemId).finally(refetch),
      update: async (key, values) => updateInventoryItemTransaction(key, values, itemId).finally(refetch),
      remove: async (key) => deleteInventoryItemTransaction(key, itemId).finally(refetch),
    }),
  );
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory items</div>;
  return (
    <DataGrid
      dataSource={inventoryTransactionData}
      keyExpr="transaction_id"
      showBorders={true}
      onInitNewRow={(e) => {
        e.data.date_of_transaction = new Date();
      }}
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
      {/* <Column dataField="item_name" caption="Name">
        <RequiredRule />
      </Column> */}
      <Column dataField="quantity" caption="Quantity" dataType="number">
        <RequiredRule />
      </Column>

      <Column
        dataField="date_of_transaction"
        caption="Transaction Date"
        dataType="date"
        allowEditing={false}
        sortOrder="desc"
        sortIndex={0}
      />

      <Column dataField="transaction_type_id" caption="Transaction Type">
        <RequiredRule message="Type is required" />
        <Lookup
          dataSource={transactionTypes?.map((um) => ({
            transaction_type_id: um.transaction_type_id,
            text: um.transaction_type_name,
          }))}
          valueExpr="transaction_type_id"
          displayExpr="text"
        />
      </Column>
      <Column
        dataField="price_per_unit"
        caption="Price Per Unit"
        dataType="number"
        format={{ type: 'currency', currency: 'GBP', precision: 2 }}
      />
      <Column
        dataField="total_amount"
        caption="Total Amount"
        dataType="number"
        format={{ type: 'currency', currency: 'GBP', precision: 2 }}
      />
    </DataGrid>
  );
};

export default InventoryTransactionGrid;
