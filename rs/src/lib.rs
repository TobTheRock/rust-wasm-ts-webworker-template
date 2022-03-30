use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn initialize() {
    wasm_logger::init(wasm_logger::Config::default());
    log::info!("Initializing wasm lib!");
}

#[wasm_bindgen]
pub fn ask_deep_thought(question: &str) -> u32 {
    log::info!("Asking deep thought: {}", question);
    let time_to_think_parameter: u64 = question.len().try_into().unwrap_or(0);

    log::info!("DeepThought™ will need to think ....");
    for i in 0..time_to_think_parameter {
        let mut x: u64 = 0;
        for j in 0..1_000_000 {
            x += i*j/42;
        }

        log::info!("... {:#b}", x);
    }

    log::info!("DeepThought™ has awoken!");

    return 42;
}