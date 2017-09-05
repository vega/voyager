export interface VoyagerConfig {
  showDataSourceSelector?: boolean;
  serverUrl?: string | null;
  manualSpecificationOnly?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
};

export const DEFAULT_VOYAGER_CONFIG: VoyagerConfig = {
  showDataSourceSelector: true,
  serverUrl: null,
  manualSpecificationOnly: false,
  hideHeader: false,
  hideFooter: false
};
