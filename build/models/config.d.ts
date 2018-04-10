export interface VoyagerConfig {
    showDataSourceSelector?: boolean;
    serverUrl?: string | null;
    hideHeader?: boolean;
    hideFooter?: boolean;
    relatedViews?: 'disabled' | 'initiallyCollapsed' | 'initiallyShown';
}
export declare const DEFAULT_VOYAGER_CONFIG: VoyagerConfig;
