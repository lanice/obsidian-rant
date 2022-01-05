# Obsidian Rant-Lang
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/lanice/obsidian-rant?style=for-the-badge)
![GitHub all releases](https://img.shields.io/github/downloads/lanice/obsidian-rant/total?style=for-the-badge)

Thin wrapper around the [Rant language](https://rant-lang.org/) Rust crate to be used in Obsidian.

> "**Rant** is a high-level procedural templating language with a diverse toolset for easily creating dynamic code templates, game dialogue, stories, name generators, test data, and much more." - from [Rant's GitHub page](https://github.com/rant-lang/rant)

## Usage

Use a code block with the `rant` type, in which you can enter a Rant program.
The program is then compiled and executed with Rant, and the result shown in the Obsidian preview mode.

Use the command `Re-rant with random seed (active file)` (default hotkey: `Cmd+R`/`Ctrl+R`) to run Rant again on each block in the active (preview) file.

It's also possible to insert a Rant program inline by starting an inline code block with "`rant:`".

Within a `rant` block (both inline and code blocks), the result of the program is then rendered with the Obsidian MarkdownParser.
That means that you can add styling, links, or other markdown-processing elements inside a `rant` block, and they will be rendered accordingly.
In order to avoid Rant syntax errors, you can wrap these elements in double quotes, because Rant treats everything inside double quotes as [string literals](https://docs.rant-lang.org/language/text.html#string-literals), and will not evaluate the content.

## Examples

> **Note:** As Rant chooses random block elements to run, the output of the following examples will vary with each re-run of Rant, so what's shown here is just one possible result.

A Rant program that produces a shuffled deck of cards, taken from the [official Rant examples](https://github.com/rant-lang/rant/tree/master/examples/rant):

````markdown
```rant
[shuffled: 
  [rep: 2] {(Joker)} 
  [cat: **(A;2;3;4;5;6;7;8;9;10;J;Q;K); **(♠;♥;♣;♦) |> collect]
]
```
````

Could produce this output (with a random order on each re-rant):

![Cards example](https://raw.githubusercontent.com/lanice/obsidian-rant/master/img/obsidian-rant-example-cards.png)

### Inline

An inline Rant program:

````markdown
This inline Rant block is `rant: {neat|awesome|fantastic}`!
````

Result:

![Inline example](https://raw.githubusercontent.com/lanice/obsidian-rant/master/img/obsidian-rant-example-inline.png)

### Styling

This is an example of how to apply markdown styling within the Rant code block, note the usage of double quotes:

````markdown
```rant
"**"{Hello|Hi|Hey}"**" world!
```
````
Result:

![Styling example](https://raw.githubusercontent.com/lanice/obsidian-rant/master/img/obsidian-rant-example-styling.png)

### Links

You can use any form of links within a Rant code block, and it properly renders (including page preview on hover):

````markdown
```rant
[rep:10][sep:-]{"[[A Page]]"|"[External link](https://www.wikipedia.org)"|Just text}
```
````
Result:

![Link example](https://raw.githubusercontent.com/lanice/obsidian-rant/master/img/obsidian-rant-example-links.png)

### Dice-roller

Example using the [dice-roller plugin](https://github.com/valentine195/obsidian-dice-roller) within a Rant block:

````markdown
```rant
Suddenly `dice: 2d4` {goblins|dragons|gelatinous cubes} charge at you!
```
````
Result:

![Dice-roller example](https://raw.githubusercontent.com/lanice/obsidian-rant/master/img/obsidian-rant-example-dice.png)

### Lists

A Rant program can output lists like this:

````markdown
```rant
A list of all kinds of stuff:\n
[rep:5][sep:\n]{- "[[A page]]"|- Just text|- `dice: 2d12`}
```
````
Result:

![List example](https://raw.githubusercontent.com/lanice/obsidian-rant/master/img/obsidian-rant-example-list.png)

## Installation

### From within Obsidian

1. Open Settings > Community plugins
2. Make sure "Safe mode" is **off**
3. In the community plugins browser, search for "Rant-Lang"
4. Install & Enable
5. Profit

### Via [BRAT](https://github.com/TfTHacker/obsidian42-brat)

1. Add `lanice/obsidian-rant` to the list of Beta plugins in the `Obsidian42 - BRAT` settings menu
2. Enable the plugin in the [Community plugins](https://help.obsidian.md/Advanced+topics/Community+plugins) settings menu

### Manually

1. Download the [latest release](https://github.com/lanice/obsidian-rant/releases/latest)
2. Extract the `obsidian-rant` folder from the zip to your vault `<vault>/.obsidian/plugins/`
3. Reload Obsidian
4. Enable the plugin in the [Community plugins](https://help.obsidian.md/Advanced+topics/Community+plugins) settings menu