type InitializeTransaction = {
    command: "initialize"
    request: void
    response: void;
}

type ExampleAskDeepThoughtTransaction = {
    command: "example_ask_deep_thought"
    request: string
    response: number;
}

type Transactions = InitializeTransaction | ExampleAskDeepThoughtTransaction;

export type Command = Transactions["command"];
export type RequestData = Transactions["request"];
export type ResponseData = Transactions["response"];

export type TransactionId = number;
export interface RequestMessage { readonly command: Command, readonly id: number, requestData: RequestData };
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

type TransactionFieldFromCommand<Cmd extends Command, Field extends keyof Transactions> = Extract<Transactions, { command: Cmd }>[Field];
type RequestDataFromCommand<Cmd extends Command> = TransactionFieldFromCommand<Cmd, "request">;
type ResponseDataFromCommand<Cmd extends Command> = TransactionFieldFromCommand<Cmd, "response">;


type TransactionResult<Cmd extends Command> = {
    onData: (value: ResponseDataFromCommand<Cmd> | PromiseLike<ResponseDataFromCommand<Cmd>>) => void;
    onError: (reason?: any) => void;
}
type ResultPromise<Cmd extends Command> = Promise<ResponseDataFromCommand<Cmd>>;
 export class TransactionInitiator {
    private _ongoingTransactions: Map<TransactionId, TransactionResult<Command>> = new Map();
    private _currentId: TransactionId = 0;

    initiateTransaction<Cmd extends Command>(command: Cmd, requestData: RequestDataFromCommand<Cmd>): [RequestMessage, ResultPromise<Cmd>] {
        const id = this._currentId++;
        const message: RequestMessage = {id, command, requestData};
        const promise:ResultPromise<Cmd> = new Promise((resolve, reject) => {
            const transactionResult: TransactionResult<Cmd> = {onData: resolve, onError: reject};
            this._ongoingTransactions.set(id, transactionResult as any);
        }); 
        return [message, promise];
    }

    concludeTransaction(message: ResponseMessage) {
        const transaction = this._ongoingTransactions.get(message.id);
        if (!transaction) {
            console.error(`[Client] no transaction with id ${message.id}`);
            return;
        }
        this._ongoingTransactions.delete(message.id);

        if (isResponseErrorMessage(message)) {
            console.error("[Client] Received error, data=", message);
            transaction.onError(new Error(message.error));
        } else {
            console.info(
                "[Client] Resolved worker promise, id=",
                message.id
            );
            const responseData = message.responseData;
            transaction.onData(responseData);
        }
    }

    abortAllOngoing() {
        this._ongoingTransactions.forEach((transaction) => {
            transaction.onError(new Error("Client is closing down."));
        })
        this._ongoingTransactions.clear();
    }
}

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