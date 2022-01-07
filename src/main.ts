import {
  Plugin,
  Notice,
  MarkdownView,
  TFile,
  MarkdownPostProcessorContext,
} from "obsidian";
// @ts-ignore
import rustPlugin from "../pkg/obsidian_rantlang_plugin_bg.wasm";
import init from "../pkg/obsidian_rantlang_plugin.js";
import {
  CodeblockRantProcessor,
  InlineRantProcessor,
  BaseRantProcessor,
  BlockLinkRantProcessor,
  BLOCK_LINK_REGEX,
} from "./processor";
import SettingTab, { DEFAULT_SETTINGS, RantLangSettings } from "./settings";

export default class RantLangPlugin extends Plugin {
  settings: RantLangSettings;
  fileMap: Map<TFile, BaseRantProcessor[]> = new Map();
  rantBlockStore: Map<string, TFile> = new Map();

  async onload() {
    // Load WebAssembly Rust plugin to have access to the Rust Rant crate.
    const buffer = Uint8Array.from(atob(rustPlugin), (c) => c.charCodeAt(0));
    await init(Promise.resolve(buffer));

    // Initialize settings.
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new SettingTab(this.app, this));

    // Register Rant codeblocks.
    this.registerMarkdownCodeBlockProcessor(
      "rant",
      (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
        if (!file || !(file instanceof TFile)) return;

        const processor = new CodeblockRantProcessor(
          this,
          source,
          el,
          this.settings,
          ctx.sourcePath
        );
        ctx.addChild(processor);

        this.registerRantProcessor(processor, file);
      }
    );

    // Register inline Rant blocks.
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
            const container = el.createSpan();
            codeblock.replaceWith(container);

            const code = text.substring(inlineRantQueryPrefix.length).trim();
            const processorClass = code.match(BLOCK_LINK_REGEX)
              ? BlockLinkRantProcessor
              : InlineRantProcessor;

            const processor = new processorClass(
              this,
              code,
              container,
              this.settings,
              ctx.sourcePath
            );
            ctx.addChild(processor);

            this.registerRantProcessor(processor, file);
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
              processor.rant();
            });

            new Notice("Re-processed Rant blocks");
          }
          return true;
        }
      },
    });
  }

  async onunload() {
    delete this.fileMap;
  }

  async updateSettings(settings: Partial<RantLangSettings>) {
    Object.assign(this.settings, settings);
    await this.saveData(this.settings);
  }

  registerRantProcessor(processor: BaseRantProcessor, file: TFile) {
    // File-based tracking of registered processors inspired by javalent's excellent dice roller plugin: https://github.com/valentine195/obsidian-dice-roller

    if (!this.fileMap.has(file)) {
      this.fileMap.set(file, []);
    }
    this.fileMap.set(file, [...this.fileMap.get(file), processor]);

    processor.register(() => {
      this.unregisterRantProcessor(processor, file);
    });
  }

  unregisterRantProcessor(processor: BaseRantProcessor, file: TFile) {
    if (this.fileMap.has(file) && this.fileMap.get(file).contains(processor)) {
      this.fileMap.get(file).remove(processor);

      if (this.fileMap.get(file).length == 0) {
        this.fileMap.delete(file);
      }
    }
  }
}
