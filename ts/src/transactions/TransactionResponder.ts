import { Command, RequestDataFromCommand, ResponseData, ResponseDataFromCommand } from "./Transactions";

type ResponseAction<Cmd extends Command> = (requestData: RequestDataFromCommand<Cmd>) => ResponseDataFromCommand<Cmd> | PromiseLike<ResponseDataFromCommand<Cmd>>;
type ResponseActions = {
    [Cmd in Command]?: ResponseAction<Cmd> | undefined;
}

export class TransactionResponder {
     private _responseActions: ResponseActions = {};

    addResponseAction<Cmd extends Command>(command:Cmd, action: ResponseAction<Cmd>) {
        (this._responseActions[command] as ResponseAction<Cmd>) = action;
    };
    
    async createResponse<Cmd extends Command>(command:Cmd, requestData: RequestDataFromCommand<Cmd>): Promise<ResponseData> {
        const action = this._responseActions[command];
        if (!action) {
            throw new Error(`[Worker] No action registered for command: ${command}`);
        }
        return action(requestData);
    } 
}