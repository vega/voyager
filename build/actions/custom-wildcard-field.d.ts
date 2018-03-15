import { ExpandedType } from 'compassql/build/src/query/expandedtype';
import { ReduxAction } from './redux-action';
export declare type CustomWildcardAction = CustomWildcardAdd | CustomWildcardAddField | CustomWildcardRemove | CustomWildcardRemoveField | CustomWildcardModifyDescription;
export declare const CUSTOM_WILDCARD_ADD = "CUSTOM_WILDCARD_ADD";
export declare type CustomWildcardAdd = ReduxAction<typeof CUSTOM_WILDCARD_ADD, {
    fields: string[];
    type: ExpandedType;
    index?: number;
}>;
export declare const CUSTOM_WILDCARD_REMOVE = "CUSTOM_WILDCARD_REMOVE";
export declare type CustomWildcardRemove = ReduxAction<typeof CUSTOM_WILDCARD_REMOVE, {
    index: number;
}>;
export declare const CUSTOM_WILDCARD_ADD_FIELD = "CUSTOM_WILDCARD_ADD_FIELD";
export declare type CustomWildcardAddField = ReduxAction<typeof CUSTOM_WILDCARD_ADD_FIELD, {
    fields: string[];
    index: number;
}>;
export declare const CUSTOM_WILDCARD_REMOVE_FIELD = "CUSTOM_WILDCARD_REMOVE_FIELD";
export declare type CustomWildcardRemoveField = ReduxAction<typeof CUSTOM_WILDCARD_REMOVE_FIELD, {
    field: string;
    index: number;
}>;
export declare const CUSTOM_WILDCARD_MODIFY_DESCRIPTION = "CUSTOM_WILDCARD_MODIFY_DESCRIPTION";
export declare type CustomWildcardModifyDescription = ReduxAction<typeof CUSTOM_WILDCARD_MODIFY_DESCRIPTION, {
    description: string;
    index: number;
}>;
