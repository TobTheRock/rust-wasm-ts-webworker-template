import * as wasmlib from "wasm-lib"
import init from "wasm-lib"
import wasmData from "wasm-lib/wasm_lib_bg.wasm"

import { RequestMessage, ResponseMessage, TransactionResponder } from "./transactions";

/*
* Note: For each command from the client which the webworker should respond to, 
* register an action with the TransactionResponder.
*/
const transactionResponder = new TransactionResponder();

transactionResponder.addResponseAction("initialize", async () => {
    console.log("[Worker] loading wasm...");
    await init(wasmData);
    console.log("[Worker] loaded wasm!");
    wasmlib.initialize();
    console.log("[Worker] initialized!");
})

transactionResponder.addResponseAction("example_ask_deep_thought",async (question:string) => {
        console.log("[Worker] let's ask DeepThought™") 
        const answer = wasmlib.ask_deep_thought(question);
        console.log("[Worker] DeepThought answered: ", answer); 
        return answer;
})

onmessage = async (event: MessageEvent) => {
    const message = event.data as RequestMessage;
    console.info(
        "[Worker] Received message from [Client], message",
        message
    );
    const id = message.id;
    try {
        const responseData = await transactionResponder.createResponse(message.command, message.requestData);
        postMessageToClient({ id, responseData: responseData });
    }
    catch (error: any) {
        console.error("[Worker] Error caught, error= ", error);
        postMessageToClient({ id, error: error.message });
    }
}

function postMessageToClient(message: ResponseMessage) {
    console.info("[Worker] Post message back to [Client] ", message);
    postMessage(message);
}