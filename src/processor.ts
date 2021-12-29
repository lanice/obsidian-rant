import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";
import { rant } from "../pkg/obsidian_rantlang_plugin.js";
import { RantLangSettings } from "./settings.js";

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

  rant(seed: number) {
    this.processInput(seed);
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
    let temp = createEl("span", { cls: this.getStyles() });
    temp.appendText(this.result);
    this.container.replaceWith(temp);
    this.container = temp;
  }

  getStyles() {
    let cls = ["rant-inline"];
    if (this.settings.highlight) {
      cls.push("rant-highlight");
    }
    return cls;
  }
}
