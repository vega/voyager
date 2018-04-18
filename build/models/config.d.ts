export interface VoyagerConfig {
    showDataSourceSelector?: boolean;
    serverUrl?: string | null;
    hideHeader?: boolean;
    hideFooter?: boolean;
    relatedViews?: 'initiallyCollapsed' | 'initiallyShown' | 'disabled';
    wildcards?: 'enabled' | 'disabled';
}
export declare const DEFAULT_VOYAGER_CONFIG: VoyagerConfig;
