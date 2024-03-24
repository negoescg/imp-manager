import { CategoryDetail } from '@/interfaces/list.interfaces';

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

export const processItems = (
  items:
    | Array<{
        id: number;
        name: string;
        sku: string;
        production_list_id: number;
        original_required: number;
        required: number;
        completed: number | null;
        took_from_stock: number | null;
      }>
    | any[],
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

export const processCategories = (categories: CategoryDetail): any[] => {
  const processedItems = [] as any[];
  Object.entries(categories).forEach(([categoryName, products]) => {
    products.forEach((product) => {
      if (product.variants && product.variants.length > 1) {
        const aggregated = product.variants.reduce(
          (acc, variant) => {
            acc.required += variant.required || 0;
            acc.completed += variant.completed || 0;
            acc.took_from_stock += variant.took_from_stock || 0;
            return acc;
          },
          { required: 0, completed: 0, took_from_stock: 0 },
        );

        processedItems.push({
          ...product,
          required: aggregated.required,
          completed: aggregated.completed,
          took_from_stock: aggregated.took_from_stock,
          category: categoryName,
        });
      } else {
        processedItems.push({
          ...product,
          category: categoryName,
        });
      }
    });
  });

  return processedItems;
};
