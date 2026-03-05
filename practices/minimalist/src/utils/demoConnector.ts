import { VBI } from '@visactor/vbi';
import {
  VQuery,
  type DatasetColumn,
  type RawDatasetSource,
  type VQueryDSL,
} from '@visactor/vquery';

export const connectorId = 'demo';

export const registerDemoConnector = () => {
  const vquery = new VQuery();
  VBI.registerConnector(connectorId, async () => {
    return {
      discoverSchema: async () => {
        return [
          { name: 'id', type: 'string' },
          { name: 'order_id', type: 'string' },
          { name: 'order_date', type: 'date' },
          { name: 'delivery_date', type: 'date' },
          { name: 'delivery_method', type: 'string' },
          { name: 'customer_id', type: 'string' },
          { name: 'customer_name', type: 'string' },
          { name: 'customer_type', type: 'string' },
          { name: 'city', type: 'string' },
          { name: 'province', type: 'string' },
          { name: 'country_or_region', type: 'string' },
          { name: 'area', type: 'string' },
          { name: 'product_id', type: 'string' },
          { name: 'product_type', type: 'string' },
          { name: 'product_sub_type', type: 'string' },
          { name: 'product_name', type: 'string' },

          { name: 'sales', type: 'number' },
          { name: 'amount', type: 'number' },
          { name: 'discount', type: 'number' },
          { name: 'profit', type: 'number' },
        ];
      },
      query: async ({ queryDSL, schema }) => {
        if (!(await vquery.hasDataset(connectorId))) {
          const url = 'https://visactor.github.io/VBI/dataset/supermarket.csv';
          const datasetSource = { type: 'csv', rawDataset: url };
          await vquery.createDataset(
            connectorId,
            schema as DatasetColumn[],
            datasetSource as RawDatasetSource,
          );
        }
        const dataset = await vquery.connectDataset(connectorId);
        const queryResult = await dataset.query(
          queryDSL as VQueryDSL<Record<string, string | number>>,
        );

        // Map field names back to alias names for application layer
        let normalizedDataset = queryResult.dataset;
        if (queryDSL.select && Array.isArray(queryDSL.select)) {
          const fieldToAliasMap: Record<string, string> = {};
          const stringFields: Set<string> = new Set();
          
          for (const item of queryDSL.select) {
            if (typeof item === 'string') {
              stringFields.add(item);
            } else if (typeof item === 'object' && item !== null) {
              const field = (item as any).field;
              const alias = (item as any).alias;
              if (field && alias) {
                fieldToAliasMap[field] = alias;
              }
            }
          }

          if (Object.keys(fieldToAliasMap).length > 0 || stringFields.size > 0) {
            normalizedDataset = queryResult.dataset.map((row) => {
              const next: Record<string, any> = {};
              for (const [key, value] of Object.entries(row)) {
                const newKey = fieldToAliasMap[key] || key;
                next[newKey] = value;
              }
              return next;
            });
          }
        }

        return {
          dataset: normalizedDataset,
        };
      },
    };
  });
  return connectorId;
};

registerDemoConnector();
export const defaultBuilder = VBI.from(VBI.generateEmptyDSL(connectorId));
