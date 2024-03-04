'use client';
import React, { useState } from 'react';
import DataGrid, { Column, Paging, Pager, Editing, Lookup, RequiredRule, CustomRule } from 'devextreme-react/data-grid';
import { useQuery } from '@tanstack/react-query';
import CustomStore from 'devextreme/data/custom_store';
import Link from 'next/link';
import {
  addProduct,
  deleteProduct,
  getCategories,
  getFinalProducts,
  updateProduct,
} from '@/server/actions/product.actions';

const ProductGrid = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['product'],
    queryFn: async () => getFinalProducts(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => getCategories(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  const [productData] = useState(
    new CustomStore({
      key: 'product_id',
      load: async () => data ?? [],
      insert: async (values) => addProduct(values).finally(refetch),
      update: async (key, values) => updateProduct(key, values).finally(refetch),
      remove: async (key) => deleteProduct(key).finally(refetch),
    }),
  );

  const handleUniqueSkuValidation = (options) => {
    const itemId = options.data?.product_id ?? 0;

    if (itemId === 0 || !itemId) {
      return !data?.some((item) => item.sku === options.value);
    }

    return !data?.some((item) => item.product_id !== itemId && item.sku === options.value);
  };

  return (
    <DataGrid
      dataSource={productData}
      keyExpr="product_id"
      showBorders={true}
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
      <Column dataField="sku" caption="SKU">
        <RequiredRule />
        <CustomRule validationCallback={handleUniqueSkuValidation} message="SKU must be unique" />
      </Column>
      <Column dataField="name" caption="Name" />
      <Column dataField="category_id" caption="Product Category">
        <RequiredRule message="Product Category is required" />
        <Lookup
          dataSource={categories?.map((um) => ({ category_id: um.category_id, text: um.category_name }))}
          valueExpr="category_id"
          displayExpr="text"
        />
      </Column>
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
    </DataGrid>
  );
};

export default ProductGrid;
