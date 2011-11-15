# CommandFusion XBMC Control (Beta version)

Demo for controlling XBMC using the JSON-RPC Protocol with CommandFusion's JavaScript API using HTTP via XBMC's webserver.

![XBMC TV Shows](https://github.com/CommandFusion/XBMC/raw/master/Docs/XBMC_TVShows.png)  
![XBMC Movies](https://github.com/CommandFusion/XBMC/raw/master/Docs/XBMC_Movies.png)

### Test Setup that was used to run this module:
1. Windows Workstation, Windows XP Professional, [XBMC Nightly version Oct 25](http://mirrors.xbmc.org/nightlies/win32/XBMCSetup-20111025-cfa1a05-master.exe)
1. Windows HTPC, Windows 7 Ultimate 64-bit, XBMC Nightly version Oct 26 
1. Mac Mini, Mac OS X 10.9, XBMC Nightly version Oct 26 

### Basic setup for module usage:
* Make sure the XBMC is setup first before loading the gui file.
* Make sure that the latest nightlies are used.

### Setup Video
[![XBMC Settings](https://github.com/CommandFusion/XBMC/raw/master/Docs/XBMC_Settings.png)](http://vimeo.com/commandfusion/xbmcsettings)

### Setting up XBMC to allow control by CF
1. Go to System -> Settings -> Network -> Services
1. Select the options "Allow control of XBMC via HTTP" and "Allow programs on this systems to control XBMC".  
   Automatically, the "Allow programs on other systems to control XBMC" will be enabled as well.
1. Default port is usually 8080. Change the port if other applications are using the same port i.e. Apache webserver, etc. Else, can leave it as it is.
1. Change the username and password if needed. By default it's "xbmc" for both username and password. Leaving both blank is also fine.

###  Setting up the module for use
1. The recommended and fastest way is to load the GUI file and go to the "Settings" dropdown menu. Clicking the top right button with the gear icon.
   * Enter the settings that's under the "Network -> Services" settings on the dropdown menu.
   * Once "Done" is pressed on the keyboard, the lists for Recently Added Episodes, Movies and Albums will be loaded and should be visible on the Main Menu. The delay will depend on the amount of items being loaded from the databases.
	
1. The second option is to enter the IP settings of the XBMC machine into the GUI file via the global token manager.
   * Go to Edit -> Project Properties -> Global Token Manager
   * Change the values as required and save the file.
   * Load the GUI file and the lists of data should be visible if connected correctly.

1. The third option is to manually hardcode the settings in the JS file.
   * Go to the XBMCGUIapp.js file.
   * Scroll all the way down to the CF.userMain function.
   * Search for the commented out line "Manually assign IP address and settings of the system".
   * Enter the required settings, save the file and load the project.
	
### Some troubleshooting ideas
1. Make sure the settings used are correct. Use the same settings as under the XBMC's "Network -> Services".
1. Make sure that the port used is not being used by other programs or being blocked by firewall. Try changing the port number to a less commonly used port.
1. Make sure the options "Allow control of XBMC via HTTP" and "Allow programs on this system to control XBMC" are selected.
1. Try to send some JSON commands directly using tools like [Google Chrome's Simple Rest Client](http://voxcommando.com/forum/index.php?action=dlattach;topic=10.0;attach=436;image) to test for feedback and connectivity.

### Additional notes
Since this is only a beta version of the module, not all the features are implemented yet.
* The wifi LED status will remain red.
* Buttons for "Video Player Options" and "Audio Player Options" under the Playing Now page are not assigned actions yet.
* Gestures are only available on Main Menu page in portrait mode at the moment.

### Bug Reporting/Feature Requests
Please help to post any bug/issues that is encountered using this module. Any inputs or suggestions are also welcomed.
	* Bug fixes for the current beta version will be pushed to the master branch.
	* New features / additional requests will be pushed to the developemental branch.

Use the [issues](https://github.com/CommandFusion/XBMC/issues) tab of this GitHub repo to report your bugs/feature requests