"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var channel_1 = require("vega-lite/build/src/channel");
var util_1 = require("vega-lite/build/src/util");
var vlSchema = require("vega-lite/build/vega-lite-schema.json");
function isStringSchema(schema) {
    return schema.type === 'string';
}
exports.isStringSchema = isStringSchema;
// Currently supported customizble encoding channels that display caret in customizer UI
exports.CUSTOMIZABLE_ENCODING_CHANNELS = [channel_1.Channel.X, channel_1.Channel.Y, channel_1.Channel.COLOR, channel_1.Channel.SIZE, channel_1.Channel.SHAPE];
// ------------------------------------------------------------------------------
// Channel-Field Indexes for custom encoding
// Key is Tab name, value is list of fieldDef properties
// ------------------------------------------------------------------------------
var AXIS_ORIENT_TITLE = ['title', 'orient'].map(function (p) { return ({ prop: 'axis', nestedProp: p }); });
var LEGEND_ORIENT_TITLE = ['orient', 'title'].map(function (p) { return ({ prop: 'legend', nestedProp: p }); });
var POSITION_FIELD_NOMINAL_INDEX = {
    'Common': [
        {
            prop: 'scale',
            nestedProp: 'type'
        }
    ].concat(AXIS_ORIENT_TITLE)
};
var POSITION_FIELD_TEMPORAL_INDEX = POSITION_FIELD_NOMINAL_INDEX;
var POSITION_FIELD_QUANTITATIVE_INDEX = {
    'Common': POSITION_FIELD_NOMINAL_INDEX.Common.concat([
        { prop: 'stack' }
    ])
};
var COLOR_CHANNEL_FIELD_INDEX = {
    'Legend': ['orient', 'title', 'type'].map(function (p) { return ({ prop: 'legend', nestedProp: p }); }),
    'Scale': ['type', 'domain', 'scheme'].map(function (p) { return ({ prop: 'scale', nestedProp: p }); })
};
var SIZE_CHANNEL_FIELD_INDEX = {
    'Legend': ['orient', 'title'].map(function (p) { return ({ prop: 'legend', nestedProp: p }); }),
    'Scale': ['type', 'domain', 'range'].map(function (p) { return ({ prop: 'scale', nestedProp: p }); })
};
var SHAPE_CHANNEL_FIELD_INDEX = {
    'Legend': LEGEND_ORIENT_TITLE,
    'Scale': ['domain', 'range'].map(function (p) { return ({ prop: 'scale', nestedProp: p }); })
};
// ------------------------------------------------------------------------------
// Color Scheme Constants
// ------------------------------------------------------------------------------
exports.CATEGORICAL_COLOR_SCHEMES = ['accent', 'category10', 'category20', 'category20b', 'category20c', 'dark2',
    'paired', 'pastel1', 'pastel1', 'set1', 'set2', 'set3', 'tableau10', 'tableau20'];
exports.SEQUENTIAL_COLOR_SCHEMES = ['blues', 'greens', 'greys', 'purples', 'reds', 'oranges', 'viridis', 'inferno',
    'magma', 'plasma', 'bluegreen', 'bluepurple', 'greenblue', 'orangered', 'blueorange'];
