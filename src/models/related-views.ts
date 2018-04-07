import {DEFAULT_VOYAGER_CONFIG} from './config';

export interface RelatedViews {
  isHidden: boolean;
};

export const DEFAULT_RELATED_VIEWS: RelatedViews = {
  isHidden: DEFAULT_VOYAGER_CONFIG.hideRelatedViews
};
