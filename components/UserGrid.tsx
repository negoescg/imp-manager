'use client';

import React from 'react';
import DataGrid from 'devextreme-react/data-grid';
import { useGetUsers } from '@/data/get-users';

const UserGrid = () => {
  const { data, error, isFetched } = useGetUsers();
  const columns = ['email', 'username'];
  return <DataGrid dataSource={data} keyExpr="id" defaultColumns={columns} showBorders={true} />;
};

export default UserGrid;
