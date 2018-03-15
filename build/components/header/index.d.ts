/// <reference types="react" />
import * as React from 'react';
import { InlineData } from 'vega-lite/build/src/data';
export interface HeaderProps {
    data: InlineData;
}
export declare class HeaderBase extends React.PureComponent<HeaderProps, {}> {
    render(): JSX.Element;
    private openLink();
}
export declare const Header: React.ComponentClass<{}>;
