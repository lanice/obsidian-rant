import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";
import { rant } from "../pkg/obsidian_rantlang_plugin.js";
import { RantLangSettings } from "./settings.js";
import { randomSeed } from "./utils.js";

export abstract class BaseRantProcessor extends MarkdownRenderChild {
  result: string = "";

  constructor(
    public input: string,
    public container: HTMLElement,
    public settings: RantLangSettings,
    public sourcePath: string,
    public customizations: Customization[] = []
  ) {
    super(container);
    this.rant();
  }

  abstract renderResult(): void;

  processInput(seed: number) {
    try {
      this.result = rant(this.input, seed);
    } catch (error) {
      this.result = "ERROR processing Rant block (see console for details)";
      console.error(error);
    }
  }

  rant(seed?: number) {
    this.processInput(seed ?? randomSeed());
    this.renderResult();
  }
}

export type Customization = "bold" | "italic";

export class CodeblockRantProcessor extends BaseRantProcessor {
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
    this.customizations.forEach((style) => {
      cls.push(`rant-${style}`);
    });
    return cls;
  }
}

export class InlineRantProcessor extends BaseRantProcessor {
  renderResult() {
    let temp = createEl("div");
    MarkdownRenderer.renderMarkdown(this.result, temp, this.sourcePath, this);

    this.container.empty();
    this.container.className = this.getStyles().join(" ");

    temp.childNodes.forEach((paragraph) => {
      paragraph.childNodes.forEach((node) => {
        this.container.appendChild(node.cloneNode(true));
      });
    });
  }

  getStyles() {
    let cls = ["rant-inline"];
    if (this.settings.highlight) {
      cls.push("rant-highlight");
    }
    return cls;
  }
}
