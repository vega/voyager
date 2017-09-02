export interface EmbedProps {
  hideHeader?: boolean;
  hideFooter?: boolean;
};
export interface VoyagerConfig {
  showDataSourceSelector?: boolean;
  serverUrl?: string | null;
  manualSpecificationOnly?: boolean;
  embedProps?: EmbedProps;
};

export const DEFAULT_VOYAGER_CONFIG: VoyagerConfig = {
  showDataSourceSelector: true,
  serverUrl: null,
  manualSpecificationOnly: false,
  embedProps: {
    hideHeader: false,
    hideFooter: false
  }
};
