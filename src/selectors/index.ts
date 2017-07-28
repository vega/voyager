// tslint:disable:no-unused-variable
import {StateWithHistory} from 'redux-undo';
import {Selector} from 'reselect/src/reselect';
import {StateBase} from '../models/index';
// tslint:enable:no-unused-variable

import {State} from '../models';
import {Bookmark} from '../models/bookmark';
import {VoyagerConfig} from '../models/config';

export * from './dataset';
export * from './result';
export * from './shelf';

export const selectBookmark = (state: State): Bookmark => state.present.bookmark;
export const selectConfig = (state: State): VoyagerConfig => state.present.config;
