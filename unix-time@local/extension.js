import St from 'gi://St';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

let button;
let timeoutId;

let display_unix_time = true;
let display_day_second = true;
let display_seconds_till_midnight = false;
let display_day_count = false;
let display_year_count = false;

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
    
    // Add the seconds till midnight count toggle menu item
    const secondsTillMidnightItem = new PopupMenu.PopupSwitchMenuItem('UTC seconds till midnight', display_seconds_till_midnight);
    secondsTillMidnightItem.connect('toggled', (item) => {
      display_seconds_till_midnight = item.state;
      label.text = this._getTimeString();
    });
    menu.addMenuItem(secondsTillMidnightItem);
    
    // Add the day count toggle menu item
    const dayCountItem = new PopupMenu.PopupSwitchMenuItem('Day count', display_day_count);
    dayCountItem.connect('toggled', (item) => {
      display_day_count = item.state;
      label.text = this._getTimeString();
    });
    menu.addMenuItem(dayCountItem);
    
    // Add the year count toggle menu item
    const yearCountItem = new PopupMenu.PopupSwitchMenuItem('Year count', display_year_count);
    yearCountItem.connect('toggled', (item) => {
      display_year_count = item.state;
      label.text = this._getTimeString();
    });
    menu.addMenuItem(yearCountItem);

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
    
    let displaytext = "";
    let needs_divider = false;
    
    
    const epoch_date = now.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if(display_unix_time){
        displaytext += epoch_date;
        needs_divider = true;
    }
    
    const secondsSinceMidnight = now % 86400;
    const epoch_clock = secondsSinceMidnight.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if(display_day_second){
        if(needs_divider){
            displaytext += " | ";
        }
        displaytext += epoch_clock;
        needs_divider = true;
    }
    const secondsTillMidnight = 86400 - secondsSinceMidnight;
    const epoch_clock_inverse = secondsTillMidnight.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if(display_seconds_till_midnight){
        if(needs_divider){
            displaytext += " | ";
        }
        displaytext += epoch_clock_inverse;
        needs_divider = true;
    }
    
    const daysSinceEpoch = Math.floor(now/86400);
    const epoch_day = "day "+daysSinceEpoch.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if(display_day_count){
        if(needs_divider){
            displaytext += " | ";
        }
        displaytext += epoch_day;
        needs_divider = true;
    }
    
    const leapYearsSinceEpoch = Math.floor((daysSinceEpoch+731)/1461);//4 * 365 + 1 days = 3 standard years + 1 leap year = number of leap years since epoch = number of leap days since epoch. This falsely includes years that according to further rules should NOT be leap years, eg. year 2100, since it is divisible by 100 but not 400
    //Adding 731 is to shift it forward by 2 years, since 1972 is a leap year, and the count starts at 1970, so without the shift the equation would count 1972 as a normal year and then 1974 as a leap year
    const leaplessYearsSinceEpoch = Math.floor((daysSinceEpoch-10957)/36525) - Math.floor((daysSinceEpoch-10957)/146100) + 1;//10957 is number of days between 1 jan 1970 and 1 jan 2000, 36525 is number of days in each century including leap days, 146100 is number of days in 4 centuries including leap days, the substraction means this counts how many years there had been since 2000 that were divisible by 100 but not 400, and +1 to account for 2000 which the count starts from
    const yearsSinceEpoch = Math.floor( (daysSinceEpoch - leapYearsSinceEpoch + leaplessYearsSinceEpoch) / 365); //assume a year means 365 days, substract one day every 4 years to account for leap years
    const epoch_year = "year "+yearsSinceEpoch.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if(display_year_count){
        if(needs_divider){
            displaytext += " | ";
        }
        displaytext += epoch_year;
        needs_divider = true;
    }
    
    
    return displaytext;
  }
}
