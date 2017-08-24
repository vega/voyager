"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_redux_1 = require("react-redux");
var undo_redo_1 = require("../../actions/undo-redo");
var UndoRedoBase = (function (_super) {
    __extends(UndoRedoBase, _super);
    function UndoRedoBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UndoRedoBase.prototype.render = function () {
        var _a = this.props, canUndo = _a.canUndo, canRedo = _a.canRedo, onUndo = _a.onUndo, onRedo = _a.onRedo;
        return (React.createElement("div", null,
            React.createElement("button", { onClick: onUndo, disabled: !canUndo },
                React.createElement("i", { className: 'fa fa-undo' }),
                " Undo"),
            React.createElement("button", { onClick: onRedo, disabled: !canRedo },
                React.createElement("i", { className: 'fa fa-repeat' }),
                " Redo")));
    };
    return UndoRedoBase;
}(React.PureComponent));
exports.UndoRedo = react_redux_1.connect(function (state) {
    return {
        canUndo: state.undoable.past.length > 0,
        canRedo: state.undoable.future.length > 0
    };
}, function (dispatch) { return ({
    onUndo: function () {
        dispatch({ type: undo_redo_1.UNDO });
    },
    onRedo: function () {
        dispatch({ type: undo_redo_1.REDO });
    }
}); })(UndoRedoBase);
//# sourceMappingURL=undo-redo.js.map