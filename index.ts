import { Plugin, Notice } from "obsidian";
// @ts-ignore
import rustPlugin from "./pkg/obsidian_rantlang_plugin_bg.wasm";
import init, { rant } from "./pkg/obsidian_rantlang_plugin.js";

export default class RantLangPlugin extends Plugin {
  async onload() {
    const buffer = Uint8Array.from(atob(rustPlugin), (c) => c.charCodeAt(0));
    await init(Promise.resolve(buffer));

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon("dice", "Sample Plugin", (evt) => {
      const seed = Math.random() * Number.MAX_SAFE_INTEGER;
      // Called when the user clicks the icon.
      //   new Notice(rant("{Hi|Hey|Hello|Ho|Ha|Hi|Hu|He} world!", seed));
      new Notice(rant("[rep:10][sep:-]{Heads|Tails}", seed));
    });
    // Perform additional things with the ribbon
    ribbonIconEl.addClass("my-plugin-ribbon-class");
  }
}
