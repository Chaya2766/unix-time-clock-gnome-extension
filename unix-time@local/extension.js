import St from 'gi://St';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

let button;
let timeoutId;

export default class UnixTimeExtension {
  enable() {
    button = new St.Bin({
      style_class: 'panel-button',
      reactive: true,
      can_focus: true,
      track_hover: true,
    });

    const label = new St.Label({
      text: this._getTimeString(),
      style: 'font-size: 12px; margin: 0 10px;',
    });

    button.set_child(label);

    // Update every second
    timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
      label.text = this._getTimeString();
      return true; // Keep the timeout running
    });

    Main.panel._rightBox.insert_child_at_index(button, 0);
  }

  disable() {
    if (timeoutId) {
      GLib.source_remove(timeoutId);
    }
    button?.destroy();
  }

  _getTimeString() {
    const now = Math.floor(Date.now() / 1000); // Unix timestamp
    const epoch_date = now.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    
    const secondsSinceMidnight = now % 86400;
    const epoch_clock = secondsSinceMidnight.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    
    return `${epoch_date} | ${epoch_clock}`;
  }
}
