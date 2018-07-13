import {Channel} from "vega-lite/build/src/channel";
import * as vlSchema from 'vega-lite/build/vega-lite-schema.json';
import {ShelfId, ShelfValueDef} from "../../models";
import {generateColorPickerSchema, generateSelectSchema,
  generateSliderSchema, generateTextBoxSchema} from "./property-editor-schema";

export function generateValueDefFormData(shelfId: ShelfId, valueDef: ShelfValueDef) {
  return {[shelfId.channel.toString()]: valueDef ? valueDef.value : undefined};
}

export function generateValueEditorSchema(channel: Channel): any {
  switch (channel) {
    case 'color':
      return generateColorPickerSchema(channel, undefined);
    case 'shape':
      return generateSelectSchema(channel, (vlSchema as any).definitions.Mark.enum, undefined);
    case 'text':
      return generateTextBoxSchema(channel, 'Some Text...', undefined, 'string');
    case 'size':
      return generateSliderSchema(channel, 1, 100);
    default:
      return {};
  }
}
