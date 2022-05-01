import {RequestMessage, ResponseMessage, isResponseErrorMessage } from "./Messages";
import { Command, Transactions, TransactionId, RequestDataFromCommand, ResponseDataFromCommand,  } from "./Transactions";

type CommandsWithoutRequestData = Exclude<Transactions, {request: any} >["command"];
type CommandsWithRequestData = Extract<Transactions, {request: any} >["command"];
type TransactionResult<Cmd extends Command> = {
    onData: (value: ResponseDataFromCommand<Cmd> | PromiseLike<ResponseDataFromCommand<Cmd>>) => void;
    onError: (reason?: any) => void;
}
type ResultPromise<Cmd extends Command> = Promise<ResponseDataFromCommand<Cmd>>;

export class TransactionInitiator {
    private _ongoingTransactions: Map<TransactionId, TransactionResult<Command>> = new Map();
    private _currentId: TransactionId = 0;

    initiateTransaction<Cmd extends CommandsWithRequestData>(command: Cmd, requestData: RequestDataFromCommand<Cmd>): [RequestMessage, ResultPromise<Cmd>];
    initiateTransaction<Cmd extends CommandsWithoutRequestData>(command: Cmd): [RequestMessage, ResultPromise<Cmd>];
    initiateTransaction<Cmd extends Command>(command: Cmd, requestData?: RequestDataFromCommand<Cmd>): [RequestMessage, ResultPromise<Cmd>] {
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