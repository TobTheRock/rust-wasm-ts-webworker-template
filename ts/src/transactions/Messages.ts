import { Command, RequestData, ResponseData, TransactionId } from "./Transactions";

export interface RequestMessage { readonly command: Command, readonly id: TransactionId, requestData: RequestData };

export interface ResponseResultMessage { readonly id: number, responseData: ResponseData };
export interface ResponseErrorMessage {
    readonly id: number, error: any
}
export type ResponseMessage = ResponseErrorMessage | ResponseResultMessage;

export function isResponseMessage(message: any): message is ResponseMessage {
    return "id" in message && (isResponseResultMessage(message) || isResponseErrorMessage(message));
}
export function isResponseResultMessage(message: ResponseMessage): message is ResponseResultMessage {
    return "result" in message;
}
export function isResponseErrorMessage(message: ResponseMessage): message is ResponseErrorMessage {
    return "error" in message;
}