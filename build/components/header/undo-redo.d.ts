/// <reference types="react" />
import * as React from 'react';
export interface UndoRedoProps {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}
export declare const UndoRedo: React.ComponentClass<{}>;
