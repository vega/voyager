import {ShelfId, ShelfValueDef} from "../../models";

export function generateValueDefFormData(shelfId: ShelfId, valueDef: ShelfValueDef) {
  return {[shelfId.channel.toString()]: valueDef ? valueDef.value : undefined};
}
