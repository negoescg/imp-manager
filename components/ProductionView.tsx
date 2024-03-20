import { Accordion } from 'devextreme-react';
import React, { useEffect, useState } from 'react';
import CandleListGrid from './CandleListGrid';
import OtherListGrid from './OtherListGrid';
import BathProductsGrid from './BathProductsGrid';
import { CategoryDetail } from '@/interfaces/list.interfaces';
type Props = {
  itemId: number;
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

const getCategoryAndType = (sku: string): { category: string; type: string } => {
  let type = 'Custom';
  let category = 'Other';

  switch (sku.substring(0, 2)) {
    case '01':
      type = 'Candle';
      category = 'Candle List';
      break;
    case '02':
      type = 'Whipped Soap';
      category = 'Bath Products';
      break;
    case 'BB':
      type = 'Bath Bomb';
      category = 'Bath Products';
      break;
    case '06':
      type = 'Bath Dust';
      category = 'Bath Products';
      break;
    case '07':
      type = 'Juna Refill';
      category = 'Other';
      break;
    case 'MB':
      type = 'Mystery Box';
      category = 'Other';
      break;
    case 'WX':
      type = 'Wax Melt';
      category = 'Candle List';
      break;
    case 'FR':
      type = 'Free';
      category = 'Other';
      break;
  }

  return { category, type };
};

const variantDescriptions = {
  '52': 'Ring Size L/M',
  '54': 'Ring Size N/O',
  '57': 'Ring Size P/Q',
  '59': 'Ring Size R/S',
  NK: 'Necklace',
  ER: 'Earrings',
  ERS: 'Earrings',
  NJ: 'No Jewel',
  R: 'Ring',
  BR: 'Bracelet',
};

const determineVariantDescription = (variantCode: string): string => {
  const baseCode = variantCode;
  const isBespoke = baseCode.length > 2 && baseCode !== 'ERS';
  let description = variantDescriptions[baseCode] || 'Unknown Variant';

  if (isBespoke) {
    const baseDescription = variantDescriptions[baseCode.substring(0, 2)];
    if (baseDescription) {
      description = `${baseDescription} Bespoke`;
    } else {
      const ringSize = baseCode.substring(0, 2);
      description = `Ring Size ${ringSize} Bespoke`;
    }
  }

  return description;
};

const formatProductName = (name) => {
  const keywords = ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'No Jewel'];
  const typeKeywords = [
    'Candle',
    'Whipped Soap',
    'Bath Bomb',
    'Bath Dust',
    'Juna Refill',
    'Mystery Box',
    'Wax Melt',
    'Free',
  ];
  let formattedName = name;

  const possibleBaseName = formattedName.split(' - ')[0];
  if (possibleBaseName) {
    formattedName = possibleBaseName.trim();
  }

  keywords.forEach((keyword) => {
    const keywordIndex = formattedName.indexOf(keyword);
    if (keywordIndex !== -1) {
      formattedName = formattedName.substring(0, keywordIndex).trim();
    }
  });
  typeKeywords.forEach((keyword) => {
    if (formattedName.includes(keyword)) {
      formattedName = formattedName.replace(keyword, '').trim();
    }
  });

  return formattedName;
};

const processItems = (
  items: Array<{
    id: number;
    name: string;
    sku: string;
    production_list_id: number;
    original_required: number;
    required: number;
    completed: number | null;
    took_from_stock: number | null;
  }>,
): CategoryDetail => {
  const categories: CategoryDetail = {};

  items.forEach((item) => {
    const { category, type } = getCategoryAndType(item.sku);
    const hasVariant = item.sku.includes('_');
    const variantInfo = hasVariant ? item.sku.split('_')[1] : null;
    const isBespoke = variantInfo ? variantInfo.length > 2 && variantInfo !== 'ERS' : false;
    const variantDescription = hasVariant ? determineVariantDescription(variantInfo as string) : '';

    const productBaseName = hasVariant && !isBespoke ? formatProductName(item.name) : item.name;

    if (!categories[category]) {
      categories[category] = [];
    }

    if (hasVariant) {
      let product = categories[category].find((p) => p.name === productBaseName && p.type === type);
      if (!product) {
        product = { name: productBaseName, variants: [], isBespoke: isBespoke, type: type };
        categories[category].push(product);
      }
      if (isBespoke) {
        product.sku = item.sku;
        product.required = item.required;
        product.type = type;
        product.isBespoke = isBespoke;
        product.completed = item.completed ?? 0;
        product.took_from_stock = item.took_from_stock ?? 0;
        product.variants = [
          {
            sku: item.sku,
            description: productBaseName,
            required: item.required,
            isBespoke: false,
            type,
            completed: item.completed ?? 0,
            took_from_stock: item.took_from_stock ?? 0,
            id: item.id,
          },
        ];
      } else {
        product.variants!.push({
          sku: item.sku,
          description: variantDescription,
          required: item.required,
          isBespoke,
          type: type,
          completed: item.completed ?? 0,
          took_from_stock: item.took_from_stock ?? 0,
          id: item.id,
        });
      }
    } else {
      categories[category].push({
        name: productBaseName,
        sku: item.sku,
        required: item.required,
        type: type,
        isBespoke: isBespoke,
        completed: item.completed ?? 0,
        took_from_stock: item.took_from_stock ?? 0,
        variants: [
          {
            sku: item.sku,
            description: productBaseName,
            required: item.required,
            isBespoke: false,
            type,
            completed: item.completed ?? 0,
            took_from_stock: item.took_from_stock ?? 0,
            id: item.id,
          },
        ],
      });
    }
  });

  return categories;
};

const ProductionView = ({ itemId, data }: Props) => {
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
            return <CandleListGrid products={data.tableData} id={itemId} />;
          case 'Bath Products':
            return <BathProductsGrid products={data.tableData} id={itemId} />;
          case 'Other':
            return <OtherListGrid products={data.tableData} id={itemId} />;
          default:
            return <></>;
        }
      }}
    />
  );
};

export default ProductionView;
