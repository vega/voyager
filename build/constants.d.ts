import { VoyagerConfig } from './models/config';
export declare const HISTORY_LIMIT = 20;
export declare const PLOT_HOVER_MIN_DURATION = 500;
/**
 * Types of draggable items (for react-dnd).
 */
export declare const DraggableType: {
    FIELD: string;
};
/**
 * Type of parent for Field Component
 */
export declare enum FieldParentType {
    ENCODING_SHELF = 0,
    FIELD_LIST = 1,
}
export declare const SPINNER_COLOR = "#4C78A8";
export declare const DEFAULT_DATASETS: ({
    url: string;
    name: string;
    description: string;
    id: string;
    group: string;
} | {
    url: string;
    name: string;
    id: string;
    group: string;
})[];
export declare const VOYAGER_CONFIG: VoyagerConfig;
