
export function constructLogString(inputLogs: Array<{action: {type: string, payload: any}, timestamp: number}>):
  Array<{type: string, timestamp: number, payload: string}> {
  const outputLogs = [];
  for (const inputLog of inputLogs) {
    outputLogs.push({
      timestamp: inputLog.timestamp,
      type: inputLog.action.type,
      payload: JSON.stringify(inputLog.action.payload)
    });
  }
  return outputLogs;
};
