import { MarkdownRenderChild } from "obsidian";
import { rant } from "../pkg/obsidian_rantlang_plugin.js";
import { RantLangSettings } from "./settings.js";

export abstract class BaseRantProcessor extends MarkdownRenderChild {
  result: string = "";
  target: HTMLElement;

  constructor(
    public input: string,
    public container: HTMLElement,
    public settings: RantLangSettings
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
  customizations: Customization[];

  constructor(
    input: string,
    container: HTMLElement,
    settings: RantLangSettings,
    customizations: Customization[] = []
  ) {
    super(input, container, settings);
    this.customizations = customizations;
    this.target = container.createEl("p");
  }

  renderResult() {
    const cls = this.getStyles();
    const newChild = createEl("p", { cls });
    this.container.replaceChild(newChild, this.target);
    this.target = newChild;

    const node = createFragment((frag) => {
      this.result.split("\n").forEach((text) => {
        frag.appendText(text);
        frag.createEl("br");
      });
    });

    this.target.replaceChildren(node);
  }

  getStyles() {
    let cls = this.settings.enableStyling ? ["rant", "rant-block"] : [];
    this.customizations.forEach((style) => {
      cls.push(`rant-${style}`);
    });
    return cls;
  }
}

/** Processes inline Rant blocks. */
export class InlineRantProcessor extends BaseRantProcessor {
  constructor(
    input: string,
    container: HTMLElement,
    target: HTMLElement,
    settings: RantLangSettings
  ) {
    super(input, container, settings);
    this.target = target;
  }

  renderResult() {
    const cls = this.settings.enableStyling ? ["rant", "rant-inline"] : "";
    let temp = createEl("span", { cls });
    temp.appendText(this.result);
    this.target.replaceWith(temp);
    this.target = temp;
  }
}
