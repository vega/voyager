export interface VoyagerConfig {
  showDataSourceSelector?: boolean;
  serverUrl?: string | null;
  hideHeader?: boolean;
  hideFooter?: boolean;
  relatedViews?: 'disabled' | 'initiallyCollapsed' | 'initiallyShown';
};

export const DEFAULT_VOYAGER_CONFIG: VoyagerConfig = {
  showDataSourceSelector: true,
  serverUrl: null,
  hideHeader: false,
  hideFooter: false,
  relatedViews: 'initiallyShown'
};
