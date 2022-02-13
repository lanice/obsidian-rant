use std::{fmt, rc::Rc};

use rant::{
    compiler::{CompilerError, CompilerMessage},
    runtime::{RuntimeError, VM},
    IntoRantFunction, NoModuleResolver, Rant, RantOptions, RantValue,
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
        ..Default::default()
    };
    let mut rant = Rant::with_options(options).using_module_resolver(NoModuleResolver);
    register_markdown_functions(&mut rant);

    let mut msgs: Vec<CompilerMessage> = vec![];
    let program = rant.compile(input, &mut msgs);
    match program {
        Ok(p) => rant.run(&p).map_err(RantError::Runtime),
        Err(err) => Err(RantError::Compiler(CompilerErrorWithMsgs { err, msgs })),
    }
}

fn register_markdown_functions(rant: &mut Rant) {
    use RantValue::Function;
    rant.set_global("italic", Function(Rc::new(italic.into_rant_func())));
    rant.set_global("bold", Function(Rc::new(bold.into_rant_func())));
    rant.set_global(
        "bold-italic",
        Function(Rc::new(bold_italic.into_rant_func())),
    );
    rant.set_global("highlight", Function(Rc::new(highlight.into_rant_func())));
    rant.set_global("link", Function(Rc::new(link.into_rant_func())));
}

fn italic(vm: &mut VM, val: RantValue) -> Result<(), RuntimeError> {
    vm.cur_frame_mut().write(format!("*{}*", val));
    Ok(())
}

fn bold(vm: &mut VM, val: RantValue) -> Result<(), RuntimeError> {
    vm.cur_frame_mut().write(format!("**{}**", val));
    Ok(())
}

fn bold_italic(vm: &mut VM, val: RantValue) -> Result<(), RuntimeError> {
    vm.cur_frame_mut().write(format!("***{}***", val));
    Ok(())
}

fn highlight(vm: &mut VM, val: RantValue) -> Result<(), RuntimeError> {
    vm.cur_frame_mut().write(format!("=={}==", val));
    Ok(())
}

fn link(vm: &mut VM, val: RantValue) -> Result<(), RuntimeError> {
    vm.cur_frame_mut().write(format!("[[{}]]", val));
    Ok(())
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
    err: CompilerError,
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
