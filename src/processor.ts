import { rant } from "../pkg/obsidian_rantlang_plugin.js";

export default class RantProcessor {
  result: string = "";

  constructor(public input: string, public containerEl: HTMLDivElement) {}

  processInput(seed: number) {
    try {
      this.result = rant(this.input, seed);
    } catch (error) {
      this.result = "ERROR processing Rant block (see console for details)";
      console.error(error);
    }
  }

  renderResult() {
    const node = createFragment((frag) => {
      this.result.split("\n").forEach((text) => {
        frag.appendText(text);
        frag.createEl("br");
      });
    });

    this.containerEl.replaceChildren(node);
  }

  rant(seed: number) {
    this.processInput(seed);
    this.renderResult();
  }
}
