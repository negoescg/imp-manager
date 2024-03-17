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

const BathProductsGrid = ({ id, products }: Props) => {
  const processData = (products: ProductDetail[]) => {
    return products.map((product) => {
      const variantQuantities = {
        sku: '',
        name: '',
        type: '',
        no_jewel: 0,
        L_M: 0,
        N_O: 0,
        P_Q: 0,
        R_S: 0,
        NK: 0,
        ER: 0,
        BR: 0,
        kids: 0,
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
            case 'No Jewel':
              variantQuantities.no_jewel += required;
              variantQuantities.type = type ?? '';
              break;
            default:
              if (variant.isBespoke) {
                variantQuantities.kids += required;
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
          variantQuantities.kids;
      } else {
        variantQuantities.kids += product.required ?? 0;
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
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'CandleList.xlsx');
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
        dataField="no_jewel"
        caption="NO JEWEL"
      />
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
        dataField="kids"
        caption="KIDS"
      />
      <Column dataField="TOTAL" caption="Total" />
      <Summary>
        <TotalItem column="no_jewel" summaryType="sum" />
        <TotalItem column="L_M" summaryType="sum" />
        <TotalItem column="N_O" summaryType="sum" />
        <TotalItem column="P_Q" summaryType="sum" />
        <TotalItem column="R_S" summaryType="sum" />
        <TotalItem column="NK" summaryType="sum" />
        <TotalItem column="ER" summaryType="sum" />
        <TotalItem column="kids" summaryType="sum" />
        <TotalItem column="TOTAL" summaryType="sum" />
      </Summary>
      <MasterDetail render={renderDetail} />
      <Export enabled={true} />
    </DataGrid>
  );
};

export default BathProductsGrid;
