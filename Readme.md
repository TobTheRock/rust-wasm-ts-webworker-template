# 🦀🕸  Template: WASM + TS + Rust + webworker   
This project is intended as monorepo template for any project, which intends to integrate Rust generated Webassembly in a webworker written in TypeScript.  
The code is bundled into a single file, exposing a client interface for the webworker. Hereby the webworker is inlined as a base64 blob, which is loaded as soon as when initializing the client. The output bundle with its type mappings can finally be consumed e.g. by a web browser application.
As an example a reference implementation of DeepThought™ is given.
# Setup
This project requires an installed Rust version >= 1.30.0. 
Additionally `yarn` needs to be globally installed.
Initially in the project root run 
```
yarn
```
to load the remaining dependencies.
## Building
To trigger a release build simply run
```
yarn build
```
or for a development debug version
```
yarn build:dev
```
This compiles the rust code, provides the WASM package with `wasm-pack`, transpiles the Typescript code and finally bundles everything together with `webpack`. The output can be found under `./dist/Client.js` along with a type definition file. 

To clean the complete build use
```
yarn clean
```

## Testing
To prove the concept working, a simple testpage is provided. To start the development server run
```
yarn testpage
```
When navigating to `https://localhost:8443/`  with a webbrowser (accept the risk...), you are able to ask DeepThought™ anything you desire. Open up the developer tools to follow his thought process....
Additionally in the logs you can see the client and webworker doing their deed.  
