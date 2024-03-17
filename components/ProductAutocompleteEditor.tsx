import { getFinalProducts } from '@/server/actions/product.actions';
import { useQuery } from '@tanstack/react-query';
import { Autocomplete } from 'devextreme-react';
import { useCallback } from 'react';

const ProductAutocompleteEditor = (props) => {
  const { data: productItems } = useQuery({
    queryKey: ['product'],
    queryFn: async () => getFinalProducts(),
  });

  const onValueChange = useCallback(
    (e) => {
      props.data.setValue(e);
    },
    [props, productItems],
  );

  const onSelectionChange = useCallback(
    (e) => {
      if (props.data.value !== e.selectedItem.name) {
        console.warn(props, props.data.row.data.sku, e.selectedItem.sku);
        if (props.data.row.data.sku !== e.selectedItem.sku) {
          props.data.component.cellValue(props.data.rowIndex, 0, e.selectedItem.sku);
        }
        props.data.component.cellValue(props.data.rowIndex, 1, e.selectedItem.name);
      }
    },
    [props, productItems],
  );

  return (
    <Autocomplete
      value={props.data.value}
      valueExpr={'name'}
      onValueChange={onValueChange}
      onSelectionChanged={onSelectionChange}
      dataSource={productItems ?? []}
      acceptCustomValue={true}
    />
  );
};

export default ProductAutocompleteEditor;
