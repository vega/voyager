export interface VoyagerConfig {
  showDataSourceSelector?: boolean;
  serverUrl?: string | null;
};

export const DEFAULT_VOYAGER_CONFIG: VoyagerConfig = {
  showDataSourceSelector: true,
  serverUrl: null
};
