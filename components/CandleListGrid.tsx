import { ProductDetail, VariantDetail } from '@/interfaces/list.interfaces';
import DataGrid, { Column, Summary, TotalItem, MasterDetail, DataGridTypes, Export } from 'devextreme-react/data-grid';
import VariantListGrid from './VariantListGrid';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';

type Props = {
  id: number;
  products: ProductDetail[];
};

const CandleListGrid = ({ id, products }: Props) => {
  const processData = (products: ProductDetail[]) => {
    return products.map((product) => {
      const variantQuantities = {
        sku: '',
        name: '',
        type: '',
        L_M: 0,
        N_O: 0,
        P_Q: 0,
        R_S: 0,
        NK: 0,
        ER: 0,
        BR: 0,
        PIN: 0,
        CUSTOM: 0,
        TOTAL: product.required || 0,
        Variants: [] as VariantDetail[],
      };
      if (!product.isBespoke) {
        product.variants?.forEach((variant) => {
          const { description, required, type, sku } = variant;
          switch (description) {
            case 'Ring Size L/M':
              variantQuantities.L_M += required;
              variantQuantities.type = type ?? '';
              break;
            case 'Ring Size N/O':
              variantQuantities.N_O += required;
              variantQuantities.type = type ?? '';
              break;
            case 'Ring Size P/Q':
              variantQuantities.P_Q += required;
              variantQuantities.type = type ?? '';
              break;
            case 'Ring Size R/S':
              variantQuantities.R_S += required;
              variantQuantities.type = type ?? '';
              break;
            case 'Necklace':
              variantQuantities.NK += required;
              variantQuantities.type = type ?? '';
              break;
            case 'Earrings':
              variantQuantities.ER += required;
              variantQuantities.type = type ?? '';
              break;
            case 'Bracelet':
              variantQuantities.BR += required;
              variantQuantities.type = type ?? '';
              break;
            default:
              if (variant.isBespoke) {
                variantQuantities.CUSTOM += required;
                variantQuantities.type = type ?? '';
              }
              break;
          }
        });
        variantQuantities.TOTAL +=
          variantQuantities.L_M +
          variantQuantities.N_O +
          variantQuantities.P_Q +
          variantQuantities.R_S +
          variantQuantities.NK +
          variantQuantities.ER +
          variantQuantities.BR +
          variantQuantities.PIN +
          variantQuantities.CUSTOM;
      } else {
        variantQuantities.CUSTOM += product.required ?? 0;
        variantQuantities.sku = product.sku ?? '';
        variantQuantities.type = product.type ?? '';
        variantQuantities.TOTAL = product.required ?? 0;
      }

      variantQuantities.name = product.name;
      variantQuantities.Variants = product.variants ?? [];
      return {
        ...variantQuantities,
      };
    });
  };

  const dataSource = processData(products);

  const renderDetail = (props: DataGridTypes.MasterDetailTemplateData) => {
    console.warn(props);
    return <VariantListGrid variants={props.data.Variants} listId={id} />;
  };

  const onRowClick = (e: DataGridTypes.RowClickEvent<any, any>) => {
    if (e.rowType === 'data' && e.handled !== true) {
      var key = e.component.getKeyByRowIndex(e.rowIndex);
      var expanded = e.component.isRowExpanded(key);
      if (expanded) {
        e.component.collapseAll(-1);
      } else {
        e.component.collapseAll(-1);
        e.component.expandRow(key);
      }
    }
  };

  const onExporting = (e: DataGridTypes.ExportingEvent) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');

    exportDataGrid({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'BathProducts.xlsx');
      });
    });
  };

  return (
    <DataGrid
      dataSource={dataSource}
      onExporting={onExporting}
      showBorders={true}
      showColumnLines={true}
      showRowLines={true}
      onRowClick={onRowClick}
      rowAlternationEnabled={true}>
      <Column dataField="sku" caption="SKU" />
      <Column dataField="name" caption="Name" />
      <Column dataField="type" caption="Type" />
      <Column
        cellRender={(cellData) => (cellData.value === 0 ? <></> : <>{cellData.value}</>)}
        dataField="L_M"
        caption="L/M"
      />
      <Column
        cellRender={(cellData) => (cellData.value === 0 ? <></> : <>{cellData.value}</>)}
        dataField="N_O"
        caption="N/O"
      />
      <Column
        cellRender={(cellData) => (cellData.value === 0 ? <></> : <>{cellData.value}</>)}
        dataField="P_Q"
        caption="P/Q"
      />
      <Column
        cellRender={(cellData) => (cellData.value === 0 ? <></> : <>{cellData.value}</>)}
        dataField="R_S"
        caption="R/S"
      />
      <Column
        cellRender={(cellData) => (cellData.value === 0 ? <></> : <>{cellData.value}</>)}
        dataField="NK"
        caption="NK"
      />
      <Column
        cellRender={(cellData) => (cellData.value === 0 ? <></> : <>{cellData.value}</>)}
        dataField="ER"
        caption="ER"
      />
      <Column
        cellRender={(cellData) => (cellData.value === 0 ? <></> : <>{cellData.value}</>)}
        dataField="BR"
        caption="BR"
      />
      <Column
        cellRender={(cellData) => (cellData.value === 0 ? <></> : <>{cellData.value}</>)}
        dataField="PIN"
        caption="PIN"
      />
      <Column
        cellRender={(cellData) => (cellData.value === 0 ? <></> : <>{cellData.value}</>)}
        dataField="CUSTOM"
        caption="CUSTOM"
      />
      <Column dataField="TOTAL" caption="Total" />
      <Summary>
        <TotalItem column="L_M" summaryType="sum" />
        <TotalItem column="N_O" summaryType="sum" />
        <TotalItem column="P_Q" summaryType="sum" />
        <TotalItem column="R_S" summaryType="sum" />
        <TotalItem column="NK" summaryType="sum" />
        <TotalItem column="ER" summaryType="sum" />
        <TotalItem column="BR" summaryType="sum" />
        <TotalItem column="PIN" summaryType="sum" />
        <TotalItem column="CUSTOM" summaryType="sum" />
        <TotalItem column="TOTAL" summaryType="sum" />
      </Summary>
      <MasterDetail render={renderDetail} />
      <Export enabled={true} />
    </DataGrid>
  );
};

export default CandleListGrid;
