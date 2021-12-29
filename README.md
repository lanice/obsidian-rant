# Obsidian Rant-Lang
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/lanice/obsidian-rant?style=for-the-badge&sort=semver)](https://github.com/lanice/obsidian-rant/releases/latest)

Thin wrapper around the [Rant language](https://rant-lang.org/) Rust crate to be used in Obsidian.

## Usage

Use a code block with the `rant` type, in which you can enter a Rant program.
The program is then compiled and executed with Rant, and the result shown as normal text in the Obsidian preview mode.

Use the command `Re-rant with random seed (active file)` (default hotkey: `Cmd+R`/`Ctrl+R`) to run Rant again on each block in the active (preview) file.

## Examples

Taken from the [official Rant examples](https://github.com/rant-lang/rant/tree/master/examples/rant), take a look there for more.

This code block:

````markdown
```rant
[shuffled: 
  [rep: 2] {(Joker)} 
  [cat: **(A;2;3;4;5;6;7;8;9;10;J;Q;K); **(♠;♥;♣;♦) |> collect]
]

```
````

Could produce this output (the order will be different with each Rant run of course):

```
(J♦; 10♠; 8♦; Joker; 7♥; Q♠; J♣; 2♠; 5♥; 10♥; 7♣; K♠; K♣; 5♠; 6♦; 9♦; A♣; 3♣; 6♣; 3♠; Q♥; 4♠; 4♣; 7♠; J♥; 3♦; A♥; 8♣; 3♥; 6♠; 9♥; 2♦; 2♣; A♠; 8♥; Q♣; K♥; 9♣; 5♦; 2♥; Q♦; 4♦; A♦; 10♦; Joker; K♦; J♠; 8♠; 9♠; 6♥; 10♣; 4♥; 5♣; 7♦)
```

It is also possible to use Rant inline by starting an inline code block with `rant:`, like so:

````markdown
This inline Rant block is `rant: {neat|awesome|fantastic}`!
````
