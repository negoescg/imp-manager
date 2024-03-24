'use client';
import { getProdHistory } from '@/server/actions/history.actions';
import { processCategories, processItems } from '@/util/production.util';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth } from 'date-fns';
import { DateBox } from 'devextreme-react';
import PieChart, { Legend, Series, Tooltip, Format, Label, Connector, Export } from 'devextreme-react/pie-chart';
import DataGrid, { Column, Paging, Pager } from 'devextreme-react/data-grid';
import React, { useEffect, useState } from 'react';
import ProductAutocompleteEditor from './ProductAutocompleteEditor';

const ProdHistory = () => {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [combineData, setCombineData] = useState([] as any[]);
  const [nameData, setNameData] = useState([] as any[]);
  const { data, isLoading, error } = useQuery({
    queryKey: ['prodHistory', startDate, endDate],
    queryFn: async () => getProdHistory(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
  useEffect(() => {
    if (data) {
      const aggData = handleCombineData(data);
      const sumData = processCategories(processItems(aggData));
      setCombineData(aggData);
      setNameData(sumData);
    }
  }, data);
  const handleCombineData = (data) => {
    const result = data.reduce((acc, item) => {
      if (acc[item.sku]) {
        acc[item.sku].required += item.required || 0;
        acc[item.sku].completed += item.completed || 0;
        acc[item.sku].took_from_stock += item.took_from_stock || 0;
      } else {
        acc[item.sku] = {
          id: item.id,
          name: item.name,
          sku: item.sku,
          type: item.type,
          list_date: item.list_date,
          completed_date: item.completed_date,
          required: item.required || 0,
          completed: item.completed || 0,
          list_id: item.list_id,
          took_from_stock: item.took_from_stock || 0,
        };
      }
      return acc;
    }, {});
    return Object.values(result);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;
  return (
    <>
      <div className="flex w-full pb-5">
        <DateBox
          value={startDate}
          onValueChange={(value) => setStartDate(value as Date)}
          displayFormat="yyyy/MM/dd"
          label="Start Date"
        />
        <DateBox
          className="ml-4"
          value={endDate}
          onValueChange={(value) => setEndDate(value as Date)}
          displayFormat="yyyy/MM/dd"
          label="End Date"
        />
      </div>
      <PieChart
        id="pie"
        type="doughnut"
        title="Required products by type"
        palette="Soft Pastel"
        dataSource={combineData}>
        <Series argumentField="type" valueField="required">
          <Label visible={true} format="largeNumber">
            <Connector visible={true} />
          </Label>
        </Series>

        <Export enabled={true} />
        <Legend margin={0} horizontalAlignment="right" verticalAlignment="top" />
        <Tooltip enabled={true}>
          <Format type="largeNumber" />
        </Tooltip>
      </PieChart>
      <PieChart id="pie" type="doughnut" title="Required products by name" palette="Soft Pastel" dataSource={nameData}>
        <Series argumentField="name" valueField="required">
          <Label visible={true} format="largeNumber">
            <Connector visible={true} />
          </Label>
        </Series>

        <Export enabled={true} />
        <Legend margin={0} horizontalAlignment="right" verticalAlignment="top" />
        <Tooltip enabled={true}>
          <Format type="largeNumber" />
        </Tooltip>
      </PieChart>
      <DataGrid
        dataSource={combineData}
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
        <Paging enabled={true} defaultPageSize={10} />
        <Pager
          visible={true}
          showPageSizeSelector={true}
          allowedPageSizes={[10, 15, 20]}
          showNavigationButtons={true}
          showInfo={true}
        />
        <Column dataField="sku" caption="SKU"></Column>
        <Column dataField="name" caption="Name" editCellComponent={ProductAutocompleteEditor}></Column>
        <Column dataField="required" caption="Quantity Required" dataType="number"></Column>
        <Column dataField="completed" caption="Quantity Produced" dataType="number"></Column>
        <Column dataField="took_from_stock" caption="Took from Stock" dataType="number"></Column>
      </DataGrid>
    </>
  );
};

export default ProdHistory;
