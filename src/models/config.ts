export interface VoyagerConfig {
  showDataSourceSelector?: boolean;
  serverUrl?: string | null;
  hideHeader?: boolean;
  hideFooter?: boolean;
  relatedViews?: 'initiallyCollapsed' | 'initiallyShown' | 'disabled';
  wildcards?: 'enabled' | 'disabled';
};

export const DEFAULT_VOYAGER_CONFIG: VoyagerConfig = {
  showDataSourceSelector: true,
  serverUrl: null,
  hideHeader: false,
  hideFooter: false,
  relatedViews: 'initiallyShown',
  wildcards: 'enabled'
};
