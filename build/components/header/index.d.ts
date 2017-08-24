/// <reference types="react" />
import * as React from 'react';
import { Dataset } from '../../models/dataset';
export interface HeaderProps {
    data: Dataset;
}
export declare class HeaderBase extends React.PureComponent<HeaderProps, {}> {
    render(): JSX.Element;
    private openLink();
}
export declare const Header: React.ComponentClass<{}>;
