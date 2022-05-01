/*
* Type definitions for transactions between the client (sending requests with a specific command and arbitrary data)
* and the webworker (responding with arbitrary data).
* Add your own as a type definition here, following the following structure:
*/
type Transaction = {
    command: string;
    request?: any;
    response?: any;
}

type InitializeTransaction = {
    command: "initialize"
}

type ExampleAskDeepThoughtTransaction = {
    command: "example_ask_deep_thought"
    request: string
    response: number;
}

/*
* Finally just expand the following type with the new definitions: 
*/
export type Transactions = InitializeTransaction | ExampleAskDeepThoughtTransaction;

/*
Derivated types:
*/
export type Command = Transactions["command"];
export type RequestData = ExtractRequestFromTransaction<Transactions>;
export type ResponseData = ExtractResponseFromTransaction<Transactions>;
export type TransactionId = number;
export type RequestDataFromCommand<Cmd extends Command> = ExtractRequestFromTransaction<ExtractTransactionFromCommand<Cmd>>;
export type ResponseDataFromCommand<Cmd extends Command> = ExtractResponseFromTransaction<ExtractTransactionFromCommand<Cmd>>;

/*
* Utils:
*/
type ExtractRequestFromTransaction<T extends Transaction> = T extends { request: any } ? T["request"] : void;
type ExtractResponseFromTransaction<T extends Transaction> = T extends { response: any } ? T["response"] : void;
type ExtractTransactionFromCommand<Cmd extends Command> = Extract<Transactions, { command: Cmd }>;