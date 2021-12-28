import {
  Plugin,
  Notice,
  MarkdownView,
  TFile,
  MarkdownPostProcessorContext,
} from "obsidian";
// @ts-ignore
import rustPlugin from "../pkg/obsidian_rantlang_plugin_bg.wasm";
import { around } from "monkey-around";
import init from "../pkg/obsidian_rantlang_plugin.js";
import RantProcessor, { InlineRantProcessor } from "./processor";
import { randomSeed } from "./utils";

type RantProcessorType = RantProcessor | InlineRantProcessor;

export default class RantLangPlugin extends Plugin {
  fileMap: Map<TFile, RantProcessorType[]> = new Map();

  async onload() {
    const buffer = Uint8Array.from(atob(rustPlugin), (c) => c.charCodeAt(0));
    await init(Promise.resolve(buffer));

    this.registerMarkdownCodeBlockProcessor(
      "rant",
      (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
        if (!file || !(file instanceof TFile)) return;

        const processor = new RantProcessor(
          source,
          el.createDiv({ cls: "rant" })
        );
        processor.rant(randomSeed());

        /* File-based tracking of registered processors inspired by javalent's excellent dice roller plugin: https://github.com/valentine195/obsidian-dice-roller */

        if (!this.fileMap.has(file)) {
          this.fileMap.set(file, []);
        }
        this.fileMap.set(file, [...this.fileMap.get(file), processor]);

        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (
          view &&
          this.fileMap.has(file) &&
          this.fileMap.get(file).length === 1
        ) {
          const self = this;

          let unregisterOnUnloadFile = around(view, {
            onUnloadFile: function (next) {
              return async function (unloaded: TFile) {
                if (unloaded == file) {
                  self.fileMap.delete(file);
                  unregisterOnUnloadFile();
                }

                return await next.call(this, unloaded);
              };
            },
          });

          view.register(unregisterOnUnloadFile);
          view.register(() => this.fileMap.delete(file));
        }
      }
    );

    this.registerMarkdownPostProcessor(
      (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
        if (!file || !(file instanceof TFile)) return;

        const inlineRantQueryPrefix = "rant:";
        const codeblocks = el.querySelectorAll("code");
        for (let index = 0; index < codeblocks.length; index++) {
          const codeblock = codeblocks.item(index);
          const text = codeblock.innerText.trim();
          if (text.startsWith(inlineRantQueryPrefix)) {
            const code = text.substring(inlineRantQueryPrefix.length).trim();

            const processor = new InlineRantProcessor(code, el, codeblock);
            ctx.addChild(processor);
            processor.rant(randomSeed());

            /* File-based tracking of registered processors inspired by javalent's excellent dice roller plugin: https://github.com/valentine195/obsidian-dice-roller */

            if (!this.fileMap.has(file)) {
              this.fileMap.set(file, []);
            }
            this.fileMap.set(file, [...this.fileMap.get(file), processor]);

            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (
              view &&
              this.fileMap.has(file) &&
              this.fileMap.get(file).length === 1
            ) {
              const self = this;

              let unregisterOnUnloadFile = around(view, {
                onUnloadFile: function (next) {
                  return async function (unloaded: TFile) {
                    if (unloaded == file) {
                      self.fileMap.delete(file);
                      unregisterOnUnloadFile();
                    }

                    return await next.call(this, unloaded);
                  };
                },
              });

              view.register(unregisterOnUnloadFile);
              view.register(() => this.fileMap.delete(file));
            }
          }
        }
      }
    );

    this.addCommand({
      id: "rerant",
      name: "Re-rant with random seed (active file)",
      hotkeys: [{ key: "r", modifiers: ["Mod"] }],
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (
          view &&
          view.getMode() === "preview" &&
          this.fileMap.has(view.file)
        ) {
          if (!checking) {
            const processors = this.fileMap.get(view.file);

            processors.forEach((processor) => {
              processor.rant(randomSeed());
            });

            new Notice("Re-processed Rant blocks");
          }
          return true;
        }
      },
    });
  }
}