// ------------------------------------------------------------------------------
// Generator/Factory Methods
// ------------------------------------------------------------------------------
function generatePropertyEditorSchema(prop, nestedProp, propTab, fieldDef, channel) {
    var title = generateTitle(prop, nestedProp, propTab);
    var propertyKey = nestedProp ? prop + '_' + nestedProp : prop;
    switch (prop) {
        case 'scale':
            var scaleTypes = getSupportedScaleTypes(channel, fieldDef);
            return generateScaleEditorSchema(nestedProp, scaleTypes, fieldDef, title, propertyKey);
        case 'axis':
            return generateAxisEditorSchema(nestedProp, channel, title, propertyKey);
        case 'stack':
            return generateSelectSchema('stack', vlSchema.definitions.StackOffset.enum, title);
        case 'legend':
            return generateLegendEditorSchema(nestedProp, title, propertyKey);
        case 'format':
            return generateTextBoxSchema('format', '', title, 'string');
        default:
            throw new Error('Property combination not recognized');
    }
}
exports.generatePropertyEditorSchema = generatePropertyEditorSchema;
function generateLegendEditorSchema(legendProp, title, propertyKey) {
    switch (legendProp) {
        case 'orient':
            return generateSelectSchema(propertyKey, vlSchema.definitions.LegendOrient.enum, title);
        case 'title':
            return generateTextBoxSchema(propertyKey, '', title, 'string');
        case 'type':
            return generateSelectSchema(propertyKey, vlSchema.definitions.Legend.properties.type.enum, title);
        default:
            throw new Error('Property combination not recognized');
    }
}
function generateAxisEditorSchema(axisProp, channel, title, propertyKey) {
    switch (axisProp) {
        case 'orient':
            return generateSelectSchema(propertyKey, channel === 'y' ? ['left', 'right'] : ['top', 'bottom'], title);
        case 'title':
            return generateTextBoxSchema(propertyKey, '', title, 'string');
        default:
            throw new Error('Property combination not recognized');
    }
}
function generateScaleEditorSchema(scaleProp, scaleTypes, fieldDef, title, propertyKey) {
    switch (scaleProp) {
        case 'type':
            return generateSelectSchema(propertyKey, scaleTypes, title);
        case 'scheme':
            return generateSelectSchema(propertyKey, isContinuous(fieldDef) ? exports.SEQUENTIAL_COLOR_SCHEMES :
                exports.CATEGORICAL_COLOR_SCHEMES, title);
        case 'range':
        case 'domain':
            return generateTextBoxSchema(propertyKey, isDiscrete(fieldDef) ?
                'a, b, c, ...' : 'Min Number, Max Number', title, 'string');
        default:
            throw new Error('Provided property is not supported');
    }
}
// TODO: Eventually refactor to Vega-Lite
function getSupportedScaleTypes(channel, fieldDef) {
    switch (fieldDef.type) {
        case expandedtype_1.ExpandedType.QUANTITATIVE:
            if (util_1.contains([channel_1.Channel.X, channel_1.Channel.Y], channel)) {
                return ["linear", "log", "pow", "sqrt"];
            }
            else if (channel === channel_1.Channel.COLOR) {
                return ["linear", "pow", "sqrt", "log", "sequential"];
            }
            else if (channel === channel_1.Channel.SIZE) {
                return ["linear", "pow", "sqrt", "log"];
            }
            else {
                return [];
            }
        case expandedtype_1.ExpandedType.ORDINAL:
        case expandedtype_1.ExpandedType.NOMINAL:
            if (util_1.contains([channel_1.Channel.X, channel_1.Channel.Y], channel)) {
                return ["point", "band"];
            }
            else if (channel === channel_1.Channel.COLOR) {
                return ["ordinal"];
            }
            else if (channel === channel_1.Channel.SIZE) {
                return ["point", "band"];
            }
            else {
                return [];
            }
        case expandedtype_1.ExpandedType.TEMPORAL:
            if (util_1.contains([channel_1.Channel.X, channel_1.Channel.Y], channel)) {
                return ["time", "utc"];
            }
            else if (channel === channel_1.Channel.COLOR) {
                return ["time", "utc", "sequential"];
            }
            else if (channel === channel_1.Channel.SIZE) {
                return ["time", "utc"];
            }
            else {
                return [];
            }
        default:
            return [];
    }
}
function generateSelectSchema(propertyKey, enumVals, title) {
    var schema = {
        type: 'object',
        properties: (_a = {},
            _a[propertyKey] = {
                type: 'string',
                title: title,
                enum: enumVals
            },
            _a)
    };
    var uiSchema = (_b = {},
        _b[propertyKey] = {
            'ui:widget': 'select',
            'ui:placeholder': 'auto',
            'ui:emptyValue': 'auto'
        },
        _b);
    return { schema: schema, uiSchema: uiSchema };
    var _a, _b;
}
function generateTextBoxSchema(propKey, placeHolderText, title, primitiveType) {
    var schema = {
        type: 'object',
        properties: (_a = {},
            _a[propKey] = {
                title: title,
                type: primitiveType
            },
            _a)
    };
    var uiSchema = (_b = {},
        _b[propKey] = {
            'ui:emptyValue': '',
            'ui:placeholder': placeHolderText
        },
        _b);
    return { schema: schema, uiSchema: uiSchema };
    var _a, _b;
}
function getFieldPropertyGroupIndex(shelfId, fieldDef) {
    if (fieldDef && (shelfId.channel === channel_1.Channel.X || shelfId.channel === channel_1.Channel.Y)) {
        switch (fieldDef.type) {
            case expandedtype_1.ExpandedType.QUANTITATIVE:
                if (!isContinuous(fieldDef)) {
                    return POSITION_FIELD_QUANTITATIVE_INDEX.Common.filter(function (t) {
                        return t.prop !== "stack";
                    });
                }
                return POSITION_FIELD_QUANTITATIVE_INDEX;
            case expandedtype_1.ExpandedType.ORDINAL:
                return POSITION_FIELD_NOMINAL_INDEX;
            case expandedtype_1.ExpandedType.NOMINAL:
                return POSITION_FIELD_NOMINAL_INDEX;
            case expandedtype_1.ExpandedType.TEMPORAL:
                return POSITION_FIELD_TEMPORAL_INDEX;
        }
    }
    else if (shelfId.channel === channel_1.Channel.COLOR) {
        return COLOR_CHANNEL_FIELD_INDEX;
    }
    else if (shelfId.channel === channel_1.Channel.SIZE) {
        return SIZE_CHANNEL_FIELD_INDEX;
    }
    else if (shelfId.channel === channel_1.Channel.SHAPE) {
        return SHAPE_CHANNEL_FIELD_INDEX;
    }
}
exports.getFieldPropertyGroupIndex = getFieldPropertyGroupIndex;
function generateFormData(shelfId, fieldDef) {
    var index = getFieldPropertyGroupIndex(shelfId, fieldDef);
    var formDataIndex = {};
    for (var _i = 0, _a = Object.keys(index); _i < _a.length; _i++) {
        var key = _a[_i];
        for (var _b = 0, _c = index[key]; _b < _c.length; _b++) {
            var customProp = _c[_b];
            var prop = customProp.prop;
            var nestedProp = customProp.nestedProp;
            var propertyKey = nestedProp ? prop + '_' + nestedProp : prop;
            var formData = fieldDef[prop] ? nestedProp ? fieldDef[prop][nestedProp] : fieldDef[prop] : undefined;
            // Display empty string when '?' is passed in to retrieve default value
            // '?' is passed when formData is empty to avoid passing in empty string as a property/nestedProp value
            formDataIndex[propertyKey] = formData === undefined ? '' : formData;
        }
    }
    return formDataIndex;
}
exports.generateFormData = generateFormData;
// ------------------------------------------------------------------------------
// General-Purpose Helper Methods
// ------------------------------------------------------------------------------
function isContinuous(fieldDef) {
    return util_1.contains([expandedtype_1.ExpandedType.ORDINAL, expandedtype_1.ExpandedType.TEMPORAL, expandedtype_1.ExpandedType.QUANTITATIVE], fieldDef.type);
}
exports.isContinuous = isContinuous;
function isDiscrete(fieldDef) {
    return !isContinuous(fieldDef);
}
exports.isDiscrete = isDiscrete;
// Capitalize first letter for aesthetic purposes in form
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
// Generate title for react-form with appropriate casing, prop, nestedProp
function generateTitle(prop, nestedProp, propTab) {
    var title;
    if (propTab === 'Common') {
        title = nestedProp ? prop + ' ' + nestedProp : prop;
    }
    else {
        title = nestedProp || prop;
    }
    return toTitleCase(title);
}
//# sourceMappingURL=property-editor-schema.js.map