'use client';
import React, { useEffect, useRef, useState } from 'react';
import DataGrid, { Column, Paging, Pager, Editing } from 'devextreme-react/data-grid';
import { useQuery } from '@tanstack/react-query';
import CustomStore from 'devextreme/data/custom_store';
import Link from 'next/link';
import {
  addProductionList,
  deleteProductionList,
  getProductionLists,
  updateProductionList,
  uploadProductionList,
} from '@/server/actions/production.actions';
import { useUser } from '@clerk/nextjs';
import { Button, DateBox, FileUploader, TextBox, Toast } from 'devextreme-react';
import * as XLSX from 'xlsx';
import DataSource from 'devextreme/data/data_source';

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
    console.log('Submitting form with: ', { name, listDate });
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
          <Button text="Upload" type="default" onClick={submitForm} />
        </div>
      )}
      <DataGrid
        ref={listsDataGridRef}
        dataSource={dataSource}
        keyExpr="id"
        showBorders={true}
        columnAutoWidth={true}
        onInitNewRow={(e) => {
          e.data.list_date = new Date();
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
        <Paging enabled={true} defaultPageSize={3} />
        <Pager
          visible={true}
          showPageSizeSelector={true}
          allowedPageSizes={[3, 10, 20]}
          showNavigationButtons={true}
          showInfo={true}
        />
        <Column dataField="name" caption="Name" />
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
