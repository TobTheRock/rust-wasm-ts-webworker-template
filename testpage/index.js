
import { createClient } from "../dist/Client";

const textBox = document.querySelector("#questionTextbox");
const submitButton = document.querySelector("#submitButton");
const answerBox = document.querySelector("#answer");
let client;

window.onload = async () => {
console.log("[Testpage] Hello, let's use wasm!");
console.log("[Testpage] Creating client...");
client = await createClient();
console.log("[Testpage] Created client.");
};

submitButton.addEventListener("click", async () => {
    const answer = await client.exampleAskDeepThought(textBox.value);
    console.log("[Testpage] Got answer: ", answer);
    answerBox.textContent = answer;
});