import { ProductDetail, VariantCell, VariantDetail } from '@/interfaces/list.interfaces';
import DataGrid, { Column, Summary, TotalItem, MasterDetail, DataGridTypes, Export } from 'devextreme-react/data-grid';
import VariantListGrid from './VariantListGrid';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid } from 'devextreme/excel_exporter';
import ProdViewQuantityCell from './ProdViewQuantityCell';

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
        L_M: { sku: '', required: 0, completed: 0, stock: 0 } as VariantCell,
        N_O: { sku: '', required: 0, completed: 0, stock: 0 } as VariantCell,
        P_Q: { sku: '', required: 0, completed: 0, stock: 0 } as VariantCell,
        R_S: { sku: '', required: 0, completed: 0, stock: 0 } as VariantCell,
        NK: { sku: '', required: 0, completed: 0, stock: 0 } as VariantCell,
        ER: { sku: '', required: 0, completed: 0, stock: 0 } as VariantCell,
        BR: { sku: '', required: 0, completed: 0, stock: 0 } as VariantCell,
        PIN: { sku: '', required: 0, completed: 0, stock: 0 } as VariantCell,
        CUSTOM: { sku: '', required: 0, completed: 0, stock: 0 } as VariantCell,
        TOTAL: product.required || 0,
        Variants: [] as VariantDetail[],
      };
      if (!product.isBespoke) {
        product.variants?.forEach((variant) => {
          const { description, required, type, sku, completed, took_from_stock } = variant;
          switch (description) {
            case 'Ring Size L/M':
              variantQuantities.L_M.sku = sku;
              variantQuantities.L_M.required = required;
              variantQuantities.L_M.completed = completed;
              variantQuantities.L_M.stock = took_from_stock;

              variantQuantities.type = type ?? '';
              break;
            case 'Ring Size N/O':
              variantQuantities.N_O.sku = sku;
              variantQuantities.N_O.required = required;
              variantQuantities.N_O.completed = completed;
              variantQuantities.N_O.stock = took_from_stock;
              variantQuantities.type = type ?? '';
              break;
            case 'Ring Size P/Q':
              variantQuantities.P_Q.sku = sku;
              variantQuantities.P_Q.required = required;
              variantQuantities.P_Q.completed = completed;
              variantQuantities.P_Q.stock = took_from_stock;
              variantQuantities.type = type ?? '';
              break;
            case 'Ring Size R/S':
              variantQuantities.R_S.sku = sku;
              variantQuantities.R_S.required = required;
              variantQuantities.R_S.completed = completed;
              variantQuantities.R_S.stock = took_from_stock;
              variantQuantities.type = type ?? '';
              break;
            case 'Necklace':
              variantQuantities.NK.sku = sku;
              variantQuantities.NK.required = required;
              variantQuantities.NK.completed = completed;
              variantQuantities.NK.stock = took_from_stock;
              variantQuantities.type = type ?? '';
              break;
            case 'Earrings':
              variantQuantities.ER.sku = sku;
              variantQuantities.ER.required = required;
              variantQuantities.ER.completed = completed;
              variantQuantities.ER.stock = took_from_stock;
              variantQuantities.type = type ?? '';
              break;
            case 'Bracelet':
              variantQuantities.BR.sku = sku;
              variantQuantities.BR.required = required;
              variantQuantities.BR.completed = completed;
              variantQuantities.BR.stock = took_from_stock;
              variantQuantities.type = type ?? '';
              break;
            default:
              if (variant.isBespoke) {
                variantQuantities.CUSTOM.sku = sku;
                variantQuantities.CUSTOM.required = required;
                variantQuantities.CUSTOM.completed = completed;
                variantQuantities.CUSTOM.stock = took_from_stock;
                variantQuantities.type = type ?? '';
              }
              break;
          }
        });
        variantQuantities.TOTAL +=
          variantQuantities.L_M.required +
          variantQuantities.N_O.required +
          variantQuantities.P_Q.required +
          variantQuantities.R_S.required +
          variantQuantities.NK.required +
          variantQuantities.ER.required +
          variantQuantities.BR.required +
          variantQuantities.PIN.required +
          variantQuantities.CUSTOM.required;
      } else {
        variantQuantities.CUSTOM.required = product.required ?? 0;
        variantQuantities.CUSTOM.sku = product.sku ?? '';
        variantQuantities.CUSTOM.completed = product.completed ?? 0;
        variantQuantities.CUSTOM.stock = product.took_from_stock ?? 0;
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
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'BathProducts.xlsx');
      });
    });
  };

  const calculateTotals = (options: DataGridTypes.CustomSummaryInfo) => {
    switch (options.name) {
      case 'L_M':
        switch (options.summaryProcess) {
          case 'start':
            options.totalValue = 0;
            break;
          case 'calculate':
            options.totalValue += options.value.L_M.required;
            break;
          case 'finalize':
            break;
        }
        break;
      case 'N_O':
        switch (options.summaryProcess) {
          case 'start':
            options.totalValue = 0;
            break;
          case 'calculate':
            options.totalValue += options.value.N_O.required;
            break;
          case 'finalize':
            break;
        }
        break;
      case 'P_Q':
        switch (options.summaryProcess) {
          case 'start':
            options.totalValue = 0;
            break;
          case 'calculate':
            options.totalValue += options.value.P_Q.required;
            break;
          case 'finalize':
            break;
        }
        break;
      case 'R_S':
        switch (options.summaryProcess) {
          case 'start':
            options.totalValue = 0;
            break;
          case 'calculate':
            options.totalValue += options.value.R_S.required;
            break;
          case 'finalize':
            break;
        }
        break;
      case 'NK':
        switch (options.summaryProcess) {
          case 'start':
            options.totalValue = 0;
            break;
          case 'calculate':
            options.totalValue += options.value.NK.required;
            break;
          case 'finalize':
            break;
        }
        break;
      case 'ER':
        switch (options.summaryProcess) {
          case 'start':
            options.totalValue = 0;
            break;
          case 'calculate':
            options.totalValue += options.value.ER.required;
            break;
          case 'finalize':
            break;
        }
        break;
      case 'BR':
        switch (options.summaryProcess) {
          case 'start':
            options.totalValue = 0;
            break;
          case 'calculate':
            options.totalValue += options.value.BR.required;
            break;
          case 'finalize':
            break;
        }
        break;
      case 'PIN':
        switch (options.summaryProcess) {
          case 'start':
            options.totalValue = 0;
            break;
          case 'calculate':
            options.totalValue += options.value.PIN.required;
            break;
          case 'finalize':
            break;
        }
        break;
      case 'CUSTOM':
        switch (options.summaryProcess) {
          case 'start':
            options.totalValue = 0;
            break;
          case 'calculate':
            options.totalValue += options.value.CUSTOM.required;
            break;
          case 'finalize':
            break;
        }
        break;
      default:
        break;
    }
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
      {/* <Column dataField="type" caption="Type" /> */}
      <Column cellRender={ProdViewQuantityCell} dataField="L_M" caption="L/M" />
      <Column cellRender={ProdViewQuantityCell} dataField="N_O" caption="N/O" />
      <Column cellRender={ProdViewQuantityCell} dataField="P_Q" caption="P/Q" />
      <Column cellRender={ProdViewQuantityCell} dataField="R_S" caption="R/S" />
      <Column cellRender={ProdViewQuantityCell} dataField="NK" caption="NK" />
      <Column cellRender={ProdViewQuantityCell} dataField="ER" caption="ER" />
      <Column cellRender={ProdViewQuantityCell} dataField="BR" caption="BR" />
      <Column cellRender={ProdViewQuantityCell} dataField="PIN" caption="PIN" />
      <Column cellRender={ProdViewQuantityCell} dataField="CUSTOM" caption="CUSTOM" />
      <Column dataField="TOTAL" caption="Total" />
      <Summary calculateCustomSummary={calculateTotals}>
        <TotalItem summaryType="custom" showInColumn="L_M" displayFormat="{0}" name="L_M" />
        <TotalItem summaryType="custom" showInColumn="N_O" displayFormat="{0}" name="N_O" />
        <TotalItem summaryType="custom" showInColumn="P_Q" displayFormat="{0}" name="P_Q" />
        <TotalItem summaryType="custom" showInColumn="R_S" displayFormat="{0}" name="R_S" />
        <TotalItem summaryType="custom" showInColumn="NK" displayFormat="{0}" name="NK" />
        <TotalItem summaryType="custom" showInColumn="ER" displayFormat="{0}" name="ER" />
        <TotalItem summaryType="custom" showInColumn="BR" displayFormat="{0}" name="BR" />
        <TotalItem summaryType="custom" showInColumn="PIN" displayFormat="{0}" name="PIN" />
        <TotalItem summaryType="custom" showInColumn="CUSTOM" displayFormat="{0}" name="CUSTOM" />
        <TotalItem summaryType="sum" column="TOTAL" />
      </Summary>
      <MasterDetail render={renderDetail} />
      <Export enabled={true} />
    </DataGrid>
  );
};

export default CandleListGrid;
