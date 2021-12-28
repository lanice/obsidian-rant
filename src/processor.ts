import { MarkdownRenderChild } from "obsidian";
import { rant } from "../pkg/obsidian_rantlang_plugin.js";

export abstract class BaseRantProcessor extends MarkdownRenderChild {
  result: string = "";
  target: HTMLElement;

  constructor(public input: string, public container: HTMLElement) {
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

export class CodeblockRantProcessor extends BaseRantProcessor {
  constructor(input: string, container: HTMLElement) {
    super(input, container);
    this.target = container.createEl("p", { cls: "rant" });
  }

  renderResult() {
    const node = createFragment((frag) => {
      this.result.split("\n").forEach((text) => {
        frag.appendText(text);
        frag.createEl("br");
      });
    });

    this.target.replaceChildren(node);
  }
}

/** Processes inline Rant blocks. */
export class InlineRantProcessor extends BaseRantProcessor {
  constructor(input: string, container: HTMLElement, target: HTMLElement) {
    super(input, container);
    this.target = target;
  }

  renderResult() {
    let temp = document.createElement("span");
    temp.appendText(this.result);
    this.target.replaceWith(temp);
    this.target = temp;
  }
}
