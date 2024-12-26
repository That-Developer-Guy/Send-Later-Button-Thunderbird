# Send Later Button Extension Thunderbird

### This contains the source Code of the Extension

Link to the addon <a href="https://addons.thunderbird.net/de/thunderbird/addon/sp%C3%A4ter-senden-button">here</a>. Install it on Thunderbird in the Addon Menu.

### What does this do?

This addon adds a button to the toolbar of the compose window that allows you to utilize the send later functionality of Thunderbird even if you are in online mode.
It also has a setting in the addons options menu that gives the functionality of enabling or disabling the activation of the button when offline. This may be useful when you just want to have one button in the compose toolbar for sending, because the extension could then replace the standard button from Thunderbird if your intention is to always use "Send Later".

### How to build

If you want to build the addon you first have to clone the repository or download the zip file and then you can use `utils/create_xpi.bat` on windows or `utils/create_xpi.sh` if you are on linux. Note that this requires a python installation which is standard on most linux distros, but it is not standard on windows. This will prompt you to specify the version and the version format is like you'd expect (e.g. 1.0 or 1.2.4 etc). Then you can just press enter if you don't want to change the output path and now you have an .xpi file in the parent directory that contains the extension.
