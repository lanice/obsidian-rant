mod obsidian;
use js_sys::JsString;
use rant::Rant;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ExampleCommand {
    id: JsString,
    name: JsString,
}

#[wasm_bindgen]
impl ExampleCommand {
    #[wasm_bindgen(getter)]
    pub fn id(&self) -> JsString {
        self.id.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_id(&mut self, id: &str) {
        self.id = JsString::from(id)
    }

    #[wasm_bindgen(getter)]
    pub fn name(&self) -> JsString {
        self.name.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_name(&mut self, name: &str) {
        self.name = JsString::from(name)
    }

    pub fn callback(&self) {}
}

#[wasm_bindgen]
pub fn onload(plugin: &obsidian::Plugin) {
    let cmd = ExampleCommand {
        id: JsString::from("example"),
        name: JsString::from("Example"),
    };
    plugin.addCommand(JsValue::from(cmd))
}

#[wasm_bindgen]
pub fn rant(input: &str, seed: u32) -> String {
    // Create a default Rant context
    let mut rant = Rant::with_seed(seed as u64);

    // Compile a simple program
    let program = rant.compile_quiet(input).unwrap();

    // Run the program and print the output
    let output = rant.run(&program).unwrap();

    output.to_string()
}
