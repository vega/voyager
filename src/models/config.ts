import {Config} from 'vega-lite/build/src/config';

export interface VoyagerConfig {
  showDataSourceSelector?: boolean;
  serverUrl?: string | null;
  manualSpecificationOnly?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  vegaliteConfig?: Config;
};

export const DEFAULT_VOYAGER_CONFIG: VoyagerConfig = {
  showDataSourceSelector: true,
  serverUrl: null,
  manualSpecificationOnly: false,
  hideHeader: false,
  hideFooter: false,
  vegaliteConfig: {}
};
