export declare function constructLogString(inputLogs: Array<{
    action: {
        type: string;
        payload: any;
    };
    timestamp: number;
}>): Array<{
    type: string;
    timestamp: number;
    ISOString: string;
    payload: string;
}>;
