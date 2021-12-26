import { Plugin } from 'obsidian';
import rustPlugin from "./pkg/obsidian_rust_plugin_bg.wasm";
import * as plugin from "./pkg/obsidian_rust_plugin.js";

export default class RustPlugin extends Plugin {
	async onload() {
		const buffer = Uint8Array.from(atob(rustPlugin), c => c.charCodeAt(0))
		await plugin.default(Promise.resolve(buffer));
		// plugin.onload(this);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt) => {
			const seed = Math.random() * Number.MAX_SAFE_INTEGER;
			// Called when the user clicks the icon.
			new Notice(plugin.rant("{Hi|Hey|Hello|Ho|Ha|Hi|Hu|He} world!", seed));
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');
	}
}
