import { App, PluginSettingTab, Setting } from "obsidian";
import type RantLangPlugin from "./main";

export interface RantLangSettings {
  enableStyling: boolean;
}

export const DEFAULT_SETTINGS: RantLangSettings = {
  enableStyling: true,
};

export default class SettingTab extends PluginSettingTab {
  additionalContainer: HTMLDivElement;

  constructor(app: App, public plugin: RantLangPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  async display(): Promise<void> {
    this.containerEl.empty();
    this.containerEl.createEl("h2", { text: "Rang-Lang settings" });

    new Setting(this.containerEl)
      .setName("Enable Rant block styling")
      .setDesc(
        "Turning this off will remove all styling from both inline and code Rant blocks."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableStyling)
          .onChange(
            async (value) =>
              await this.plugin.updateSettings({ enableStyling: value })
          )
      );
  }
}
