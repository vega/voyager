import {isInlineData} from 'vega-lite/build/src/data';
import {DATASET_RECEIVE} from '../actions/dataset';


export function constructLogString(inputLogs: Array<{action: {type: string, payload: any}, timestamp: number}>):
  Array<{type: string, timestamp: number, ISOString: string, payload: string}> {
  const outputLogs = [];
  for (const inputLog of inputLogs) {
    const type = inputLog.action.type;
    let payload: any = inputLog.action.payload;
    if (type === DATASET_RECEIVE && isInlineData(payload.data)) {
      // don't output inline data because it might make the log file too big
      payload = {
        ...payload,
        data: {name: 'source'}
      };
    }
    outputLogs.push({
      timestamp: inputLog.timestamp,
      ISOString: new Date(inputLog.timestamp).toISOString(),
      type,
      payload: JSON.stringify(payload)
    });
  }
  return outputLogs;
};
