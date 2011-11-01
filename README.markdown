# CommandFusion XBMC Control (Beta version) # 

Demo for controlling XBMC using the JSON-RPC Protocol with CommandFusion's JavaScript API using HTTP via XBMC's webserver.

Test Setup that was used to run this module:
1) Windows Workstation, Windows XP Professional, XBMC Nightly version Oct 26 (http://mirrors.xbmc.org/nightlies/win32/XBMCSetup-20111025-cfa1a05-master.exe)
2) Windows HTPC, Windows 7 Ultimate 64-bit, XBMC Nightly version Oct 26 (http://mirrors.xbmc.org/nightlies/win32/XBMCSetup-20111025-cfa1a05-master.exe)
3) Mac Mini, Mac OS X 10.9, XBMC Nightly version Oct 26 (http://mirrors.xbmc.org/nightlies/win32/XBMCSetup-20111025-cfa1a05-master.exe)

Basic setup for module usage:
- Make sure the XBMC is setup first before loading the gui file.
- Make sure that the latest nightlies are used.

Setting up XBMC to allow control by CF:
1) Go to System -> Settings -> Network -> Services
2) Select the options "Allow control of XBMC via HTTP" and "Allow programs on this systems to control XBMC". 
	Automatically, the "Allow programs on other systems to control XBMC" will be enabled as well.
3) Default port is usually 8080. Change the port if other applications are using the same port i.e. Apache webserver, etc. 
	Else, can leave it as it is.
4) Change the username and password if needed. By default it's "xbmc" for both username and password. Leaving both blank is also fine.

Setting up the module for use:
1) The recommended and fastest way is to load the GUI file and go to the "Settings" dropdown menu. Clicking the top right button with a gear icon in it.
	- Enter the settings that you've set earlier when you setup the XBMC under the "Network -> Services" on the dropdown menu.
	- Once "Done" is pressed, the lists for Recently Added Episodes, Movies and Albums will be loaded and should be visible on the Main Menu. 
		The length of wait will depends on the amount of items being loaded from the databases.
	
2) The second option is to enter the IP settings of the XBMC machine into GUI file via the global token settings.
	- Go to Edit -> Project Properties -> Global Token Manager
	- Change the values as required and save the file.
	- Load the GUI file and the lists of data should be visible.

3) The third option is to manually hardcode the settings in the JS file.
	- Go to the XBMCGUIapp.js file.
	- Scroll all the way down to the CF.userMain function.
	- Search for the commented out line "Manually assign IP address and settings of the system".
	- Enter the required settings, save the file and load the project.
	
Some troubleshooting ideas:
1) Make sure the settings used are correct. Use the same settings as under the XBMC's "Network -> Services".
2) Make sure that the port used are not being used by other programs or being blocked by firewall. Try changing the port number to a not commonly used port.
3) Make sure the options "Allow control of XBMC via HTTP" and "Allow programs on this system to control XBMC" is selected.
4) Try to send some JSON commands directly using tools like Google Chrome's Simple Rest Client to test for feedback and connectivity.
	(http://voxcommando.com/forum/index.php?action=dlattach;topic=10.0;attach=436;image)

Additional notes:
Since this is only a beta version of the module, not all the features are implemented yet.
- the wifi LED status will remain red.
- Buttons for "Video Player Options" and "Audio Player Options" under the Playing Now page are not assigned any actions yet.
- Gesture is only available on Main Menu page and in portrait mode only at the moment. Not all gestures are currently assigned with actions.

*Please help to post any bug/issues that is encountered using this module. Any inputs or suggestions are also welcomed.