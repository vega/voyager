/// <reference types="react" />
import * as React from 'react';
import { VoyagerConfig } from '../../models/config';
import { Dataset } from '../../models/dataset';
import '../app.scss';
export interface AppRootProps {
    dataset: Dataset;
    config: VoyagerConfig;
}
export declare const AppRoot: React.ComponentClass<{}>;
