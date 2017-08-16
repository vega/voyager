import {FilterAction} from './filter';
import {SpecAction} from './spec';

export * from './filter';
export * from './spec';

export type ShelfAction = FilterAction | SpecAction;
