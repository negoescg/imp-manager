import { Accordion } from 'devextreme-react';
import React, { useEffect, useState } from 'react';
import CandleListGrid from './CandleListGrid';
import OtherListGrid from './OtherListGrid';
import BathProductsGrid from './BathProductsGrid';
import { CategoryDetail } from '@/interfaces/list.interfaces';
import { processItems } from '@/util/production.util';
type Props = {
  itemId: number;
  refetch: () => void;
  data:
    | {
        id: number;
        name: string;
        sku: string;
        production_list_id: number;
        original_required: number;
        required: number;
        completed: number | null;
        took_from_stock: number | null;
      }[]
    | undefined;
};

const ProductionView = ({ itemId, data, refetch }: Props) => {
  const [categorizedData, setCategorizedData] = useState<CategoryDetail>({});

  useEffect(() => {
    if (data) {
      const processedData = processItems(data);
      setCategorizedData(processedData);
    }
  }, [data]);

  return (
    <Accordion
      className="mt-5"
      dataSource={Object.entries(categorizedData).map(([categoryName, products]) => ({
        title: categoryName,
        tableData: products,
      }))}
      collapsible={true}
      multiple={false}
      itemTitleRender={({ title }) => {
        switch (title) {
          case 'Candle List':
            return (
              <div className="bg-purple-800 text-white w-full mr-5 px-2">
                <h3>{title}</h3>
              </div>
            );
          case 'Bath Products':
            return (
              <div className="bg-blue-800 text-white w-full mr-5 px-2">
                <h3>{title}</h3>
              </div>
            );
          case 'Other':
            return (
              <div className=" bg-gray-500 text-white w-full mr-5 px-2">
                <h3>{title}</h3>
              </div>
            );
          default:
            return <></>;
        }
      }}
      itemComponent={({ data }) => {
        switch (data.title) {
          case 'Candle List':
            return <CandleListGrid products={data.tableData} id={itemId} refetch={refetch} />;
          case 'Bath Products':
            return <BathProductsGrid products={data.tableData} id={itemId} refetch={refetch} />;
          case 'Other':
            return <OtherListGrid products={data.tableData} id={itemId} refetch={refetch} />;
          default:
            return <></>;
        }
      }}
    />
  );
};

export default ProductionView;
