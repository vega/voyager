/// <reference types="react" />
import * as React from 'react';
import { Data } from 'vega-lite/build/src/data';
import '../app.scss';
export interface AppRootProps {
    data: Data;
}
export declare const AppRoot: React.ComponentClass<{}>;
