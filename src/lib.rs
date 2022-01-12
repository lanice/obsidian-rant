use std::fmt;

use rant::{compiler::CompilerErrorKind, runtime::RuntimeError, Rant, RantValue};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn rant(input: &str, seed: u32) -> Result<String, JsValue> {
    match _rant(input, seed) {
        Ok(output) => Ok(output.to_string()),
        Err(err) => Err(JsValue::from(err.to_string())),
    }
}

fn _rant(input: &str, seed: u32) -> Result<RantValue, RantError> {
    let mut rant = Rant::with_seed(seed as u64);
    let program = rant.compile_quiet(input).map_err(RantError::Compiler)?;
    rant.run(&program).map_err(RantError::Runtime)
}

#[derive(Debug)]
enum RantError {
    Compiler(CompilerErrorKind),
    Runtime(RuntimeError),
}

impl fmt::Display for RantError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            RantError::Compiler(ref err) => write!(f, "Rant Compile error: {}", err),
            RantError::Runtime(ref err) => write!(f, "Rant Runtime error: {}", err),
        }
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
