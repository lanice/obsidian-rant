import { App, PluginSettingTab, Setting } from "obsidian";
import type RantLangPlugin from "./main";

export interface RantLangSettings {
  highlight: boolean;
}

export const DEFAULT_SETTINGS: RantLangSettings = {
  highlight: false,
};

export default class SettingTab extends PluginSettingTab {
  additionalContainer: HTMLDivElement;

  constructor(app: App, public plugin: RantLangPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  async display(): Promise<void> {
    this.containerEl.empty();
    this.containerEl.addClass("rant-settings");
    this.containerEl.createEl("h2", { text: "Rang-Lang settings" });

    new Setting(this.containerEl)
      .setName("Highlight Rant blocks")
      .setDesc(
        "Highlight Rant blocks (both inline and codeblocks) by adding a box around them."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.highlight)
          .onChange(
            async (value) =>
              await this.plugin.updateSettings({ highlight: value })
          )
      );
  }
}
