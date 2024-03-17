'use client';
import React, { useEffect, useRef, useState } from 'react';
import DataGrid, { Column, Paging, Pager, Editing, DataGridTypes, Button } from 'devextreme-react/data-grid';
import { useQuery } from '@tanstack/react-query';
import CustomStore from 'devextreme/data/custom_store';
import Link from 'next/link';
import {
  addProductionList,
  completeProductionList,
  deleteProductionList,
  getProductionLists,
  updateProductionList,
  uploadProductionList,
} from '@/server/actions/production.actions';
import { useUser } from '@clerk/nextjs';
import { Button as NormalButton, DateBox, FileUploader, TextBox, Toast } from 'devextreme-react';
import * as XLSX from 'xlsx';
import DataSource from 'devextreme/data/data_source';
import StatusCell from './StatusCell';
import { confirm } from 'devextreme/ui/dialog';

const ProductionListGrid = () => {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [fileData, setFileData] = useState<any[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [name, setName] = useState('');
  const [listDate, setListDate] = useState(new Date());
  const fileUploaderRef = useRef<FileUploader>(null);
  const listsDataGridRef = useRef<DataGrid>(null);

  useEffect(() => {
    if (isLoaded && user) {
      if (user.organizationMemberships.length > 0) {
        if (user.organizationMemberships[0].role === 'org:admin') {
          setIsAdmin(true);
        }
      }
    }
  }, [user, isLoaded]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['production'],
    queryFn: async () => getProductionLists(),
  });

  const initialDataSource = new DataSource({
    store: new CustomStore({
      key: 'id',
      load: async () => data ?? [],
      insert: async (values) => addProductionList(values).finally(refetch),
      update: async (key, values) => updateProductionList(key, values).finally(refetch),
      remove: async (key) => deleteProductionList(key).finally(refetch),
    }),
  });

  const [dataSource, setDataSource] = useState(initialDataSource);
  useEffect(() => {
    if (listsDataGridRef.current) {
      setDataSource(initialDataSource);
    }
  }, [data]);

  const submitForm = async () => {
    if (fileData.length) {
      await uploadProductionList(name, listDate, JSON.stringify(fileData));
      refetch();
      setName('');
      setListDate(new Date());
      if (fileUploaderRef.current) {
        fileUploaderRef.current.instance.reset();
      }
    } else {
      setToastMessage('No file selected/wrong fromat/no data - Please check file.');
      setToastVisible(true);
      return;
    }
  };

  const handleFileUpload = async (e) => {
    if (e.value.length) {
      const file = e.value[0];
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      setFileData(json);
    }
  };

  const completeList = async (data) => {
    await completeProductionList(data.id);
    refetch();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <>
      {isAdmin && (
        <div className="flex items-center w-full">
          <TextBox
            className="w-28"
            value={name}
            onValueChanged={(e) => setName(e.value)}
            placeholder="Enter name"
            style={{ marginRight: '10px' }}
          />
          <DateBox
            className="w-40"
            value={listDate}
            onValueChanged={(e) => setListDate(e.value)}
            displayFormat="yyyy/MM/dd"
            style={{ marginRight: '10px' }}
          />
          <FileUploader
            className=" w-56"
            ref={fileUploaderRef}
            onValueChanged={handleFileUpload}
            selectButtonText="Select Excel file"
            labelText=""
            accept=".xlsx"
            uploadMode="useForm"
          />
          <NormalButton text="Upload" type="default" onClick={submitForm} />
        </div>
      )}
      <DataGrid
        ref={listsDataGridRef}
        dataSource={dataSource}
        keyExpr="id"
        showColumnLines={true}
        showRowLines={true}
        showBorders={true}
        rowAlternationEnabled={true}
        columnAutoWidth={true}
        onInitNewRow={(e) => {
          e.data.list_date = new Date();
          e.data.status = 'In Progress';
        }}
        searchPanel={{ visible: true, width: 240, placeholder: 'Search...' }}>
        <Editing
          refreshMode="reshape"
          mode="row"
          allowUpdating={isAdmin}
          allowAdding={isAdmin}
          allowDeleting={isAdmin}
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
        <Column dataField="name" caption="Name" />
        <Column
          dataField="status"
          caption="Status"
          dataType="string"
          allowEditing={false}
          cellRender={({ value }) => <StatusCell value={value} />}
        />
        <Column
          dataField="list_date"
          caption="List Date"
          dataType="date"
          allowEditing={false}
          sortOrder="desc"
          sortIndex={0}
        />
        <Column
          dataField="id"
          caption="Action"
          allowEditing={false}
          cellRender={(cellData) => {
            if (!cellData.value) {
              return <span></span>;
            } else {
              return (
                <Link href={`/production/${cellData.value}`} title="view items">
                  List Items
                </Link>
              );
            }
          }}
        />
        <Column type="buttons">
          <Button
            text="Complete"
            icon="todo"
            hint="Complete List"
            visible={(options) => {
              return options.row.data.status === 'In Progress' && !options.row.isNewRow;
            }}
            onClick={(e: DataGridTypes.ColumnButtonClickEvent) => {
              confirm('Are you sure you want to mark this list as completed?', 'Complete List').then((dialogResult) => {
                if (dialogResult) {
                  completeList(e.row?.data);
                }
              });
            }}
          />
          <Button
            name="edit"
            visible={(options) => {
              return options.row.data.status === 'In Progress' && !options.row.isNewRow;
            }}
          />
          <Button
            name="delete"
            visible={(options) => {
              return !options.row.isNewRow;
            }}
          />
        </Column>
      </DataGrid>
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="error"
        displayTime={3000}
        onHiding={() => setToastVisible(false)}
      />
    </>
  );
};

export default ProductionListGrid;
