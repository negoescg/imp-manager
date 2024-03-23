'use client';
import React, { useEffect, useState } from 'react';
import DataGrid, {
  Column,
  Paging,
  Pager,
  Editing,
  Lookup,
  RequiredRule,
  Button,
  Summary,
  TotalItem,
  DataGridTypes,
  FilterPanel,
  FilterBuilderPopup,
  HeaderFilter,
} from 'devextreme-react/data-grid';
import { useQuery } from '@tanstack/react-query';
import {
  addInventoryItemTransaction,
  confirmInventoryTransaction,
  deleteInventoryItemTransaction,
  getInventoryItemTransactions,
  getTransactionTypes,
  updateInventoryItemTransaction,
} from '@/server/actions/inventory.actions';
import CustomStore from 'devextreme/data/custom_store';
import { confirm } from 'devextreme/ui/dialog';
import StatusCell from './StatusCell';

type Props = {
  itemId: number;
  unit?: string | null;
};
const InventoryTransactionGrid = ({ itemId, unit }: Props) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inventoryTransaction', itemId],
    queryFn: async () => getInventoryItemTransactions(itemId),
    enabled: !!itemId,
  });

  const { data: transactionTypes } = useQuery({
    queryKey: ['transactionType'],
    queryFn: async () => getTransactionTypes(),
  });

  const [inventoryTransactionData, setInventoryTransactionData] = useState(new CustomStore());
  useEffect(() => {
    setInventoryTransactionData(
      new CustomStore({
        key: 'transaction_id',
        load: async () => data ?? [],
        insert: async (values) => addInventoryItemTransaction(values, itemId).finally(refetch),
        update: async (key, values) => updateInventoryItemTransaction(key, values, itemId).finally(refetch),
        remove: async (key) => deleteInventoryItemTransaction(key, itemId).finally(refetch),
      }),
    );
  }, [data]);

  const confirmTransaction = async (data) => {
    await confirmInventoryTransaction(data.transaction_id);
    refetch();
  };

  const calculateConfirmedQuantity = (options: DataGridTypes.CustomSummaryInfo) => {
    if (options.name === 'TotalQuantity') {
      switch (options.summaryProcess) {
        case 'start':
          options.totalValue = 0;
          break;
        case 'calculate':
          if (options.value.status === 'Confirmed') {
            if (options.value.transaction_type_id === 1) {
              options.totalValue += options.value.quantity;
            } else if (options.value.transaction_type_id === 2) {
              options.totalValue -= options.value.quantity;
            }
          }
          break;
        case 'finalize':
          break;
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory items</div>;
  return (
    <DataGrid
      dataSource={inventoryTransactionData}
      keyExpr="transaction_id"
      showColumnLines={true}
      showRowLines={true}
      showBorders={true}
      rowAlternationEnabled={true}
      onInitNewRow={(e) => {
        e.data.date_of_transaction = new Date();
        e.data.status = 'Pending';
      }}
      columnAutoWidth={true}
      searchPanel={{ visible: true, width: 240, placeholder: 'Search...' }}>
      {/* <FilterRow visible={true} /> */}
      <FilterPanel visible={true} />
      <HeaderFilter visible={true} />
      <FilterBuilderPopup position="top" />
      <Editing
        refreshMode="reshape"
        mode="popup"
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

      <Column dataField="transaction_type_id" caption="Transaction Type" defaultFilterValue={1}>
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
        dataField="quantity"
        caption={`Quantity ${unit ? `(${unit})` : ''}`}
        dataType="number"
        allowFiltering={false}>
        <RequiredRule />
      </Column>
      <Column
        dataField="price_per_unit"
        caption="Price Per Unit"
        dataType="number"
        format={{ type: 'currency', currency: 'GBP', precision: 2 }}
        allowFiltering={false}
      />
      <Column
        dataField="status"
        caption="Status"
        dataType="string"
        allowEditing={false}
        cellRender={({ value }) => <StatusCell value={value} />}
      />
      <Column
        dataField="date_of_transaction"
        caption="Transaction Date"
        dataType="date"
        allowEditing={false}
        sortOrder="desc"
        sortIndex={0}
        allowFiltering={false}
      />

      <Column dataField="expected_date" caption="Expected Date" dataType="date" allowFiltering={false} />
      <Column type="buttons">
        <Button
          text="Confirm"
          icon="todo"
          hint="Confirm Transaction"
          visible={(options) => {
            return options.row.data.status === 'Pending' && !options.row.isNewRow;
          }}
          onClick={(e) => {
            confirm('Are you sure you want to confirm this transaction?', 'Confirm Transaction').then(
              (dialogResult) => {
                if (dialogResult) {
                  confirmTransaction(e.row?.data);
                }
              },
            );
          }}
        />
        <Button
          name="edit"
          visible={(options) => {
            return options.row.data.status === 'Pending' && !options.row.isNewRow;
          }}
        />
        <Button
          name="delete"
          visible={(options) => {
            return !options.row.isNewRow;
          }}
        />
      </Column>
      <Summary calculateCustomSummary={calculateConfirmedQuantity}>
        <TotalItem
          name="TotalQuantity"
          summaryType="custom"
          showInColumn="quantity"
          displayFormat="Total Confirmed Quantity: {0}"
        />
      </Summary>
    </DataGrid>
  );
};

export default InventoryTransactionGrid;
