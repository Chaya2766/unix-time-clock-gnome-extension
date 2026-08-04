import St from 'gi://St';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

let button;
let timeoutId;

let display_unix_time = true;
let display_day_second = true;
let display_day_count = false;

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
    
    // CREATE THE POPUP MENU
    const menu = new PopupMenu.PopupMenu(button, 0.5, St.Side.TOP);
    Main.uiGroup.add_child(menu.actor);
    menu.actor.hide(); //makes it so that the menu doesn't get created already open and displayed the moment the extension is started
    
    // Add unix time toggle menu item
    const epochDateItem = new PopupMenu.PopupSwitchMenuItem('Unix Time', display_unix_time);
    epochDateItem.connect('toggled', (item) => {
      display_unix_time = item.state;
      label.text = this._getTimeString();
    });
    menu.addMenuItem(epochDateItem);
    
    // Add day second toggle menu item
    const daySecondItem = new PopupMenu.PopupSwitchMenuItem('UTC day second', display_day_second);
    daySecondItem.connect('toggled', (item) => {
      display_day_second = item.state;
      label.text = this._getTimeString();
    });
    menu.addMenuItem(daySecondItem);
    
    // Add the day count toggle menu item
    const dayCountItem = new PopupMenu.PopupSwitchMenuItem('Day count', display_day_count);
    dayCountItem.connect('toggled', (item) => {
      display_day_count = item.state;
      label.text = this._getTimeString();
    });
    menu.addMenuItem(dayCountItem);

    // Toggle menu visibility when the extension is clicked
    button.connect('button-press-event', () => {
      menu.toggle();
    });

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
    
    const daysSinceEpoch = Math.floor(now/86400);
    const epoch_day = "day "+daysSinceEpoch.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    
    let displaytext = "";
    let needs_divider = false;
    
    if(display_unix_time){
        displaytext += epoch_date;
        needs_divider = true;
    }
    if(display_day_second){
        if(needs_divider){
            displaytext += " | ";
        }
        displaytext += epoch_clock;
        needs_divider = true;
    }
    if(display_day_count){
        if(needs_divider){
            displaytext += " | ";
        }
        displaytext += epoch_day;
        needs_divider = true;
    }
    
    return displaytext;
  }
}
