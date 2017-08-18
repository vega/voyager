export interface VoyagerConfig {
  showDataSourceSelector?: boolean;
  serverUrl?: string | null;
  manualSpecificationOnly?: boolean;
};

export const DEFAULT_VOYAGER_CONFIG: VoyagerConfig = {
  showDataSourceSelector: true,
  serverUrl: null,
  manualSpecificationOnly: true
};
