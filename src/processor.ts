import { rant } from "../pkg/obsidian_rantlang_plugin.js";

export default class RantProcessor {
  result: string = "";

  constructor(public input: string, public containerEl: HTMLDivElement) {}

  processInput(seed: number) {
    // const seed = Math.random() * Number.MAX_SAFE_INTEGER;
    this.result = rant(this.input, seed);
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
