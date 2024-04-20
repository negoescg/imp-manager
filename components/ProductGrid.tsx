'use client';
import React, { useEffect, useRef, useState } from 'react';
import DataGrid, {
  Column,
  Paging,
  Pager,
  Editing,
  Lookup,
  RequiredRule,
  CustomRule,
  MasterDetail,
  DataGridTypes,
  Selection,
} from 'devextreme-react/data-grid';
import { useQuery } from '@tanstack/react-query';
import CustomStore from 'devextreme/data/custom_store';
import Link from 'next/link';
import {
  addProduct,
  deleteProduct,
  getCategories,
  getFinalProducts,
  updateProduct,
  uploadProductList,
} from '@/server/actions/product.actions';
import ProductCompositionGrid from './ProductCompositionGrid';
import { Button as NormalButton, FileUploader, Toast } from 'devextreme-react';
import * as XLSX from 'xlsx';
import DataSource from 'devextreme/data/data_source';
import { useSession } from '@/providers/SessionProvider';

const ProductGrid = () => {
  const { user } = useSession();
  const fileUploaderRef = useRef<FileUploader>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fileData, setFileData] = useState<any[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const listsDataGridRef = useRef<DataGrid>(null);

  useEffect(() => {
    if (user) {
      if (user.role.length > 0) {
        if (user.role === 'admin') {
          setIsAdmin(true);
        }
      }
    }
  }, [user]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['product'],
    queryFn: async () => getFinalProducts(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => getCategories(),
  });

  const initialDataSource = new DataSource({
    store: new CustomStore({
      key: 'product_id',
      load: async () => data ?? [],
      insert: async (values) => addProduct(values).finally(refetch),
      update: async (key, values) => updateProduct(key, values).finally(refetch),
      remove: async (key) => deleteProduct(key).finally(refetch),
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
      await uploadProductList(JSON.stringify(fileData));
      refetch();
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

  const handleUniqueSkuValidation = (options) => {
    const itemId = options.data?.product_id ?? 0;

    if (itemId === 0 || !itemId) {
      return !data?.some((item) => item.sku === options.value);
    }

    return !data?.some((item) => item.product_id !== itemId && item.sku === options.value);
  };

  const renderDetail = (props: DataGridTypes.MasterDetailTemplateData) => {
    const { product_id } = props.data;
    return <ProductCompositionGrid itemId={product_id} />;
  };

  const onSelectionChanged = (e: DataGridTypes.SelectionChangedEvent) => {
    e.component.collapseAll(-1);
    e.component.expandRow(e.currentSelectedRowKeys[0]);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;
  return (
    <>
      {isAdmin && (
        <div className="flex items-center w-full">
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
        keyExpr="product_id"
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
        <Column dataField="sku" caption="SKU">
          <RequiredRule />
          <CustomRule validationCallback={handleUniqueSkuValidation} message="SKU must be unique" />
        </Column>
        <Column dataField="name" caption="Name">
          <RequiredRule />
        </Column>
        <Column dataField="category_id" caption="Product Category">
          <RequiredRule message="Product Category is required" />
          <Lookup
            dataSource={categories?.map((um) => ({ category_id: um.category_id, text: um.category_name }))}
            valueExpr="category_id"
            displayExpr="text"
          />
        </Column>
        <Column
          dataField="production_cost"
          caption="Prod. Cost"
          dataType="number"
          format={{ type: 'currency', currency: 'GBP', precision: 2 }}
        />
        <Column
          dataField="production_cost_difference"
          caption="Cost Variation"
          allowEditing={false}
          cellRender={({ value }) => {
            if (value > 0) {
              return (
                <div style={{ color: 'red' }}>
                  <span style={{ marginRight: '5px' }}>↑</span>
                  {value.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 })}
                </div>
              );
            } else if (value < 0) {
              return (
                <div style={{ color: 'green' }}>
                  <span style={{ marginRight: '5px' }}>↓</span>
                  {Math.abs(value).toLocaleString('en-GB', {
                    style: 'currency',
                    currency: 'GBP',
                    minimumFractionDigits: 2,
                  })}
                </div>
              );
            } else {
              return <span>No Change</span>;
            }
          }}
        />
        <Column
          dataField="product_id"
          caption="Action"
          allowEditing={false}
          cellRender={(cellData) => {
            if (!cellData.value) {
              return <span></span>;
            } else {
              return (
                <Link href={`/product/${cellData.value}`} title="composition">
                  Composition
                </Link>
              );
            }
          }}
        />
        <Selection mode="single" />
        <MasterDetail enabled={false} render={renderDetail} />
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

export default ProductGrid;
