import {Channel} from "vega-lite/build/src/channel";
import {ShelfId, ShelfValueDef} from "../../models";
import {generateColorPickerSchema, generateSelectSchema,
  generateSliderSchema, generateTextBoxSchema} from "./property-editor-schema";

const SHAPE_VALUES = ['circle', 'square', 'cross', 'diamond', 'triangle-up', 'triangle-down', ];

export function generateValueDefFormData(shelfId: ShelfId, valueDef: ShelfValueDef) {
  return {[shelfId.channel.toString()]: valueDef ? valueDef.value : undefined};
}

export function generateValueEditorSchema(channel: Channel): any {
  switch (channel) {
    case 'color':
      return generateColorPickerSchema(channel, 'Color Value');
    case 'shape':
      return generateSelectSchema(channel, SHAPE_VALUES, 'Shape Value');
    case 'text':
      return generateTextBoxSchema(channel, 'Some Text...', undefined, 'string');
    case 'size':
      return generateSliderSchema(channel, 1, 100, 'Size Value');
    default:
      return {};
  }
}
