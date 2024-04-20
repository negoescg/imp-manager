'use client';
import React, { useState } from 'react';
import DataGrid, {
  Column,
  Paging,
  Pager,
  Editing,
  MasterDetail,
  DataGridTypes,
  Selection,
} from 'devextreme-react/data-grid';
import { useQuery } from '@tanstack/react-query';
import CustomStore from 'devextreme/data/custom_store';
import Link from 'next/link';
import { getCategories } from '@/server/actions/product.actions';
import { addCategory, deleteCategory, updateCategory } from '@/server/actions/category.actions';
import CategoryProductTemplateCompositionGrid from './CategoryProductTemplateCompositionGrid';

const CategoryGrid = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['category'],
    queryFn: async () => getCategories(),
  });

  const [categoryData] = useState(
    new CustomStore({
      key: 'category_id',
      load: async () => data ?? [],
      insert: async (values) => addCategory(values).finally(refetch),
      update: async (key, values) => updateCategory(key, values).finally(refetch),
      remove: async (key) => deleteCategory(key).finally(refetch),
    }),
  );

  const renderDetail = (props: DataGridTypes.MasterDetailTemplateData) => {
    const { category_id } = props.data;
    return <CategoryProductTemplateCompositionGrid itemId={category_id} />;
  };

  const onSelectionChanged = (e: DataGridTypes.SelectionChangedEvent) => {
    e.component.collapseAll(-1);
    e.component.expandRow(e.currentSelectedRowKeys[0]);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <DataGrid
      dataSource={categoryData}
      keyExpr="category_id"
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
        // allowDeleting={true}
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
      <Column dataField="category_name" caption="Name" />
      <Column
        dataField="category_id"
        caption="Action"
        allowEditing={false}
        cellRender={(cellData) => {
          if (!cellData.value) {
            return <span></span>;
          } else {
            return (
              <Link href={`/category/${cellData.value}`} title="composition">
                Composition
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

export default CategoryGrid;
