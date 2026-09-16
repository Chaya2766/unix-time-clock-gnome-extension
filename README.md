To install the extension follow these steps:

1. place the unix-time@local directory at this location: ~/.local/share/gnome-shell/extensions/

2. restart your system

3. run this command: gnome-extensions enable unix-time@local

If the extension still does not work, the most likely cause is that your system uses a gnome version which is not listed in the metadata as a supported version. If you want to fix this yourself, check the gnome version in your system settings and then add it to the "shell version" list in metadata.json.
