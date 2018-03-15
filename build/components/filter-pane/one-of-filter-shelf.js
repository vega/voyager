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
var CSSModules = require("react-css-modules");
var actions_1 = require("../../actions");
var util_1 = require("../../reducers/util");
var styles = require("./one-of-filter-shelf.scss");
var OneOfFilterShelfBase = (function (_super) {
    __extends(OneOfFilterShelfBase, _super);
    function OneOfFilterShelfBase(props) {
        var _this = _super.call(this, props) || this;
        _this.state = ({
            hideSearchBar: true
        });
        return _this;
    }
    OneOfFilterShelfBase.prototype.render = function () {
        var _this = this;
        var _a = this.props, domain = _a.domain, filter = _a.filter, index = _a.index;
        var oneOfFilter = domain.map(function (option) {
            return (React.createElement("div", { key: option, className: 'option-div', styleName: 'option-row' },
                React.createElement("label", null,
                    React.createElement("input", { name: index.toString(), value: option, type: 'checkbox', checked: filter.oneOf.indexOf(option) !== -1, onChange: _this.toggleCheckbox.bind(_this, option) }),
                    " ",
                    '' + option),
                React.createElement("span", { onClick: _this.onSelectOne.bind(_this, option), styleName: 'keep-only' }, "Keep Only")));
        });
        return (React.createElement("div", { id: index.toString() },
            React.createElement("div", { styleName: 'below-header' },
                React.createElement("span", null,
                    React.createElement("a", { styleName: 'select-all', onClick: this.onSelectAll.bind(this) }, "Select All"),
                    " /",
                    React.createElement("a", { styleName: 'clear-all', onClick: this.onClearAll.bind(this) }, "Clear All")),
                this.state.hideSearchBar ?
                    null :
                    React.createElement("input", { type: 'text', onChange: this.onSearch.bind(this), autoFocus: true }),
                React.createElement("a", { styleName: 'search', onClick: this.onClickSearch.bind(this) },
                    React.createElement("i", { className: 'fa fa-search' }))),
            oneOfFilter));
    };
    OneOfFilterShelfBase.prototype.filterModifyOneOf = function (index, oneOf) {
        var handleAction = this.props.handleAction;
        handleAction({
            type: actions_1.FILTER_MODIFY_ONE_OF,
            payload: {
                index: index,
                oneOf: oneOf
            }
        });
    };
    OneOfFilterShelfBase.prototype.toggleCheckbox = function (option) {
        var oneOf = this.props.filter.oneOf;
        var valueIndex = oneOf.indexOf(option);
        var changedSelectedValues;
        if (valueIndex === -1) {
            changedSelectedValues = util_1.insertItemToArray(oneOf, oneOf.length, option);
        }
        else {
            changedSelectedValues = util_1.removeItemFromArray(oneOf, valueIndex).array;
        }
        this.filterModifyOneOf(this.props.index, changedSelectedValues);
    };
    OneOfFilterShelfBase.prototype.onSelectOne = function (value) {
        var index = this.props.index;
        this.filterModifyOneOf(index, [value]);
    };
    OneOfFilterShelfBase.prototype.onSelectAll = function () {
        var _a = this.props, domain = _a.domain, index = _a.index;
        this.filterModifyOneOf(index, domain.slice());
    };
    OneOfFilterShelfBase.prototype.onClearAll = function () {
        var index = this.props.index;
        this.filterModifyOneOf(index, []);
    };
    OneOfFilterShelfBase.prototype.onClickSearch = function () {
        if (!this.state.hideSearchBar) {
            var divs = this.getDivs();
            Array.prototype.forEach.call(divs, function (div) {
                div.style.display = 'block';
            });
        }
        this.setState({
            hideSearchBar: !this.state.hideSearchBar
        });
    };
    OneOfFilterShelfBase.prototype.onSearch = function (e) {
        var searchedDivs = this.getDivs();
        Array.prototype.forEach.call(searchedDivs, function (searchedDiv) {
            // its first child is label, the label's child is checkbox input
            var searchedOption = searchedDiv.childNodes[0].childNodes[0];
            if (searchedOption.value.toLowerCase().indexOf(e.target.value.toLowerCase().trim()) === -1) {
                searchedDiv.style.display = 'none';
            }
            else {
                searchedDiv.style.display = 'block';
            }
        });
    };
    /**
     * returns all div nodes in current filter shelf
     */
    OneOfFilterShelfBase.prototype.getDivs = function () {
        // select the current filter shelf
        var container = document.getElementById(this.props.index.toString());
        // select all divs
        var divs = container.getElementsByClassName('option-div');
        return divs;
    };
    return OneOfFilterShelfBase;
}(React.PureComponent));
exports.OneOfFilterShelfBase = OneOfFilterShelfBase;
exports.OneOfFilterShelf = CSSModules(OneOfFilterShelfBase, styles);
//# sourceMappingURL=one-of-filter-shelf.js.map