import { MarkdownRenderChild, MarkdownRenderer, TFile } from "obsidian";
import { rant } from "../pkg/obsidian_rantlang_plugin.js";
import type RantLangPlugin from "./main";
import { RantLangSettings } from "./settings";
import { randomSeed } from "./utils";

export const BLOCK_LINK_REGEX =
  /\[\[(?<link>[\s\S]+?)#?\^(?<block>[\s\S]+?)\]\]/;

export abstract class BaseRantProcessor extends MarkdownRenderChild {
  result: string = "";

  constructor(
    public plugin: RantLangPlugin,
    public input: string,
    public container: HTMLElement,
    public settings: RantLangSettings,
    public sourcePath: string
  ) {
    super(container);
    this.rant();
  }

  abstract renderResult(): void;

  processInput(input: string, seed: number) {
    try {
      this.result = rant(input, seed);
    } catch (error) {
      this.result = "ERROR processing Rant block (see console for details)";
      console.error(error);
    }
  }

  rant(input?: string, seed?: number) {
    this.processInput(input ?? this.input, seed ?? randomSeed());
    this.renderResult();
  }
}

export class CodeblockRantProcessor extends BaseRantProcessor {
  rant(input?: string, seed?: number) {
    this.resolveImports(input ?? this.input).then((program) => {
      this.processInput(program, seed ?? randomSeed());
      this.renderResult();
    });
  }

  async resolveImports(input: string): Promise<string> {
    let program = "";
    let lines = input.split("\n");
    while (lines.length > 0 && lines[0].startsWith("import:")) {
      const blockLink = lines.shift().split("import:")[1].trim();

      const { groups } = blockLink.match(BLOCK_LINK_REGEX);
      const path = groups.link.replace(/(\[|\])/g, "");
      const block = groups.block.replace(/(\^|#)/g, "").trim();

      const file = this.plugin.app.metadataCache.getFirstLinkpathDest(
        path,
        this.sourcePath
      );

      if (!file || !(file instanceof TFile)) {
        throw new Error("Could not load file.");
      }

      const cache = this.plugin.app.metadataCache.getFileCache(file);
      const position = cache.blocks[block].position;

      const content = await this.plugin.app.vault.cachedRead(file);
      const rantProgram = content
        .split("\n")
        .slice(position.start.line + 1, position.end.line)
        .join("\n");

      program += await this.resolveImports(rantProgram);
    }

    return program + "\n" + lines.join("\n");
  }

  renderResult() {
    this.container.empty();
    const content = this.container.createDiv({ cls: this.getStyles() });
    MarkdownRenderer.renderMarkdown(
      this.result,
      content,
      this.sourcePath,
      this
    );
  }

  getStyles() {
    let cls = ["rant-block"];
    if (this.settings.highlight) {
      cls.push("rant-highlight");
    }
    return cls;
  }
}

export class InlineRantProcessor extends BaseRantProcessor {
  renderResult() {
    let temp = createEl("span");
    MarkdownRenderer.renderMarkdown(this.result, temp, this.sourcePath, this);

    let nodes: Node[] = [];
    temp.childNodes.forEach((paragraph) => {
      nodes.push(...(paragraph.childNodes as any as Node[]));
      nodes.push(createEl("br"));
    });
    nodes.pop();

    this.container.className = this.getStyles().join(" ");
    this.container.replaceChildren(...nodes);
  }

  getStyles() {
    let cls = ["rant-inline"];
    if (this.settings.highlight) {
      cls.push("rant-highlight");
    }
    return cls;
  }
}

export class BlockLinkRantProcessor extends InlineRantProcessor {
  loaded: boolean = false;
  path: string;
  block: string;

  constructor(
    plugin: RantLangPlugin,
    input: string,
    container: HTMLElement,
    settings: RantLangSettings,
    sourcePath: string
  ) {
    super(plugin, input, container, settings, sourcePath);
    this.parseBlockLink(input);
    this.rant();
  }

  parseBlockLink(blockLink: string) {
    const { groups } = blockLink.match(BLOCK_LINK_REGEX);
    this.path = groups.link.replace(/(\[|\])/g, "");
    this.block = groups.block.replace(/(\^|#)/g, "").trim();
    this.loaded = true;
  }

  rant() {
    if (!this.loaded) {
      return;
    }

    const file = this.plugin.app.metadataCache.getFirstLinkpathDest(
      this.path,
      this.sourcePath
    );

    if (!file || !(file instanceof TFile)) {
      throw new Error("Could not load file.");
    }

    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const position = cache.blocks[this.block].position;

    this.plugin.app.vault.cachedRead(file).then((content) => {
      const rantProgram = content
        .split("\n")
        .slice(position.start.line + 1, position.end.line)
        .join("\n");
      super.rant(rantProgram);
    });
  }
}
