export interface VoyagerConfig {
  showDataSourceSelector?: boolean;
  serverUrl?: string | null;
  hideHeader?: boolean;
  hideFooter?: boolean;
  relatedViews?: 'alwaysHidden' | 'initiallyHidden' | 'initiallyShown';
};

export const DEFAULT_VOYAGER_CONFIG: VoyagerConfig = {
  showDataSourceSelector: true,
  serverUrl: null,
  hideHeader: false,
  hideFooter: false,
  relatedViews: 'initiallyHidden'
};
