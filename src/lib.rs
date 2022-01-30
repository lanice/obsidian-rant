use std::fmt;

use rant::{
    compiler::{CompilerErrorKind, CompilerMessage},
    runtime::RuntimeError,
    Rant, RantOptions, RantValue,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn rant(input: &str, seed: u32) -> Result<String, JsValue> {
    match _rant(input, seed) {
        Ok(output) => Ok(output.to_string()),
        Err(err) => Err(JsValue::from(err.to_string())),
    }
}

fn _rant(input: &str, seed: u32) -> Result<RantValue, RantError> {
    let options = RantOptions {
        seed: seed.into(),
        enable_require: false,
        ..Default::default()
    };
    let mut rant = Rant::with_options(options);
    let mut msgs: Vec<CompilerMessage> = vec![];
    let program = rant.compile(input, &mut msgs);
    match program {
        Ok(p) => rant.run(&p).map_err(RantError::Runtime),
        Err(err) => Err(RantError::Compiler(CompilerErrorWithMsgs { err, msgs })),
    }
}

#[derive(Debug)]
enum RantError {
    Compiler(CompilerErrorWithMsgs),
    Runtime(RuntimeError),
}

impl fmt::Display for RantError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            RantError::Compiler(ref err) => write!(f, "{}", err),
            RantError::Runtime(ref err) => write!(f, "Rant Runtime error: {}", err),
        }
    }
}

#[derive(Debug)]
struct CompilerErrorWithMsgs {
    err: CompilerErrorKind,
    msgs: Vec<CompilerMessage>,
}

impl fmt::Display for CompilerErrorWithMsgs {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let msgs = self
            .msgs
            .iter()
            .map(|msg| format!("{:#?}", msg))
            .collect::<Vec<_>>()
            .join("\n");
        write!(
            f,
            "Rant Compiler error: {}\nCompiler messages:\n{}",
            self.err, msgs
        )
    }
}

#[cfg(test)]
pub mod tests {
    use super::_rant;

    #[test]
    fn empty() {
        let input = r#""#;
        assert_eq!(_rant(input, 0).unwrap().to_string(), "");
    }

    #[test]
    fn hint_old_syntax() {
        let input = r#"Your lucky number is '[rand:1;100]."#;
        assert_eq!(
            _rant(input, 0).unwrap().to_string(),
            "Your lucky number is '33."
        );
    }

    #[test]
    fn hint_new_syntax() {
        let input = r#"Your lucky number is `[rand:1;100]."#;
        assert_eq!(
            _rant(input, 0).unwrap().to_string(),
            "Your lucky number is 33."
        );
    }
}
