import Base64Worker from "./Base64Worker.js";
import {  RequestMessage, ResponseMessage, TransactionInitiator } from "./Transactions";

let workerBlobUrl = "";
function getWorkerBlobUrl() {
    if (!workerBlobUrl) {
        const blob = new Blob([window.atob(Base64Worker)], {
            type: "application/javascript",
        });
        workerBlobUrl = URL.createObjectURL(blob);
    }
    return workerBlobUrl;
}

export interface Client {
    initialize(): Promise<void>;
    close(): void;
    exampleAskDeepThought(question: string): Promise<number>;
}

export class ClientImplementation implements Client {
    private _transactionInitiator: TransactionInitiator;
    private _worker: Worker;

    constructor() {
        this._transactionInitiator = new TransactionInitiator();
        this._worker = new Worker(getWorkerBlobUrl(), {
            name: `Worker`,
        });

        this._worker.addEventListener("error", (event) => {
            console.error(
                "[Client] Received error from [Worker], event=",
                event
            );
            throw event.error;
        });

        this._worker.addEventListener("message", async (event) => {
            const message = event.data as ResponseMessage;
            console.info(
                "[Client] Received message from [Worker], message=",
                JSON.stringify(message)
            );
            this._transactionInitiator.concludeTransaction(message);
        });
    }

    async initialize(): Promise<void> {
        const [message, promise] = this._transactionInitiator.initiateTransaction("initialize");
        this.postMessage(message, []);
        return promise;
    }

    close() {
        this._transactionInitiator.abortAllOngoing();
        this._worker.terminate();
    }

    async exampleAskDeepThought(question: string): Promise<number> {
        const [message, promise] = this._transactionInitiator.initiateTransaction("example_ask_deep_thought", question);
        this.postMessage(message);
        return promise;
    }

    private postMessage(
        message: RequestMessage,
        transferList: Transferable[] = []
    )  {
        console.info(
            "[Client] Post message to [Worker]",
            JSON.stringify(message),
            transferList
        );
        this._worker.postMessage(message, transferList);
    }
}

export async function createClient(
): Promise<Client> {
    const client = new ClientImplementation();
    await client.initialize();
    return client;
}
