/*  XBMC module for CommandFusion
===============================================================================

AUTHOR:		Terence & Jarrod Bell, CommandFusion
CONTACT:	support@commandfusion.com
URL:		https://github.com/CommandFusion/XBMC (Master branch - current beta version. All bug fixes will be updated here)
			https://github.com/CommandFusion/XBMC/tree/Developemental (Developement branch - Additional new features/requests will be added here)
VERSION:	v0.0.1 (beta release)
LAST MOD:	15 November 2011

=========================================================================

Module Test Setup:
- Windows XP Professional Edition 
- Windows 7 Ultimate
- MacMini 
- XBMC Night Version Pre 11.0 Git: 20111005-288f496(Compiled October 6 2011).
	*Please use the latest nightlies : http://mirrors.xbmc.org/nightlies/win32/XBMCSetup-20111025-cfa1a05-master.exe version was used for the latest testing.
- Installer File: XBMCSetup-20111005-288f496-master.exe (dated 7 October) 
- Guidesigner 2.3.5.2
- iViewer4, iViewer Next 4.0.6 & iViewer TF v4.0.6

HELP:

TODO

=========================================================================
*/

// ======================================================================
// Global Object
// ======================================================================

var XBMC_Controller = function(params) {

	var self = {
		// Connection definitions
		sysname:			"",			// system name for selected XBMC instance
		url:				"",			// url for selected XBMC instance
		port:				"",			// port for selected XBMC isntance. Default is 8080
		username:			null,		// username or null for authentification
		password:			null,		// password or null for authentification
		URL:				null,		// final url used for requests
		// General parameters
		reqID:				0,			// next request ID, used internally
		apiVersion:			null,		// XBMC API version, gathered at init
		lastError:			null,		// The last error that occurred when talking to XBMC
		currentShowID:		null,
		currentShow:		"",			// Name of the current show
		currentSeasonID:	null,
		currentSeason:		"",			// Name of the current season
		currentEpisodeID:	null,
		currentEpisodeFile: null,
		currentVol:			0,			// Actual volume level returned from XBMC
		currentMute:		0,			// Current mute state of XBMC
		
		currentMovieID:		null,		//Movie id
		
		currentArtistID:	null,		//Artist id
		currentAlbumID:		null,		//Album id
		currentSongID:		null,		//Song id
		currentSongFile: 	null,		//Song File
		
		joinLEDStatus:		4006,		// join number for LED feedback
		
		//system parameters
		glbSystem: "",
		glbURL: "",
		glbPort: "",
		glbUsername: "",
		glbPassword: "",
	};

	//--------------------------------------------------------------------------------------------------
	// Functions
	//--------------------------------------------------------------------------------------------------
	
	// 	Passing a variable into regex, using RegExp()
	//  /g enables "global" matching. When using the replace() method, specify this modifier to replace all matches, rather than only the first one.
    //	/i makes the regex match case insensitive.
    //	/m enables "multi-line mode". In this mode, the caret and dollar match before and after newlines in the subject string. 
	function newCompare(compare_string, search_string){
		var newRegX = new RegExp(search_string, "gi");
		return compare_string.match(newRegX);
	};
	
	// maths function - rounding number
	function round(n,dec) {
		n = parseFloat(n);
			if(!isNaN(n)){
				if(!dec) var dec= 0;
				var factor= Math.pow(10,dec);
				return Math.floor(n*factor+((n*factor*10)%10>=5?1:0))/factor;
			}else{
			return n;
			}
	};
	
	//function for decoding string with accents
	function decode_utf8(string)
	{
		return decodeURIComponent(escape(string));
	};
	
	// Based on Persistent Data Storage JS Snippet by Florent.																		
	// At any point in your code, you can save the contents of SomeGlobalArray by doing: savePersistentData("SavedArray", someArray);
	function savePersistentData(token, dataObject) {
		CF.setToken(CF.GlobalTokensJoin, token, JSON.stringify(dataObject));
	};
	
	function restorePersistentData(token, defaultValue, callback) {
		CF.getJoin(CF.GlobalTokensJoin, function(j,v,t) {
			if (!t.hasOwnProperty(token) || t[token] === "") {
				restored = defaultValue;
			} else {
				try {
					restored = JSON.parse(t[token]);
				}
				catch(e) {
					restored = defaultValue;
				}
			}
		callback.apply(null, restored);
		});
	};
	
	// XBMC Bonjour lookup
	var BonjourInstances = new Array();

	function startXBMCLookup() {
			
			BonjourInstances = [];
			
			CF.startLookup("_xbmc-jsonrpc-h._tcp", "", function(addedServices, removedServices, error) {
				try {
					
					// remove disappearing services
						BonjourInstances.forEach(function(service, index) {
							if (removedServices.some(function(item) { return (item.name == service.name); })) {
								CF.log("Closed XBMC instance [" + index + "]: " + service.name);
							BonjourInstances.splice(index, 1);
							
							//update the instance 
							//CF.listRemove("l4060");
							//self.presetInstance();				
							//self.retrieveGlobalArray();			
							}
						});

					// add new services
						addedServices.forEach(function(service) {
							BonjourInstances.push(service);
							
							// Logging
							CF.logObject(service);
							CF.log("New XBMC instance [" + BonjourInstances.length + "]: " + service.name);
							CF.log("New XBMC address [" + BonjourInstances.length + "]: " + service.addresses);
							CF.log("New XBMC hostname [" + BonjourInstances.length + "]: " + service.hostname);
							CF.log("New XBMC instance [" + BonjourInstances.length + "]: " + service.port);
							
							// Add bonjour instances to lists directly
							CF.listAdd("l4060", [
									{	
									s4060: service.name,
									d4060: {
											tokens: {
												"[instSystem]": service.name,
												"[instURL]": service.addresses[0],
												"[instPort]": service.port,
												"[instUsername]": "xbmc",
												"[instPassword]": "xbmc",
												"[type]": "bonjour"
										}
									}
								}
							]);
						});
				}
				catch (e) {
					CF.log("Exception in XBMC services processing: " + e);
				}
			});
	};

	function stopXBMCLookup() {
		CF.stopLookup("_xbmc-jsonrpc-h._tcp", "");
		CF.log("Stop looking for XBMC")
	};
	
	
	self.getXBMCBonjour = function(join, value, tokens) {
			CF.listRemove("l4060");
			//self.presetInstance();				
			self.retrieveGlobalArray();	
			startXBMCLookup();
			setTimeout(stopXBMCLookup, 10000);		
	};
	
	//--------------------------------------------------------------------------------------------------
	// Main Program starts here
	//--------------------------------------------------------------------------------------------------
	
	/**
	 * Make a RPC request. Callback will receive the returned object, or null if an error occurred.
	 * In case of error, you can use xbmc.lastError to get the last error.
	 * @param {String}		The RPC Method to call
	 * @param {Object}		The params for the RPC call
	 * @param {function}	The function to call with the reply data
	 */
	 
	self.rpc = function(method, params, callback) {
		try {
			self.reqID++;
			var json = {
				"jsonrpc": "2.0",
				"method": method,
				"params": params,
				"id": self.reqID
			};
			var host = self.URL + "jsonrpc";
			CF.request(host, "POST", null, JSON.stringify(json), function(status, headers, body) {
				try {
					if (status == 200) {
						
						CF.setJoin("d"+self.joinLEDStatus, 1);	// Reply ok, XBMC is connected, LED fb status is on (green)
						CF.setJoin("d4018", 0);					// Show the disable page
						stopXBMCLookup();						// Stop bonjour lookup 
						
						var data = JSON.parse(body);
						if (data.error !== undefined) {
							self.lastError = data.error;
							CF.log("ERROR REPLY ---------");
							CF.logObject(self.lastError);
						} else {
							callback(JSON.parse(body));
						}
					} else {
                        
						CF.setJoin("d"+self.joinLEDStatus, 0);	// Reply not ok, XBMC disconnected, LED fb status is off (red)
						CF.setJoin("d4018", 1);					// Hide the disable page
						
						// Start bonjour lookup for other available instances of XBMC to switch to 
						CF.listRemove("l4060");
						//self.presetInstance();				
						//self.retrieveGlobalArray();	
						startXBMCLookup();
						
						self.lastError = (typeof(body)=="string" && body.length>0) ? body : "HTTP status: " + status;
						CF.log("ERROR REPLY ---------");
						CF.logObject(self.lastError);
					}
				} catch(e) {
					CF.log("Exception caught while processing response in xbmc.rpc: " + e);
				}
			});
		} catch (e) {
			CF.log("Exception caught in xbmc.rpc: " + e);
		}
	};
	
	// Formatting the URL request string
	self.getURL = function() {
		var host;
		if (self.username != null) {
			if (self.password != null)
				host = "http://" + self.username + ":" + self.password + "@" + self.url + ":" + self.port + "/";
			else
				host = "http://" + self.username + "@" + self.url + ":" + self.port + "/";
		} else {
			host = "http://" + self.url + ":" + self.port + "/";
		}
		return host;	
	};
	
	//--------------------------------------------------------------------------------------------------
	// Setup Functions
	//--------------------------------------------------------------------------------------------------
	
	var XBMCInstancesArray = new Array();
	
	self.retrieveGlobalArray = function() {
	
			CF.getJoin(CF.GlobalTokensJoin, function(j,v,t) {
			try {
				myArray = JSON.parse(t["[addInstanceArray]"]);
				XBMCInstancesArray = myArray;
				CF.listAdd("l4060", myArray);
				
			} catch ( e ) {
				myArray = [];  // token value not found (first run?)
			}
		});
	
	/*
	// restore an array we saved in the "SavedArray" global token, and the first-time contents of the array is [0,1,2]
		restorePersistentData("[addInstanceArray]", [0,1,2], function(restoredValue) {
			// we can now used the contents of the array we saved
			
			CF.listAdd("l4060", restoredValue);
		});
	*/	
		
	};
	
	self.setup = function() {
		
		self.URL = self.getURL();
		
		// Stop unwatching any previous watch events on the join (if any)
		CF.unwatch(CF.JoinChangeEvent, "d4056");
		
		// Start watching changes to d4056
		CF.watch(CF.JoinChangeEvent, "d4056", self.getXBMCBonjour);
		
		// Update XBMC Instances list population everytime setup is run.
		CF.listRemove("l4060");				// remove list of previous entries
		//self.presetInstance();			// add non-deletable preset instances (hardcoded into JS script). Disable this option if you do not want to load preset instances.
		self.retrieveGlobalArray();			// add new instances through System settings in the drop down menu (user entry needed)
		startXBMCLookup();					// add new available instances through searching using bonjour lookup
		setTimeout(stopXBMCLookup, 10000);	// stop bonjour lookup after 10s
		
		TVSerieslistArray = [];
		RecentEpisodelistArray = [];
		WatchedEpisodelistArray = [];
		
		MovieslistArray = [];
		RecentMovieslistArray = [];
		MovieSearchlistArray = [];
		
		ArtistlistArray = [];
		AlbumlistArray = [];			// Global array for all Albums
		SonglistArray = [];			// Global array for all Songs
		RecentAlbumlistArray = [];		// Global array for Recent Added Albums
		RecentSonglistArray = [];		// Global array for Recent Added Songs
	};
	
	
	
	/*--------------------------------------------------------------------------------------------------
		TV SHOWS 
		- Data: TV Series, Season, Episode, Episode Details, Recently Added Episodes
		- Sort order : Ascending, Descending
		- Sort method : TV Show		*Name, episodes, year
						Season		*Name only
						Episodes	*Name, episode, rating, MPAA rating, prod code, date, times played   
	----------------------------------------------------------------------------------------------------*/
	
	var TVSerieslistArray = new Array();		//Global array for TV Series
	var RecentEpisodelistArray = new Array();
	var WatchedEpisodelistArray = new Array();		// Data array for watched list
	
	/*
	 * Function: Get a list of TV shows from XBMC, sorted in alphabetical order by default
	 */
	self.getTVShows = function(baseJoin, order, method, sort_order, sort_method) {
		CF.setJoin("s4020", order);
		CF.setJoin("s4021", method);
				
		self.rpc("VideoLibrary.GetTVShows", {"sort": { "order": order, "method": method}, "properties": ["thumbnail", "fanart", "title", "year", "episode", "genre"]}, function(data) {
				TVSerieslistArray = [];			//initialize array
				CF.listRemove("l"+baseJoin);	//clear list of any previous entries
			
				for (var i = 0; i<data.result.limits.total; i++) {							
				
				var showID = data.result.tvshows[i].tvshowid;
				var thumbnail = self.URL + "vfs/" + data.result.tvshows[i].thumbnail;
				var fanart = self.URL + "vfs/" + data.result.tvshows[i].fanart;
				var title = decode_utf8(data.result.tvshows[i].title);
				var year = data.result.tvshows[i].year;
				var episode = data.result.tvshows[i].episode;
				var genre = decode_utf8(data.result.tvshows[i].genre);
				
				var sortlabel;
				if(method == "label"){
					sortlabel = title;
				} else if(method == "year"){
					sortlabel = year;
				
				} else if (method == "episode"){
					sortlabel = episode + " episodes";
				} 
				
				TVSerieslistArray.push({				// Add to array to add to list in one go later
					s4031: thumbnail,
					s4032: title,
					s4033: genre,
					s4034: sortlabel,
					s4035: sortlabel,
					d4031: {
						tokens: {
							"[id]": showID,
							"[fanart]": fanart,
							"[series]": title
						}
					}
				});
			}
			CF.setJoin("s"+baseJoin, "TV SHOWS" + " (" + data.result.limits.total + ")");
			CF.listAdd("l"+baseJoin, TVSerieslistArray);
		});
	};
	
	/*
	 * Function: Search the array list of TV shows and get the results that matches exactly/contain the characters in the search string
	 */
	 self.searchTVShows = function(search_string, listJoin){
	 
			templistArray = [];				//initialize array
			CF.listRemove("l"+listJoin);	//clear list of any previous entries
			
		
		// method 1:
		//loop thru all the element in the TV Show Array and display the match
		for (var i = 0;i<TVSerieslistArray.length;i++)
		{
			var searchThumbnail = TVSerieslistArray[i].s4031;
			var searchTitle = TVSerieslistArray[i].s4032;
			var searchTokenId = TVSerieslistArray[i].d4031.tokens["[id]"];
			var searchTokenShowTitle = TVSerieslistArray[i].d4031.tokens["[showname]"];
			
			if(newCompare(TVSerieslistArray[i].s4032, search_string))			// refer to newCompare() from customised function section
			{
				templistArray.push({				// Add to array to add to list in one go later
					s4031: searchThumbnail,
					s4032: searchTitle,
					d4031: {
						tokens: {
							"[id]": searchTokenId,
							"[showname]": searchTokenShowTitle
							}
						}
					});
			}
		}
		CF.listAdd("l"+listJoin, templistArray);
	};
	
	// Use the alphabar to filter the list of albums and display the filtered results only.
	self.alphabarTVShows = function(sliderval, listJoin) {
	
				// Calculate the letter based on the slider value (0-27). To allow for better accuracy of the letter, both 0 and 1 slider values will equal "#" in the slider.
				var letter = "#";
				if (sliderval > 1) {
					// Use ascii char code and convert to the letter (letter A = 65, B = 66, and so on). Use parseInt here otherwise the + symbol might concatenate the numbers together, 
					// rather than add them. This is because parameters may be passed as strings from tokens such as [sliderval]
					letter = String.fromCharCode(63 + parseInt(sliderval));
				}
				CF.setJoin("s4120", letter);
				
				var templistArray = [];				//initialize temporary array
				CF.listRemove("l"+listJoin);	//clear list of any previous entries
			
				//loop thru all the element in the TV Show Array and display the match
				for (var i = 0;i<TVSerieslistArray.length;i++)
				{
					var searchThumbnail = TVSerieslistArray[i].s4031;
					var searchTitle = TVSerieslistArray[i].s4032;
					var searchTokenId = TVSerieslistArray[i].d4031.tokens["[id]"];
					var searchTokenShowTitle = TVSerieslistArray[i].d4031.tokens["[showname]"];
							
					if (letter == "#")												// Non-filtered, display everything
					{
						templistArray.push({				// Add to array to add to list in one go later
							s4031: searchThumbnail,
							s4032: searchTitle,
							d4031: {
								tokens: {
									"[id]": searchTokenId,
									"[showname]": searchTokenShowTitle
									}
								}
						});
					} 
					else if (letter == searchTitle.charAt(0))						// compare the first alphabet of feedback string with the letter selected from slider
					{
						templistArray.push({				// Add to array to add to list in one go later
							s4031: searchThumbnail,
							s4032: searchTitle,
							d4031: {
								tokens: {
									"[id]": searchTokenId,
									"[showname]": searchTokenShowTitle
									}
								}
						});
					}
				}// end for
				CF.listAdd("l"+listJoin, templistArray);
	};
	
	/**
	 * Function: Get a list of Seasons for a particular show from XBMC
	 * @Param {integer} ID of the TV show from the XBMC database
	 */
	
	self.getTVSeasons = function(id, fanart, series, baseJoin, order, method) {
	
		CF.setJoin("s4121", fanart);
		CF.setJoin("s"+baseJoin, "");		// clear previous data in the list label
	
		self.currentShowID = parseInt(id);					
		
		self.rpc("VideoLibrary.GetSeasons", { "tvshowid": self.currentShowID, "sort": {"order": order, "method": method}, "properties": ["season", "episode", "thumbnail", "showtitle", "fanart"] }, function(data) {
			
			// Create array to push all new items in
			var listArray = [];
			CF.listRemove("l"+baseJoin);
			
			// Loop through all returned TV Seasons
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var seasonID = data.result.seasons[i].season;
				var season = data.result.seasons[i].label;
				var episodes = data.result.seasons[i].episode;
				var showtitle = decode_utf8(data.result.seasons[i].showtitle);
				var thumbnail = self.URL + "vfs/" + data.result.seasons[i].thumbnail;
				var fanart = self.URL + "vfs/" + data.result.seasons[i].fanart;
				
				// Add to array to add to list in one go later
				listArray.push({
					s4031: thumbnail,
					s4032: season,
					s4033: showtitle + " (" +episodes + " Episodes)",
					d4031: {
						tokens: {
							"[id]": seasonID,
							"[fanart]": fanart
						}
					}
				});
			}
			
			// Set the header label list
			if(data.result.limits.total < 2){
			CF.setJoin("s"+baseJoin, "["+series+"]" + " (" + data.result.limits.total+ " Season)");
			}else{
			CF.setJoin("s"+baseJoin, "["+series+"]" + " (" + data.result.limits.total+ " Seasons)");
			}
			
			// Use the array to push all new list items in one go
			CF.listAdd("l"+baseJoin, listArray);
		
		});
	};

	/**
	 * Function: Get a list of TV Episodes for a particular show and season from XBMC
	 * @Param {integer} ID of the season from the XBMC database
	 */
	
	self.getTVEpisodes = function(id, fanart, baseJoin, order, method) {
		
		CF.setJoin("s4121", fanart);
		CF.setJoin("s"+baseJoin, "");		// clear previous data in the list label
		
		self.currentSeasonID = parseInt(id);
		
		self.rpc("VideoLibrary.GetEpisodes", { "tvshowid": self.currentShowID, "season": self.currentSeasonID, "sort": {"order": order, "method": method}, 
		"properties": ["thumbnail", "episode", "playcount", "showtitle", "season"]}, function(data) {
			//CF.logObject(data);
			
			// Loop through all returned TV Episodes
			WatchedEpisodelistArray = [];
			
			CF.listRemove("l"+baseJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var episodeID = data.result.episodes[i].episodeid;
				var thumbnail = self.URL + "vfs/"+data.result.episodes[i].thumbnail;
				var episodenum = data.result.episodes[i].episode;
				var label = decode_utf8(data.result.episodes[i].label);
				var playcount = data.result.episodes[i].playcount;
				var showtitle = decode_utf8(data.result.episodes[i].showtitle);
				var season = "[Season " +data.result.episodes[i].season+"]";
				
				// Add to array to add to list in one go later
				WatchedEpisodelistArray.push({
					s4031: thumbnail,
					s4032: label,
					s4033: season + " Episode " + episodenum,
					s4034: playcount,
					d4031: {
						tokens: {
							"[id]": episodeID
						}
					},
					d4032: (playcount > 0) ? 1 : 0,				// sets watched/unwatcehd status
				});
			}
			
			CF.setJoin("s"+baseJoin, "[" + showtitle + "] " + season + " (" + data.result.limits.total + " eps)");				// Hide TVShow Details subpage
			CF.listAdd("l"+baseJoin, WatchedEpisodelistArray);
			
		});
	};
	
	self.sortTVEpisodes = function(baseJoin, order, method) {
		
		CF.setJoin("s4020", order);	 
		CF.setJoin("s4021", method);
		
		self.rpc("VideoLibrary.GetEpisodes", { "tvshowid": self.currentShowID, "season": self.currentSeasonID, "sort": {"order": order, "method": method}, 
		"properties": ["thumbnail", "episode", "playcount", "firstaired", "showtitle", "season", "rating", "runtime"]}, function(data) {
			//CF.logObject(data);
			
			// Loop through all returned TV Episodes
			WatchedEpisodelistArray = [];
			
			CF.listRemove("l"+baseJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var episodeID = data.result.episodes[i].episodeid;
				var thumbnail = self.URL + "vfs/"+data.result.episodes[i].thumbnail;
				var episodenum = data.result.episodes[i].episode;
				var label = decode_utf8(data.result.episodes[i].label);
				var playcount = data.result.episodes[i].playcount;
				var runtime = data.result.episodes[i].runtime;
				var showtitle = decode_utf8(data.result.episodes[i].showtitle);
				var rating = data.result.episodes[i].rating;
				var firstaired = decode_utf8(data.result.episodes[i].firstaired);
				var season = "[Season " +data.result.episodes[i].season+"] ";
				
				var sortlabel;
				if(method == "label"){
					sortlabel = " Episode " + episodenum;
				} else if(method == "episode"){
					sortlabel = " Episode " + episodenum;
				} else if(method == "videorating"){		 
					sortlabel = rating.toFixed(2);
				} else if(method == "date"){
					sortlabel = firstaired;
				} else if(method == "videoruntime"){				
					sortlabel = runtime + " min";
				}
				
				// Add to array to add to list in one go later
				WatchedEpisodelistArray.push({
					s4031: thumbnail,
					s4032: label,
					s4033: season + sortlabel,
					s4034: playcount,
					d4031: {
						tokens: {
							"[id]": episodeID
						}
					},
					d4032: (playcount > 0) ? 1 : 0,				// sets watched/unwatcehd status
				});
			}
			CF.listAdd("l"+baseJoin, WatchedEpisodelistArray);
			CF.setJoin("s"+baseJoin, "[" + showtitle + "] " + season + " (" + data.result.limits.total + " eps)");				// Hide TVShow Details subpage
		});
	};

	/**
	 * Function: Get a list of TV Episodes for a particular show and season from XBMC
	 * @Param {integer} ID of the season from the XBMC database
	 */
	self.getTVEpisodeDetails = function(id, baseJoin) {
		
		self.currentEpisodeID = parseInt(id);
		self.rpc("VideoLibrary.GetEpisodeDetails", { "episodeid": self.currentEpisodeID, "properties": ["thumbnail","fanart","title","plot","showtitle","season","episode","runtime","firstaired","rating","file"]}, function(data) {
			//CF.logObject(data);
			
			var episodeID = data.result.episodedetails.episodeid;
			var thumbnail = self.URL + "vfs/"+data.result.episodedetails.thumbnail;
			var fanart = self.URL + "vfs/"+data.result.episodedetails.fanart;
			var title = decode_utf8(data.result.episodedetails.episode + ". " + data.result.episodedetails.label);
			var plot = decode_utf8(data.result.episodedetails.plot);
			var showtitle = "Show Title: " + decode_utf8(data.result.episodedetails.showtitle);
			var season = "Season: " + data.result.episodedetails.season;
			var episode = "Episode: " + data.result.episodedetails.episode;
			var runtime = "Runtime: " + data.result.episodedetails.runtime + " min";
			var firstair = "Premiered: " + data.result.episodedetails.firstaired;
			var rating = "Rating: " + (Math.round(data.result.episodedetails.rating*1000))/1000 + "/" + "10";
			self.currentEpisodeFile = decode_utf8(data.result.episodedetails.file);
			
			CF.setJoins([
				{join: "s"+(baseJoin+1), value: thumbnail},			// Thumbnail
				{join: "s"+(baseJoin+2), value: title},			// Title
				{join: "s"+(baseJoin+3), value: plot},			// Plot
				{join: "s"+(baseJoin+4), value: showtitle},		// Showtitle
				{join: "s"+(baseJoin+5), value: season},		// Season
				{join: "s"+(baseJoin+6), value: episode},		// Episode
				{join: "s"+(baseJoin+7), value: runtime},		// Runtime
				{join: "s"+(baseJoin+8), value: firstair},		// First Aired
				{join: "s"+(baseJoin+9), value: rating},		// Rating
				{join: "d"+baseJoin, value: 1}					// Show Subpage
			]);
			
			CF.setJoin("s4121", fanart);
		});
	};
	
	self.playEpisode = function() {
		self.rpc("Player.Open", {"item": {"file": self.currentEpisodeFile}}, self.logReplyData);
		setTimeout(self.rpc("Playlist.Add", { "playlistid":1, "item":{"file": self.currentEpisodeFile}}, self.logReplyData), 500);
		//self.getVideoPlayerStatus();		// Set feedback status on Play/Pause button
	};
	
	self.addEpisodePlaylist = function() {
		self.rpc("Playlist.Add", { "playlistid":1, "item":{"file": self.currentEpisodeFile}}, self.logReplyData);	
	};
	
	self.playRecentEpisode = function(file) {
		self.currentEpisodeFile = file;
		self.rpc("Player.Open", {"item": {"file": self.currentEpisodeFile}}, self.logReplyData);
		setTimeout(self.rpc("Playlist.Add", { "playlistid":1, "item":{"file": self.currentEpisodeFile}}, self.logReplyData), 500);
		//self.getVideoPlayerStatus();		// Set feedback status on Play/Pause button
	};
	
	/**
	 * Function: Get Recently Added Episodes list from XBMC
	 */
	self.getRecentEpisodes = function(baseJoin) {
	
		self.rpc("VideoLibrary.GetRecentlyAddedEpisodes", {"properties":["thumbnail", "season", "showtitle", "file"]}, function(data) {
					//CF.logObject(data);
				
						// Create array to push all new items in
						RecentEpisodelistArray = [];		//for TV Show Page
												
						// Clear the list
						CF.listRemove("l"+baseJoin);
						
						// Loop through all returned playlist item
						for (var i = 0; i<data.result.limits.total; i++) {
						var episodeid = data.result.episodes[i].episodeid ;
						var thumbnail = self.URL + "vfs/"+data.result.episodes[i].thumbnail;
						var label = decode_utf8(data.result.episodes[i].label);
						var season = data.result.episodes[i].season;
						var showtitle = decode_utf8(data.result.episodes[i].showtitle);
						var file = decode_utf8(data.result.episodes[i].file);
						
						// Add to array to add to list in one go later
						RecentEpisodelistArray.push({
							s4031: thumbnail,
							s4032: label,
							s4033: "["+showtitle+"] "+"Season "+season,
							d4031: {
								tokens: {
								"[id]": episodeid,
								"[file]": file
								}
							},
							
						});
					}
					// Use the array to push all new list items in one go
					CF.listAdd("l"+baseJoin, RecentEpisodelistArray);
					CF.setJoin("s"+baseJoin, "RECENT ADDED EPISODES " + "(" + data.result.limits.total + ")" );
				});	
	};
	
	/*
	 * Function: List all the genres
	 */
	 self.getTVShowsGenre = function(baseJoin){

	 self.rpc("VideoLibrary.GetGenres", {"type":"tvshow", "sort": {"order": "ascending", "method": "label"}}, function(data) {
			//CF.logObject(data);
			
			listArray = [];					//initialize array
			CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
		for (var i = 0; i<data.result.limits.total; i++) {
				
				var label = data.result.genres[i].label;
				
				// Add to array to add to list in one go later
				listArray.push({
					s4031: label,
					d4031: {
						tokens: {
							"[genre]": label
						}
					}
				});
			}
		CF.listAdd("l"+baseJoin, listArray);
		});
	};
	
	self.getTVShowsGenreDetails = function(genre, baseJoin){
	 
			templistArray = [];				//initialize array
			CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
		for (var i = 0;i<TVSerieslistArray.length;i++)
		{
			var searchThumbnail = TVSerieslistArray[i].s4031;
			var searchTitle = TVSerieslistArray[i].s4032;
			var searchGenre = TVSerieslistArray[i].s4033;
			var searchTVSeriesID = TVSerieslistArray[i].d4031.tokens["[id]"];
			//var searchTokenShowTitle = TVSerieslistArray[i].d4031.tokens["[showname]"];
			
			if(newCompare(TVSerieslistArray[i].s4033, genre))			// refer to newCompare() from customised function section
			{
				templistArray.push({				// Add to array to add to list in one go later
					s4031: searchThumbnail,
					s4032: searchTitle,
					s4035: searchGenre,
					d4031: {
						tokens: {
							"[id]": searchTVSeriesID
							//"[showname]": searchTokenShowTitle
						}
					}
				});
			}
		}
		CF.listAdd("l"+baseJoin, templistArray);
	};
	
	// Get list of unwatched TV Shows only
	self.getUnwatchedEpisodes = function(baseJoin){
	 
			templistArray = [];				//initialize array
			CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
		for (var i = 0;i<WatchedEpisodelistArray.length;i++)
		{
			var watchedThumbnail = WatchedEpisodelistArray[i].s4031;
			var watchedTitle = WatchedEpisodelistArray[i].s4032;
			var watchedDesc = WatchedEpisodelistArray[i].s4033;
			var watchedPlaycount = WatchedEpisodelistArray[i].s4034;
			var watchedTVEpisodeID = WatchedEpisodelistArray[i].d4031.tokens["[id]"];
			
			if(WatchedEpisodelistArray[i].s4034 == 0)			// Only episodes that are unwatched
			{
				templistArray.push({				// Add to array to add to list in one go later
					s4031: watchedThumbnail,
					s4032: watchedTitle,
					s4033: watchedDesc,
					d4031: {
						tokens: {
							"[id]": watchedTVEpisodeID
						}
					},
					//d4032: (playcount > 0) ? 1 : 0,
				});
			}
		}
		CF.listAdd("l"+baseJoin, templistArray);
	};
	
	// Get list of unwatched TV Shows only
	self.getAllEpisodes = function(baseJoin){
	 
			templistArray = [];				//initialize array
			CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
		for (var i = 0;i<WatchedEpisodelistArray.length;i++)
		{
			var watchedThumbnail = WatchedEpisodelistArray[i].s4031;
			var watchedTitle = WatchedEpisodelistArray[i].s4032;
			var watchedDesc = WatchedEpisodelistArray[i].s4033;
			var watchedPlaycount = WatchedEpisodelistArray[i].s4034;
			var watchedTVEpisodeID = WatchedEpisodelistArray[i].d4031.tokens["[id]"];
			
				templistArray.push({				// Add to array to add to list in one go later
					s4031: watchedThumbnail,
					s4032: watchedTitle,
					s4033: watchedDesc,
					d4031: {
						tokens: {
							"[id]": watchedTVEpisodeID
						}
					},
					d4032: (watchedPlaycount > 0) ? 1 : 0,
				});
		}
		CF.listAdd("l"+baseJoin, templistArray);
	};
	
	/*--------------------------------------------------------------------------------------------------
		MOVIES
		- Data: Movies, Movie Details, Recently Added Movies
		- Sort order : Ascending, Descending
		- Sort method : *Name, rating, MPAA rating, year, runtime, date added, times played
	----------------------------------------------------------------------------------------------------*/
	
	var MovieslistArray = new Array();			//Global array for Movies
	var RecentMovieslistArray = new Array();	//Glbal Array for Recent Added Movies
	var MovieSearchlistArray = new Array();
	
	
	/**
	 * Function: Get a list of Movies from XBMC
	 * @Param {integer} ID of the Movie from the XBMC database
	 */
	self.getMovies = function(baseJoin, order, method) {
		
		CF.setJoin("s4051", order);
		CF.setJoin("s4052", method);
		
		self.rpc("VideoLibrary.GetMovies", { "sort": {"order": order, "method": method}, "properties": ["thumbnail", "genre", "playcount", "mpaa", "rating", "runtime", "year"]}, function(data) {
			//CF.logObject(data);
			
			MovieslistArray = [];
			CF.listRemove("l"+baseJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var movieID = data.result.movies[i].movieid;
				var thumbnail = self.URL + "vfs/" + data.result.movies[i].thumbnail;
				var label = decode_utf8(data.result.movies[i].label);
				var genre = decode_utf8(data.result.movies[i].genre);
				var playcount = data.result.movies[i].playcount;
				var mpaa = data.result.movies[i].mpaa;
				var rating = data.result.movies[i].rating;
				var runtime = data.result.movies[i].runtime;
				var year = data.result.movies[i].year;
				
				var sortlabel;
				if(method == "label"){
					sortlabel = "All Movies";
				} else if(method == "mpaarating"){
					sortlabel = mpaa;
				} else if (method == "videorating"){
					sortlabel = rating.toFixed(2);
				} else if (method == "videoruntime"){
					sortlabel = runtime + " min";
				}else if (method == "year"){
					sortlabel = year;
				} 
				
				// Add to array to add to list in one go later
				MovieslistArray.push({
					s4031: thumbnail,
					s4032: label,
					s4033: genre,
					s4034: playcount,
					s4035: "[Movies] " +sortlabel,
					d4031: {
						tokens: {
							"[id]": movieID
						}
					},
					d4032: (playcount > 0) ? 1 : 0,				// sets watched/unwatcehd status
				});
			}
								
			CF.listAdd("l"+baseJoin, MovieslistArray);
			CF.setJoin("s"+baseJoin, "MOVIES " + "(" + data.result.limits.total + ")");				// Show Movie Text and Total Quantity
		});
	};
	
	self.buildMovieWall = function(baseJoin){		
			
		var templistArray = [];			//initialize array
		CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
			// Create a 3 x N row of movie wall, scroll vertically
			for (i=0; i<MovieslistArray.length; i=i+3) {
			var sub = {};
				for (j=0; j<3; j++) {
					if ((i+j) < MovieslistArray.length) {
					
					sub["s"+(j+4031)]= MovieslistArray[i+j].s4031;
					sub["s"+(j+4034)]= MovieslistArray[i+j].s4032;
					sub["d"+(j+4031)] = { 
										tokens : { 
											"[id]": MovieslistArray[i+j].d4031.tokens["[id]"]
											} 
										};
					}// end (i+j) loop
				}//end j loop
				templistArray.push(sub);
			}//end i loop
		
		CF.listAdd("l"+baseJoin, templistArray );
		CF.setJoin("s"+baseJoin, "MOVIES " + "(" + MovieslistArray.length + ")");				// Show Movie Text and Total Quantity
	};

	/**
	 * Function: Get the details for a particular movie from XBMC
	 * @Param {integer} Movie ID from the XBMC database
	 */
	self.getMovieDetails = function(id, baseJoin) {
		self.currentMovieID = parseInt(id);
		self.rpc("VideoLibrary.GetMovieDetails", { "movieid": self.currentMovieID, "properties": ["thumbnail","fanart","title","plot","genre","year","rating","runtime","director","writer","file"] }, function(data) {
			//CF.logObject(data);
			
			var thumbnail 	= self.URL + "vfs/"+data.result.moviedetails.thumbnail;
			var fanart = self.URL + "vfs/"+data.result.moviedetails.fanart;
			var title = decode_utf8(data.result.moviedetails.label);			
			var plot = decode_utf8(data.result.moviedetails.plot);
			var genre = "Genre: " + data.result.moviedetails.genre;
			var year = "Year: " + data.result.moviedetails.year;
			var rating = "Rating: " + (Math.round(data.result.moviedetails.rating*1000))/1000 + "/" + "10";
			var runtime = "Runtime: " + data.result.moviedetails.runtime + " min";
			var director = "Director: "+ decode_utf8(data.result.moviedetails.director);
			var writer = "Writer: " + decode_utf8(data.result.moviedetails.writer);
			
			self.currentMovieFile = decode_utf8(data.result.moviedetails.file);
			
			CF.setJoins([
				{join: "s"+(baseJoin+1), value: thumbnail},		// Thumbnail
				{join: "s"+(baseJoin+2), value: fanart},		// Fan Art
				{join: "s"+(baseJoin+3), value: title},			// Title
				{join: "s"+(baseJoin+4), value: plot},			// Plot
				{join: "s"+(baseJoin+5), value: genre},			// Genre
				{join: "s"+(baseJoin+6), value: year},			// Year
				{join: "s"+(baseJoin+7), value: rating},		// Rating
				{join: "s"+(baseJoin+8), value: runtime},		// Runtime
				{join: "s"+(baseJoin+9), value: director},		// Director
				{join: "s"+(baseJoin+10), value: writer},		// Writer
				{join: "d"+baseJoin, value: 1}					// Show Subpage
			]);
		});
	};

	self.playMovie = function(file) {
		if (file === undefined) {
			var file = self.currentMovieFile;
		}
		self.rpc("Player.Open", { "item":{"file": file} }, self.logReplyData);						// play the file
		self.rpc("Playlist.Add", { "playlistid":1, "item":{ "file": file}}, self.logReplyData);		// automatically adds the file into playlist when played
		//self.getVideoPlayerStatus();		// Set feedback status on Play/Pause button
	};
	
	self.addMoviePlaylist = function(file) {
		if (file === undefined) {
			var file = self.currentMovieFile;
		}
		self.rpc("Playlist.Add", { "playlistid":1, "item":{ "file": file}}, self.logReplyData);	
	};
	
	/*
	 * Function: Search the array list of TV shows and get the results that matches exactly/contain the characters in the search string
	 */
	 self.getSearchedMovieArray = function(search_string, listJoin){
	 
			CF.setJoin("d"+(listJoin+1), 0);		//hide the movie wall list
			CF.setJoin("d"+listJoin, 1);	// show the thumbnail and title wall list only.
			
			//push all values into array into a singular format
			self.rpc("VideoLibrary.GetMovies", { "sort": {"order": "ascending", "method": "label"}, "properties": ["playcount", "title", "thumbnail", "fanart"]}, function(data) {
			
			MovieSearchlistArray = [];
			CF.listRemove("l"+listJoin);
			
			for (i=0; i<data.result.limits.total; i++) {
				var thumbnail = self.URL + "vfs/" + data.result.movies[i].thumbnail;
				var movieid = data.result.movies[i].movieid;
				var title = decode_utf8(data.result.movies[i].title);
				var playcount = data.result.movies[i].playcount;
				
			if(newCompare(title, search_string))			// refer to newCompare() from customised function section)
			{
				//CF.log(thumbnail);
				//CF.log(movieid);
				//CF.log(title);
				
				MovieSearchlistArray.push({				// Add to array to add to list in one go later
					s4031: thumbnail,
					s4032: title,
					s4035: "[MOVIES] All Movies",
					d4031: {
						tokens: {
							"[id]": movieid,
							"[showname]": title
							}
						},
					d4032: (playcount > 0) ? 1 : 0,
					});
			}
			
		}//end for loop
		
		CF.listAdd("l"+listJoin, MovieSearchlistArray);
		});
	};
	
	// Use the alphabar to filter the list of albums and display the filtered results only.
	self.alphabarMovies = function(sliderval, listJoin) {
	
				// Calculate the letter based on the slider value (0-27). To allow for better accuracy of the letter, both 0 and 1 slider values will equal "#" in the slider.
				var letter = "#";
				if (sliderval > 1) {
					// Use ascii char code and convert to the letter (letter A = 65, B = 66, and so on). Use parseInt here otherwise the + symbol might concatenate the numbers together, 
					// rather than add them. This is because parameters may be passed as strings from tokens such as [sliderval]
					letter = String.fromCharCode(63 + parseInt(sliderval));
				}
				CF.setJoin("s4221", letter);
				
				var templistArray = [];				//initialize temporary array
				CF.listRemove("l"+listJoin);	//clear list of any previous entries
			
				for (var i = 0;i<MovieslistArray.length;i++)
				{
					var searchThumbnail = MovieslistArray[i].s4031;
					var searchTitle = MovieslistArray[i].s4032;
					var searchGenre = MovieslistArray[i].s4033;
					var searchMovieID = MovieslistArray[i].d4031.tokens["[id]"];
									
					if (letter == "#")												// Non-filtered, display everything
					{
						templistArray.push({				// Add to array to add to list in one go later
							s4031: searchThumbnail,
							s4032: searchTitle,
							s4033: searchGenre,
							d4031: {
								tokens: {
									"[id]": searchMovieID
								}
							}
						});
					} 
					else if (letter == searchTitle.charAt(0))						// compare the first alphabet of feedback string with the letter selected from slider
					{
						templistArray.push({				// Add to array to add to list in one go later
							s4031: searchThumbnail,
							s4032: searchTitle,
							s4033: searchGenre,
							d4031: {
								tokens: {
									"[id]": searchMovieID
								}
							}
						});
					}
				}// end for
				CF.listAdd("l"+listJoin, templistArray);
	};
	
	/*
	 * Function: Search the array list of TV shows and get the results that matches exactly/contain the characters in the search string
	 */
	 self.getMoviesGenre = function(baseJoin){

	 self.rpc("VideoLibrary.GetGenres", {"type":"movie", "sort": {"order": "ascending", "method": "label"}}, function(data) {
			//CF.logObject(data);
			
			listArray = [];				//initialize array
			CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
		// method 1:
		//loop thru all the element in the TV Show Array and display the match
		for (var i = 0; i<data.result.limits.total; i++) {
				
				var label = decode_utf8(data.result.genres[i].label);
				//var genre = data.result.genres[i].title;
				
				//CF.log ("label " + label);
				//CF.log ("title " + genre);
				
				// Add to array to add to list in one go later
				listArray.push({
					s4031: label,
					d4031: {
						tokens: {
							"[genre]": label
						}
					}
				});
			}
		CF.listAdd("l"+baseJoin, listArray);
	
		//CF.setJoin("s300", "GENRES " + "(" + data.result.limits.total + ")");				// Show Genre Total Count
		});
	};
	
	self.getMoviesGenreDetails = function(genre, baseJoin){
	 
			templistArray = [];				//initialize array
			CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
		// method 1:
		//loop thru all the element in the TV Show Array and display the match
		for (var i = 0;i<MovieslistArray.length;i++)
		{
			var searchThumbnail = MovieslistArray[i].s4031;
			var searchTitle = MovieslistArray[i].s4032;
			var searchGenre = MovieslistArray[i].s4033;
			var searchMovieID = MovieslistArray[i].d4031.tokens["[id]"];
			
			if(newCompare(MovieslistArray[i].s4033, genre))			// refer to newCompare() from customised function section
			{
				templistArray.push({				// Add to array to add to list in one go later
					s4031: searchThumbnail,
					s4032: searchTitle,
					s4033: searchGenre,
					d4031: {
						tokens: {
							"[id]": searchMovieID
						}
					}
				});
			}
		}
		CF.setJoin("s"+baseJoin, genre);
		CF.listAdd("l"+baseJoin, templistArray);
	};
	
	/**
	 * Function: Get Recently Added Movies list from XBMC
	 */
	//self.getRecentMovies = function(baseJoin, baseJoinMainPage) {
	self.getRecentMovies = function(baseJoin) {
		self.rpc("VideoLibrary.GetRecentlyAddedMovies", {"properties":["thumbnail", "file"]}, function(data) {
					//CF.logObject(data);
				
						// Create array to push all new items in
						RecentMovieslistArray = [];			// for Movie Page
					
						// Clear the list
						CF.listRemove("l"+baseJoin);
						//CF.listRemove("l"+baseJoinMainPage);
						
						// Loop through all returned playlist item
						for (var i = 0; i<data.result.limits.total; i++) {
						
						var movieid = data.result.movies[i].movieid ;
						var thumbnail = self.URL + "vfs/"+data.result.movies[i].thumbnail;
						var label = decode_utf8(data.result.movies[i].label);
						var file = decode_utf8(data.result.movies[i].file);
						
						// Add to array to add to list in one go later
						RecentMovieslistArray.push({
							s4031: thumbnail,
							s4032: label,
							d4031: {
								tokens: {
								"[id]": movieid,
								"[file]": file
								}
							},
							
						});
					}
					// Use the array to push all new list items in one go
					CF.listAdd("l"+baseJoin, RecentMovieslistArray);
					//CF.listAdd("l"+baseJoinMainPage, RecentMovieslistArray);
				
				CF.setJoin("s"+baseJoin, "RECENT ADDED MOVIES " + "(" + data.result.limits.total + ")" );
				//CF.setJoin("s"+baseJoinMainPage, "RECENT ADDED MOVIES " + "(" + data.result.limits.total + ")" );
				});	
	};
	
	// Get list of unwatched TV Shows only
	self.getUnwatchedMovies = function(baseJoin){
	 
			templistArray = [];				//initialize array
			CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
		for (var i = 0;i<MovieslistArray.length;i++)
		{
			var watchedThumbnail = MovieslistArray[i].s4031;
			var watchedTitle = MovieslistArray[i].s4032;
			var watchedSortLabel = MovieslistArray[i].s4035;
			var watchedTVEpisodeID = MovieslistArray[i].d4031.tokens["[id]"];
			
			if(MovieslistArray[i].s4034 == 0)			// Only episodes that are unwatched
			{
				templistArray.push({				// Add to array to add to list in one go later
					s4031: watchedThumbnail,
					s4032: watchedTitle,
					s4035: watchedSortLabel,
					d4031: {
						tokens: {
							"[id]": watchedTVEpisodeID
						}
					},
					//d4032: (playcount > 0) ? 1 : 0,
				});
			}
		}
		CF.listAdd("l"+baseJoin, templistArray);
	};
	
	// Get list of unwatched TV Shows only
	self.getAllMovies = function(baseJoin){
	 
			templistArray = [];				//initialize array
			CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
		for (var i = 0;i<MovieslistArray.length;i++)
		{
			var watchedThumbnail = MovieslistArray[i].s4031;
			var watchedTitle = MovieslistArray[i].s4032;
			var watchedSortLabel = MovieslistArray[i].s4035;
			var watchedPlaycount = MovieslistArray[i].s4034;
			var watchedTVEpisodeID = MovieslistArray[i].d4031.tokens["[id]"];
			
				templistArray.push({				// Add to array to add to list in one go later
					s4031: watchedThumbnail,
					s4032: watchedTitle,
					s4035: watchedSortLabel,
					d4031: {
						tokens: {
							"[id]": watchedTVEpisodeID
						}
					},
					d4032: (watchedPlaycount > 0) ? 1 : 0,
				});
		}
		CF.listAdd("l"+baseJoin, templistArray);
	};
			

	/*--------------------------------------------------------------------------------------------------
		MUSIC
		- Data: Artists, Albums, Songs, Song Details, Recent Added Albums, Recently Added Songs
		- Sort order : Ascending, Descending
		- Sort method : Artist 	*label only
						Album	*label, year, album, artist, rating
						Song	*label, artist, name, time, rating, year, times played, track, title, album
	//--------------------------------------------------------------------------------------------------*/
	
	var ArtistlistArray = new Array();			// Global array for all Artists	
	var AlbumlistArray = new Array();			// Global array for all Albums
	var SonglistArray = new Array();			// Global array for all Songs
	var RecentAlbumlistArray = new Array();		// Global array for Recent Added Albums
	var RecentSonglistArray = new Array();		// Global array for Recent Added Songs
	
	/**
	 * Function: Get a list of Artist from XBMC
	 * @Param {integer} ID of the Artist from the XBMC database
	 */
	self.getMusicArtist = function(baseJoin, order, method) {
		CF.setJoin("s4041", order);						//FB on Options list: Check sort order
		CF.setJoin("s4042", method);					//FB on Options list: Check sort method
		
		self.rpc("AudioLibrary.GetArtists", {"sort": {"order": order, "method": method}, "properties": ["thumbnail", "fanart"]}, function(data) {
			//CF.logObject(data);
			
			// Loop through all returned Artist names
			ArtistlistArray = [];
			CF.listRemove("l"+baseJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var artistID = data.result.artists[i].artistid;
				var thumbnail = self.URL + "vfs/"+ data.result.artists[i].thumbnail;
				var fanart = self.URL + "vfs/"+ data.result.artists[i].fanart;
				var artist = decode_utf8(data.result.artists[i].label);
				
				// Add to array to add to list in one go later
				ArtistlistArray.push({
					s4031: thumbnail,
					s4032: artist,
					d4031: {
						tokens: {
							"[id]": artistID,
							"[fanart]": fanart
						}
					},
					d4032: {
						tokens: {
							"[id]": artistID,
							"[fanart]": fanart
						}
					}
				});
			}
			CF.listAdd("l"+baseJoin, ArtistlistArray);
			CF.setJoin("s"+baseJoin, " All Artists " + "(" + data.result.limits.total + ")" );
		});
	};
	
	
	/**
	 * Function: Get a list of Albums for a particular Artist from XBMC
	 * @Param {integer} ID of the Album from the XBMC database
	 */
	 
	self.getMusicAlbum = function(id, fanart, baseJoin) {
		
		CF.setJoin("s4326", fanart);
	
		self.currentArtistID = parseInt(id);
		self.rpc("AudioLibrary.GetAlbums", { "artistid": self.currentArtistID, "properties": ["thumbnail", "title", "fanart", "artist"] }, function(data) {
			//CF.logObject(data);
			
			// Create array to push all new items in
			var listArray = [];
			CF.listRemove("l"+baseJoin);
			
			// Loop through all returned Albums
			for (var i = 0; i<data.result.limits.total; i++) {
			
				var albumID = data.result.albums[i].albumid;
				var albumtitle = decode_utf8(data.result.albums[i].title);
				var artist = decode_utf8(data.result.albums[i].artist);
				var thumbnail = self.URL + "vfs/" + data.result.albums[i].thumbnail;
				var fanart = self.URL + "vfs/" + data.result.albums[i].fanart;
								
				// Add to array to add to list in one go later
				listArray.push({
					s4031: thumbnail,
					s4032: albumtitle,
					s4033: artist,
					d4031: {
						tokens: {
							"[id]": albumID,
							"[albumtitle]": albumtitle,
							"[artist]": artist,
							"[fanart]": fanart
						}
					},
					d4032: {
						tokens: {
							"[id]": albumID,
							"[albumtitle]": albumtitle,
							"[artist]": artist,
							"[fanart]": fanart
						}
					}
					
				});
			}
			// Use the array to push all new list items in one go
			CF.listAdd("l"+baseJoin, listArray);
			
			//More for language purpose, to differentiate singular and plural items
			if(data.result.limits.total == 1)
			{
			CF.setJoin("s"+baseJoin, artist + " (" + data.result.limits.total + " Album)" );
			}else{
			CF.setJoin("s"+baseJoin, artist + " (" + data.result.limits.total + " Albums)" );
			}
		});
	};
	
	/**
	 * Function: Get a list of Songs for a particular Album and Artist from XBMC
	 * @Param {integer} ID of the Song from the XBMC database
	 */
	self.getMusicSong = function(id, artist, albumtitle, fanart, baseJoin) {
	
		CF.setJoin("s"+baseJoin, "["+artist+"] " + albumtitle);
		CF.setJoin("s4326", fanart);
		
		self.currentAlbumID = parseInt(id);
		self.rpc("AudioLibrary.GetSongs", { "albumid": self.currentAlbumID, "sort": {"order": "ascending", "method": "track"}, "properties": ["thumbnail", "title", "track", "file"]}, function(data) {
			//CF.logObject(data);
			
			// Loop through all returned TV Episodes
			var listArray = [];
			CF.listRemove("l"+baseJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var songID = data.result.songs[i].songid;
				var title = decode_utf8(data.result.songs[i].title);
				var thumbnail = self.URL + "vfs/" + data.result.songs[i].thumbnail;
				var tracknum = "Track #" + data.result.songs[i].track;
				var songfile = decode_utf8(data.result.songs[i].file);
												
				// Add to array to add to list in one go later
				listArray.push({
					s4031: thumbnail,
					s4032: title,
					s4033: tracknum,
					d4031: {
						tokens: {
							"[id]": songID,
							"[file]": songfile
						}
					},
					d4032: {
						tokens: {
							"[id]": songID,
							"[file]": songfile
						}
					},
					//d2: (data.result.songs[i].playcount > 0) ? 1 : 0
				});
			}
			CF.listAdd("l"+baseJoin, listArray);
		});
	};
	
	// Add whole album into playlist and start playing whole album from first song.
	self.addAlbumPlaylist = function(id) {
		
		// Get albumid from token
		self.currentAlbumID = parseInt(id);																							
		
		// Stop any previous playing item
		self.rpc("Player.Stop", {"playerid":0}, self.logReplyData);																	
		
		//Sort the songs by track and insert one by one, according to the position.
		self.rpc("AudioLibrary.GetSongs", { "albumid": self.currentAlbumID, "sort": {"method": "track"}}, function(data) {
			for (var i = 0; i<data.result.limits.total; i++) {
				setTimeout(self.rpc("Playlist.Insert",{"playlistid":0, "item": {"songid": data.result.songs[i].songid}, "position": i}, self.logReplyData), 400);	
			}
		});
		
		// Start playing first item in the list
		setTimeout(function(){self.rpc("Player.Open", {"item": { "playlistid" : 0, "position" : 0}}, self.logReplyData);}, 500);	
	};
	
	/**
	 * Function: Get details for a particular Song, Album and Artist from XBMC
	 */
	 self.getMusicDetails = function(id, file, baseJoin) {
	
		//CF.setJoin("d"+baseJoin, 1);				// Show Song Details subpage
		
		self.currentSongID = parseInt(id);
		self.currentSongFile = file;
		
		self.rpc("AudioLibrary.GetSongDetails", {"songid": self.currentSongID, "properties": ["thumbnail","fanart","title","comment","album","year","artist","duration"]}, function(data) {
			//CF.logObject(data);
			
			var thumbnail = self.URL + "vfs/"+data.result.songdetails.thumbnail;
			var fanart = self.URL + "vfs/"+data.result.songdetails.fanart;
			var title = decode_utf8(data.result.songdetails.title);
			var comment = data.result.songdetails.comment;
			var album = "Album: " + decode_utf8(data.result.songdetails.album);
			var year = "Year: " + data.result.songdetails.year;
			var artist = "Artist: " + decode_utf8(data.result.songdetails.artist);
			var duration = "Runtime: " + ("00"+Math.floor(data.result.songdetails.duration / 60)).slice(-2) + ":" + ("00"+(Math.ceil(data.result.songdetails.duration)% 60)).slice(-2) + " min";
						
			CF.setJoins([
				{join: "s"+baseJoin, value: thumbnail},		// Thumbnail
				//{join: "s"+(baseJoin+1), value: fanart},	// Fan Art
				{join: "s"+(baseJoin+2), value: title},		// Title
				//{join: "s"+(baseJoin+3), value: comment},	// Comment	*Gibberish data extracted, got to find out the correct parameter to extract the info
				{join: "s"+(baseJoin+4), value: album},		// Album
				{join: "s"+(baseJoin+5), value: artist},	// Artist
				{join: "s"+(baseJoin+6), value: year},		// Year
				{join: "s"+(baseJoin+7), value: duration},	// Runtime
			]);
			
			CF.setJoin("s4326", fanart);
		});
	};
	
	/**
	 * Function: Get a list of All Albums from XBMC
	 * @Param {integer} ID of the Album from the XBMC database
	 */
	self.getAllAlbums = function(baseJoin, order, method) {
		
		CF.setJoin("s4041", order);						//FB on Options list: Check sort order
		CF.setJoin("s4042", method);						//FB on Options list: Check sort method
		
		self.rpc("AudioLibrary.GetAlbums", { "sort": {"order": order, "method": method}, "properties": ["thumbnail", "fanart", "artist", "year", "albumlabel"]}, function(data) {
			//CF.logObject(data);
			
			// Loop through all returned Artist names
			AlbumlistArray = [];
			CF.listRemove("l"+baseJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var albumID = data.result.albums[i].albumid;
				var label = decode_utf8(data.result.albums[i].label);
				var artist = decode_utf8(data.result.albums[i].artist);
				var thumbnail = self.URL + "vfs/" + data.result.albums[i].thumbnail;
				var fanart = self.URL + "vfs/" + data.result.albums[i].fanart;
				var year = data.result.albums[i].year;
				var albumlabel = decode_utf8(data.result.albums[i].albumlabel);
				
				var sortlabel;
				if(method == "label"){
					sortlabel = "ALL ALBUMS";
				} else if(method == "year"){
					sortlabel = year;
				} else if (method == "artist"){
					sortlabel = artist;
				} 
				
				// Add to array to add to list in one go later
				AlbumlistArray.push({
					s4031: thumbnail,
					s4032: label,
					s4033: sortlabel,
					d4031: {
						tokens: {
							"[id]": albumID,
							"[fanart]": fanart,
							"[artist]": artist,
							"[albumtitle]": label
						}
					},
					d4032: {
						tokens: {
							"[id]": albumID,
							"[fanart]": fanart,
							"[artist]": artist,
							"[albumtitle]": label
						}
					}
				});
			}
			// Use the array to push all new list items in one go
			CF.listAdd("l"+baseJoin, AlbumlistArray);
			
			CF.setJoin("s"+baseJoin, "All Albums " + "(" + data.result.limits.total + ")" );
		});
	};
	
	/**
	 * Function: Get a list of All Albums from XBMC
	 * @Param {integer} ID of the Album from the XBMC database
	 */
	self.getAllSongs = function(baseJoin, order, method) {
		
		CF.setJoin("s4041", order);						//FB on Options list: Check sort order
		CF.setJoin("s4042", method);						//FB on Options list: Check sort method
		
		self.rpc("AudioLibrary.GetSongs", {"sort": {"order": order, "method": method}, "properties": ["thumbnail", "fanart", "artist", "file", "duration", "year", "track", "album"]}, function(data) {
			//CF.logObject(data);
			
			// Loop through all returned Songs
			SonglistArray = [];
			CF.listRemove("l"+baseJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var songID = data.result.songs[i].songid;
				var label = decode_utf8(data.result.songs[i].label);
				var thumbnail = self.URL + "vfs/" + data.result.songs[i].thumbnail;
				var track = "Track #" + data.result.songs[i].track;
				var artist = decode_utf8(data.result.songs[i].artist);
				var album = decode_utf8(data.result.songs[i].album);
				var duration = data.result.songs[i].duration;							// in seconds
				var year = data.result.songs[i].year;
				var file = decode_utf8(data.result.songs[i].file);
				
				var sortlabel;
				if(method == "label"){
					sortlabel = "ALL SONGS";
				} else if(method == "year"){
					sortlabel = year;
				} else if (method == "artist"){
					sortlabel = artist;
				} else if (method == "album"){
					sortlabel = album;
				} else if (method == "duration"){
					sortlabel = ("00"+Math.floor(duration/60)).slice(-2) + ":" + ("00"+(Math.ceil(duration)%60)).slice(-2);;
				} else if (method == "track"){
					sortlabel = track;
				} 
				
			// Add to array to add to list in one go later
				SonglistArray.push({
					s4031: thumbnail,
					s4032: label,
					s4033: sortlabel,
					d4031: {
						tokens: {
							"[id]": songID,
							"[file]": file
						}
					},
					d4032: {
						tokens: {
							"[id]": songID,
							"[file]": file
						}
					}
				});
			}
			CF.listAdd("l"+baseJoin, SonglistArray);		//By default disable options for all songs. Usually for All Artists and All Albums only.
			
			
			CF.setJoin("s"+baseJoin, "All Songs "+"("+data.result.limits.total+")");
		});
	};
	
	/**
	 * Function: Get Recently Added Albums list from XBMC
	 */
	self.getRecentAlbums = function(baseJoin, baseJoinMainPage) {
	
		self.rpc("AudioLibrary.GetRecentlyAddedAlbums", {"properties":["thumbnail", "artist", "fanart"]}, function(data) {
					//CF.logObject(data);
				
						// Create array to push all new items in
						RecentAlbumlistArray = [];			// for Music Page
												
						// Clear the list
						CF.listRemove("l"+baseJoin);
						CF.listRemove("l"+baseJoinMainPage);
						
						// Loop through all returned playlist item
						for (var i = 0; i<data.result.limits.total; i++) {
						var albumid = data.result.albums[i].albumid ;
						var thumbnail = self.URL + "vfs/"+data.result.albums[i].thumbnail;
						var fanart = self.URL + "vfs/"+data.result.albums[i].fanart;
						var label = decode_utf8(data.result.albums[i].label);
						var artist = decode_utf8(data.result.albums[i].artist);
						
						// Add to array to add to list in one go later
						RecentAlbumlistArray.push({
							s4031: thumbnail,
							s4032: label,
							d4031: {
								tokens: {
								"[id]": albumid,
								"[artist]": artist,
								"[albumtitle]": label,
								"[fanart]": fanart
								}
							},
							d4032: {
								tokens: {
								"[id]": albumid,
								"[artist]": artist,
								"[albumtitle]": label,
								"[fanart]": fanart
								}
							}
						});
					}
					// Use the array to push all new list items in one go
					CF.listAdd("l"+baseJoin, RecentAlbumlistArray);
					CF.listAdd("l"+baseJoinMainPage, RecentAlbumlistArray);
										
					CF.setJoin("s"+baseJoin, "Recently Added Albums " + "(" + data.result.limits.total + ")" );
					CF.setJoin("s"+baseJoinMainPage, "RECENT ADDED ALBUMS " + "(" + data.result.limits.total + ")" );
				});	
		};
	
	/**
	 * Function: Get Recently Added Songs list from XBMC
	 */
	self.getRecentSongs = function(baseJoin) {
	
		self.rpc("AudioLibrary.GetRecentlyAddedSongs", {"properties":["thumbnail", "file"]}, function(data) {
					//CF.logObject(data);
				
						// Create array to push all new items in
						RecentSonglistArray = [];
						
						// Clear the list
						CF.listRemove("l"+baseJoin);
						//CF.listRemove("l"+baseJoinMainPage);
						
						// Loop through all returned playlist item
						for (var i = 0; i<data.result.limits.total; i++) {
						var songid = data.result.songs[i].songid ;
						var thumbnail = self.URL + "vfs/"+data.result.songs[i].thumbnail;
						var label = decode_utf8(data.result.songs[i].label);
						var file = decode_utf8(data.result.songs[i].file);
						
						// Add to array to add to list in one go later
						RecentSonglistArray.push({
							s4031: thumbnail,
							s4032: label,
							d4031: {
								tokens: {
								"[id]": songid,
								"[file]": file
								}
							},
							d4032: {
								tokens: {
								"[id]": songid,
								"[file]": file
								}
							}
						});
					}
					// Use the array to push all new list items in one go
					CF.listAdd("l"+baseJoin, RecentSonglistArray);
					//CF.listAdd("l"+baseJoinMainPage, RecentSonglistArray);
					
					CF.setJoin("s"+baseJoin, "Recently Added Songs " + "(" + data.result.limits.total + ")" );
					//CF.setJoin("s"+baseJoinMainPage, "RECENT ADDED SONGS " + "(" + data.result.limits.total + ")" );
					
				});	
	};
	
	self.playSong = function(file) {				
		if (file === undefined) {
			var file = self.currentSongFile;
		}
		self.rpc("Player.Open", { "item": {"file": file} }, self.logReplyData);
		//self.getAudioPlayerStatus();		// Set feedback status on Play/Pause button
	};
	
	// Add audio files into audio playlist only
	self.addAudioPlaylist = function(file) {
		if (file === undefined) {
			var file = self.currentSongFile;
		}
		self.rpc("Playlist.Add", { "playlistid":0, "item": {"file": file}}, self.logReplyData);	
	};
	
	/*
	 * Function: Search the array list of Artists and get the results that matches exactly/contain the characters in the search string
	 */
	 self.searchArtist = function(search_string, listJoin){
	 
			var templistArray = [];				//initialize array
			CF.listRemove("l"+listJoin);	//clear list of any previous entries
		
		// method 1:
		//loop thru all the element in the TV Show Array and display the match
		for (var i = 0;i<ArtistlistArray.length;i++)
		{
			var searchThumbnail = ArtistlistArray[i].s4031;
			var searchArtist = ArtistlistArray[i].s4032;
			var searchTokenArtistId = ArtistlistArray[i].d4031.tokens["[id]"];
			var searchTokenArtist = ArtistlistArray[i].d4031.tokens["[artist]"];
			var searchToken2ArtistId = ArtistlistArray[i].d4032.tokens["[id]"];
			var searchToken2Artist = ArtistlistArray[i].d4032.tokens["[artist]"];
			
			if(newCompare(searchArtist, search_string))			// refer to newCompare() from customised function section
			{
				templistArray.push({				// Add to array to add to list in one go later
					s4031: searchThumbnail,
					s4032: searchArtist,
					d4031: {
						tokens: {
							"[id]": searchTokenArtistId,
							"[artist]": searchTokenArtist
							}
					},
					d4032: {
						tokens: {
							"[id]": searchToken2ArtistId,
							"[artist]": searchToken2Artist
							}
					}
				});
			}
		}
		CF.listAdd("l"+listJoin, templistArray);
	};
	
	// Use the alphabar to filter the list of albums and display the filtered results only.
	self.alphabarArtists = function(sliderval, listJoin) {
	
				// Calculate the letter based on the slider value (0-27). To allow for better accuracy of the letter, both 0 and 1 slider values will equal "#" in the slider.
				var letter = "#";
				if (sliderval > 1) {
					// Use ascii char code and convert to the letter (letter A = 65, B = 66, and so on). Use parseInt here otherwise the + symbol might concatenate the numbers together, 
					// rather than add them. This is because parameters may be passed as strings from tokens such as [sliderval]
					letter = String.fromCharCode(63 + parseInt(sliderval));
				}
				CF.setJoin("s4323", letter);
				
				var templistArray = [];				//initialize temporary array
				CF.listRemove("l"+listJoin);	//clear list of any previous entries
			
				//loop thru all the element in the TV Show Array and display the match
				for (var i = 0;i<ArtistlistArray.length;i++)
				{
					var searchThumbnail = ArtistlistArray[i].s4031;
					var searchArtist = ArtistlistArray[i].s4032;
					var searchTokenArtistId = ArtistlistArray[i].d4031.tokens["[id]"];
					var searchTokenArtist = ArtistlistArray[i].d4031.tokens["[artist]"];
					var searchToken2ArtistId = ArtistlistArray[i].d4032.tokens["[id]"];
					var searchToken2Artist = ArtistlistArray[i].d4032.tokens["[artist]"];
										
					
					if (letter == "#")												// Non-filtered, display everything
					{
						templistArray.push({				// Add to array to add to list in one go later
							s4031: searchThumbnail,
							s4032: searchArtist,
							d4031: {
								tokens: {
									"[id]": searchTokenArtistId,
									"[artist]": searchTokenArtist
									}
								},
							d4032: {
								tokens: {
									"[id]": searchToken2ArtistId,
									"[artist]": searchToken2Artist
									}
								}
							});
					} 
					else if (letter == searchArtist.charAt(0))						// compare the first alphabet of feedback string with the letter selected from slider
					{
						templistArray.push({				// Add to array to add to list in one go later
							s4031: searchThumbnail,
							s4032: searchArtist,
							d4031: {
								tokens: {
									"[id]": searchTokenArtistId,
									"[artist]": searchTokenArtist
									}
								},
							d4032: {
								tokens: {
									"[id]": searchToken2ArtistId,
									"[artist]": searchToken2Artist
									}
								}
							});
					}
				}// end for
				CF.listAdd("l"+listJoin, templistArray);
	};
	
	/*
	 * Function: Search the array list of Artists and get the results that matches exactly/contain the characters in the search string
	 */
	 self.searchAlbum = function(search_string, listJoin){
	 
			var templistArray = [];				//initialize array
			CF.listRemove("l"+listJoin);	//clear list of any previous entries
		
		// method 1:
		//loop thru all the element in the TV Show Array and display the match
		for (var i = 0;i<AlbumlistArray.length;i++)
		{
			var searchThumbnail = AlbumlistArray[i].s4031;
			var searchAlbum = AlbumlistArray[i].s4032;
			var searchSortLabel = AlbumlistArray[i].s4033;
			var searchTokenAlbumId = AlbumlistArray[i].d4031.tokens["[id]"];
			var searchTokenFanart = AlbumlistArray[i].d4031.tokens["[fanart]"];
			var searchTokenArtist = AlbumlistArray[i].d4031.tokens["[artist]"];
			var searchTokenAlbum = AlbumlistArray[i].d4031.tokens["[albumtitle]"];
			var searchToken2AlbumId = AlbumlistArray[i].d4032.tokens["[id]"];
			var searchToken2Fanart = AlbumlistArray[i].d4032.tokens["[fanart]"];
			var searchToken2Artist = AlbumlistArray[i].d4032.tokens["[artist]"];
			var searchToken2Album = AlbumlistArray[i].d4032.tokens["[albumtitle]"];
			
			if(newCompare(searchAlbum, search_string))			// refer to newCompare() from customised function section
			{
				templistArray.push({				// Add to array to add to list in one go later
					s4031: searchThumbnail,
					s4032: searchAlbum,
					s4033: searchSortLabel,
					d4031: {
						tokens: {
							"[id]": searchTokenAlbumId,
							"[artist]": searchTokenArtist,
							"[fanart]": searchTokenFanart,
							"[albumtitle]": searchTokenAlbum
							}
						},
					d4032: {
						tokens: {
							"[id]": searchToken2AlbumId,
							"[artist]": searchToken2Artist,
							"[fanart]": searchToken2Fanart,
							"[albumtitle]": searchToken2Album
							}
						}
					});
			}
		}
		CF.listAdd("l"+listJoin, templistArray);
	};
	
	// Use the alphabar to filter the list of albums and display the filtered results only.
	self.alphabarAlbums = function(sliderval, listJoin) {
	
				// Calculate the letter based on the slider value (0-27). To allow for better accuracy of the letter, both 0 and 1 slider values will equal "#" in the slider.
				var letter = "#";
				if (sliderval > 1) {
					// Use ascii char code and convert to the letter (letter A = 65, B = 66, and so on). Use parseInt here otherwise the + symbol might concatenate the numbers together, 
					// rather than add them. This is because parameters may be passed as strings from tokens such as [sliderval]
					letter = String.fromCharCode(63 + parseInt(sliderval));
				}
				CF.setJoin("s4324", letter);
				
				var templistArray = [];				//initialize temporary array
				CF.listRemove("l"+listJoin);	//clear list of any previous entries
			
				//loop thru all the element in the TV Show Array and display the match
				for (var i = 0;i<AlbumlistArray.length;i++)
				{
					var searchThumbnail = AlbumlistArray[i].s4031;
					var searchAlbum = AlbumlistArray[i].s4032;
					var searchSortLabel = AlbumlistArray[i].s4033;
					var searchTokenAlbumId = AlbumlistArray[i].d4031.tokens["[id]"];
					var searchTokenFanart = AlbumlistArray[i].d4031.tokens["[fanart]"];
					var searchTokenArtist = AlbumlistArray[i].d4031.tokens["[artist]"];
					var searchTokenAlbum = AlbumlistArray[i].d4031.tokens["[albumtitle]"];
					var searchToken2AlbumId = AlbumlistArray[i].d4032.tokens["[id]"];
					var searchToken2Fanart = AlbumlistArray[i].d4032.tokens["[fanart]"];
					var searchToken2Artist = AlbumlistArray[i].d4032.tokens["[artist]"];
					var searchToken2Album = AlbumlistArray[i].d4032.tokens["[albumtitle]"];
											
					if (letter == "#")												// Non-filtered, display everything
					{
						templistArray.push({				// Add to array to add to list in one go later
							s4031: searchThumbnail,
							s4032: searchAlbum,
							s4033: searchSortLabel,
							d4031: {
								tokens: {
									"[id]": searchTokenAlbumId,
									"[artist]": searchTokenArtist,
									"[fanart]": searchTokenFanart,
									"[albumtitle]": searchTokenAlbum
									}
								},
							d4032: {
								tokens: {
									"[id]": searchToken2AlbumId,
									"[artist]": searchToken2Artist,
									"[fanart]": searchToken2Fanart,
									"[albumtitle]": searchToken2Album
									}
								}
							});
					} 
					else if (letter == searchAlbum.charAt(0))						// compare the first alphabet of feedback string with the letter selected from slider
					{
						templistArray.push({				// Add to array to add to list in one go later
							s4031: searchThumbnail,
							s4032: searchAlbum,
							s4033: searchSortLabel,
							d4031: {
								tokens: {
									"[id]": searchTokenAlbumId,
									"[artist]": searchTokenArtist,
									"[fanart]": searchTokenFanart,
									"[albumtitle]": searchTokenAlbum
									}
								},
							d4032: {
								tokens: {
									"[id]": searchToken2AlbumId,
									"[artist]": searchToken2Artist,
									"[fanart]": searchToken2Fanart,
									"[albumtitle]": searchToken2Album
									}
								}
							});
					}
				}// end for
				CF.listAdd("l"+listJoin, templistArray);
	};
	
	/*
	 * Function: Search the array list of Artists and get the results that matches exactly/contain the characters in the search string
	 */
	 self.searchSong = function(search_string, listJoin){
	 
			var templistArray = [];				//initialize array
			CF.listRemove("l"+listJoin);	//clear list of any previous entries
		
		// method 1:
		//loop thru all the element in the TV Show Array and display the match
		for (var i = 0;i<SonglistArray.length;i++)
		{
			var searchThumbnail = SonglistArray[i].s4031;
			var searchSong = SonglistArray[i].s4032;
			var searchSortLabel = SonglistArray[i].s4033;
			var searchTokenSongId = SonglistArray[i].d4031.tokens["[id]"];
			var searchTokenFile = SonglistArray[i].d4031.tokens["[file]"];
			var searchToken2SongId = SonglistArray[i].d4032.tokens["[id]"];
			var searchToken2File = SonglistArray[i].d4032.tokens["[file]"];
			
			if(newCompare(searchSong, search_string))			// refer to newCompare() from customised function section
			{
				templistArray.push({				// Add to array to add to list in one go later
					s4031: searchThumbnail,
					s4032: searchSong,
					s4033: searchSortLabel,
					d4031: {
						tokens: {
							"[id]": searchTokenSongId,
							"[file]": searchTokenFile
							}
						},
					d4032: {
						tokens: {
							"[id]": searchToken2SongId,
							"[file]": searchToken2File
							}
						}
					});
			}
		}
		CF.listAdd("l"+listJoin, templistArray);
	};
	
	// Use the alphabar to filter the list of albums and display the filtered results only.
	self.alphabarSongs = function(sliderval, listJoin) {
	
				// Calculate the letter based on the slider value (0-27). To allow for better accuracy of the letter, both 0 and 1 slider values will equal "#" in the slider.
				var letter = "#";
				if (sliderval > 1) {
					// Use ascii char code and convert to the letter (letter A = 65, B = 66, and so on). Use parseInt here otherwise the + symbol might concatenate the numbers together, 
					// rather than add them. This is because parameters may be passed as strings from tokens such as [sliderval]
					letter = String.fromCharCode(63 + parseInt(sliderval));
				}
				CF.setJoin("s4325", letter);
				
				var templistArray = [];				//initialize temporary array
				CF.listRemove("l"+listJoin);	//clear list of any previous entries
			
				//loop thru all the element in the TV Show Array and display the match
				for (var i = 0;i<SonglistArray.length;i++)
				{
					var searchThumbnail = SonglistArray[i].s4031;
					var searchSong = SonglistArray[i].s4032;
					var searchSortLabel = SonglistArray[i].s4033;
					var searchTokenSongId = SonglistArray[i].d4031.tokens["[id]"];
					var searchTokenFile = SonglistArray[i].d4031.tokens["[file]"];
					var searchToken2SongId = SonglistArray[i].d4032.tokens["[id]"];
					var searchToken2File = SonglistArray[i].d4032.tokens["[file]"];
											
					if (letter == "#")												// Non-filtered, display everything
					{
						templistArray.push({				// Add to array to add to list in one go later
							s4031: searchThumbnail,
							s4032: searchSong,
							s4033: searchSortLabel,
							d4031: {
								tokens: {
									"[id]": searchTokenSongId,
									"[file]": searchTokenFile
									}
								},
							d4032: {
								tokens: {
									"[id]": searchToken2SongId,
									"[file]": searchToken2File
									}
								}
							});
					} 
					else if (letter == searchSong.charAt(0))						// compare the first alphabet of feedback string with the letter selected from slider
					{
						templistArray.push({				// Add to array to add to list in one go later
							s4031: searchThumbnail,
							s4032: searchSong,
							s4033: searchSortLabel,
							d4031: {
								tokens: {
									"[id]": searchTokenSongId,
									"[file]": searchTokenFile
									}
								},
							d4032: {
								tokens: {
									"[id]": searchToken2SongId,
									"[file]": searchToken2File
									}
								}
							});
					}
				}// end for
				CF.listAdd("l"+listJoin, templistArray);
	};
	
	//--------------------------------------------------------------------------------------------------
	// Now Playing
	// - for scrubbing slider: On Pressed and On Slide(stop timing loop), On Release (Restart timing loop after sepcified timing)
	//		
	//		
	//--------------------------------------------------------------------------------------------------
	
	var playnow_timer;		//setTimeout ID
	
	// This is the function that creates the loop, runs every 3 seconds. Alternatively can use setInterval.
	self.loopPlayNowTimer = function(baseJoin){
		playnow_timer = setTimeout(function(){self.getNowPlaying(baseJoin);}, 3000);
	};
	
	// This is the function that stops the loop from running. Alternatively should use clearInterval.
	self.stopPlayNowTimer = function(){
		clearTimeout(playnow_timer);
	};
	
	/**
	 * Function: Get Active Player and Now Playing item from XBMC
	 */
	self.getNowPlaying = function(baseJoin) {
		
		//Stop all timers from running
		self.stopPlayNowTimer();
		self.stopAudioTimer();
		self.stopVideoTimer();
		
		self.rpc("Player.GetActivePlayers", {}, function(data) {
			//CF.logObject(data);
			
			// Response for playing media: {"id":"1","jsonrpc":"2.0","result":[{"playerid":0,"type":"audio"}]}
			// Response for no media playing: {"id":"1","jsonrpc":"2.0","result":[]}
			
			if(data.result.length == null || data.result.length == 0 )
			{
					CF.setJoin("d"+(baseJoin+1), 1);		// Show Now Playing blank subpage
					CF.setJoin("d"+(baseJoin+2), 0);		// Hide Now Playing Audio subpage
					CF.setJoin("d"+(baseJoin+3), 0);		// Hide Now Playing Video subpage
			}
			else
			{
					self.currentPlayer = data.result[0].type;
					
					if(self.currentPlayer == "audio")
					{
							CF.setJoin("s"+baseJoin, "AUDIO");		// Show player status : AUDIO
							CF.setJoin("d"+(baseJoin+1), 0);		// Show Now Playing blank subpage
							CF.setJoin("d"+(baseJoin+2), 1);		// Show Now Playing Audio subpage
							CF.setJoin("d"+(baseJoin+3), 0);		// Hide Now Playing Video subpage
							
							//Get the latest details
							self.getAudioPlayerStatus();				// Set feedback status on Play/Pause button
							self.getNowPlayingAudioItem(baseJoin);	// Set all the latest info and start timer
					}
					else if(self.currentPlayer == "video")
					{
						CF.setJoin("s"+baseJoin, "VIDEO");			// Show player status : VIDEO
						CF.setJoin("d"+(baseJoin+1), 0);			// hide Now Playing Audio subpage
						CF.setJoin("d"+(baseJoin+2), 0);			// Hide Now Playing Audio subpage
						CF.setJoin("d"+(baseJoin+3), 1);			// Show Now Playing Video subpage
						
						//Get the latest details
						self.getVideoPlayerStatus();				// Set feedback status on Play/Pause button
						self.getNowPlayingVideoItem(baseJoin);		// Set all the latest info and start timer
						
					}
			}
		});
		self.loopPlayNowTimer(baseJoin);		 // Check player status and report feedback according to specified interval.
	};
	
	/**
	 * Function: Get Now Playing Audio item's playing details and information.
	 */
	self.getNowPlayingAudioItem = function(baseJoin) {
		
		//Previously Playlist.GetItems
		self.rpc("Player.GetItem", { "playerid": 0, "properties":[ "title", "album", "track", "thumbnail", "year", "artist"]}, function(data) {
		
			var thumbnail = self.URL + "vfs/" + data.result.item.thumbnail;
			var title = decode_utf8(data.result.item.title);
			var track = data.result.item.track;
			var artist = decode_utf8(data.result.item.artist);
			var album = decode_utf8(data.result.item.album);
			var year = data.result.item.year;
			
			CF.setJoins([
				{join: "s"+(baseJoin+11), value: thumbnail},		// Thumbnail
				{join: "s"+(baseJoin+12), value: title},			// Fan Art
				{join: "s"+(baseJoin+13), value: track},			// Title
				{join: "s"+(baseJoin+14), value: album},			// Plot
				{join: "s"+(baseJoin+15), value: artist},			// Artist
				{join: "s"+(baseJoin+16), value: year}				// Year
				]);
			});
			
			//Initiate the playing timer
			self.startAudioPlayerTime(baseJoin);
	};
	
	var audio_timer;		//setTimeout ID
	
	// This is the function that creates the loop, runs every second. Alternatively should use setInterval.
	self.loopAudioTime = function(baseJoin){
		audio_timer = setTimeout(function(){self.startAudioPlayerTime(baseJoin);}, 1000);
	};
	
	// This is the function that stops the loop from running. Alternatively should use clearInterval.
	self.stopAudioTimer = function(){
		clearTimeout(audio_timer);
	};
	
	/**
	 * Function: Get Now Playing Audio item's playing time and duration from XBMC, time is updated every second.
	 */
	self.startAudioPlayerTime = function(baseJoin) {
		
		/*------------------------------------------------------------------------------------------------------------------------------------
		|		Previously: Player.GetTime, Player.GetPercentage
		|		Currently: Player.GetProperties
		|
		|		Sample New Request:
		|		{"jsonrpc": "2.0", "method": "Player.GetProperties", "params": {"playerid": 1, "properties": ["time", "percentage", "totaltime",
		|			"position"]}, "id": "1"}
		|
		|		Sample Response:
		|		{"id":"1","jsonrpc":"2.0","result":{"percentage":38.946197509765625,"position":2, "time":{"hours":0,"milliseconds":905,
		|			"minutes":16,"seconds":41}, "totaltime":{"hours":0,"milliseconds":0,"minutes":42,"seconds":52}
		|		}}	
		//------------------------------------------------------------------------------------------------------------------------------------*/	
		
		
		// get the time and display in minutes and seconds, adding leading zeroes in front to make the format HH:MM:SS
		self.rpc("Player.GetProperties", { "playerid": 0, "properties": ["time", "percentage", "totaltime", "repeat", "shuffled"]}, function(data) {
		
			// This portion is to check and provide real feedback for player's repeat status
			if(data.result.repeat == "off")
			{
				CF.setJoin("d"+(baseJoin+51), 1);
				CF.setJoin("d"+(baseJoin+52), 0);
				CF.setJoin("d"+(baseJoin+53), 0);
			}else if(data.result.repeat == "one"){
				CF.setJoin("d"+(baseJoin+51), 0);
				CF.setJoin("d"+(baseJoin+52), 1);
				CF.setJoin("d"+(baseJoin+53), 0);
			}else if(data.result.repeat == "all"){
				CF.setJoin("d"+(baseJoin+51), 0);
				CF.setJoin("d"+(baseJoin+52), 0);
				CF.setJoin("d"+(baseJoin+53), 1);
			}
			
			// This portion is to check and provide real feedback for player's shuffled status
			if(data.result.shuffled == false)
			{
				CF.setJoin("d"+(baseJoin+54), 0);
				CF.setJoin("d"+(baseJoin+55), 1);
			}else if(data.result.shuffled == true){
				CF.setJoin("d"+(baseJoin+54), 1);
				CF.setJoin("d"+(baseJoin+55), 0);
			}
			
			//self.ItemTimeHour = ("00"+data.result.time.hours).slice(-2);					*not commonly used for music files
			self.ItemTimeMinutes = ("00"+data.result.time.minutes).slice(-2);
			self.ItemTimeSeconds = ("00"+data.result.time.seconds).slice(-2);
			//self.TotalTimeHour = ("00"+data.result.totaltime.hours).slice(-2);			*not commonly used for music files
			self.TotalTimeMinutes = ("00"+data.result.totaltime.minutes).slice(-2);
			self.TotalTimeSeconds = ("00"+data.result.totaltime.seconds).slice(-2);
			self.timePercentage = Math.round((data.result.percentage/100)*(65535));
			
			self.ItemTime = self.ItemTimeMinutes + ":" + self.ItemTimeSeconds;			// this will be updated every second
			self.TotalTime = self.TotalTimeMinutes + ":" + self.TotalTimeSeconds;		// this will be static
			
			CF.setJoin("s"+(baseJoin+17), self.ItemTime);											
			CF.setJoin("s"+(baseJoin+18), self.TotalTime);										
			CF.setJoin("a"+(baseJoin+20), self.timePercentage);
			
			self.loopAudioTime(baseJoin); // To cause the function to loop every second and update the timer
			
		});
	}; 
	
	/**
	 * Function: Scrubbing (in seconds) the Now Playing Audio item to desired playing time. The timing loop is set to stop when scrub slider is pressed
	 *				or slide. Only when the knob on the slider is released then the slider will send the value and start the timer again.
	 */
	self.seekAudioPlayerTime = function(data) {
		
		self.TotalTime = parseInt(self.TotalTimeMinutes*60)+parseInt(self.TotalTimeSeconds);
		self.newlevel = parseInt((data/100)*self.TotalTime+2);
		self.newlevel2 = Math.round((data/100)*100);
		
		var clockTime = ("00"+Math.floor((self.newlevel) / 60)).slice(-2) + ":" + ("00"+(Math.ceil(self.newlevel)% 60)).slice(-2);
		
		CF.setJoin("s4419", clockTime);						
		
		self.rpc("Player.Seek", {"playerid": 0, "value": self.newlevel2}, self.logReplyData);
	
		setTimeout(function(){self.startAudioPlayerTime();}, 250);
		//setTimeout(function(){self.getNowPlaying(8000);}, 250);
	};
	
	/**
	 * Function: Get Now Playing Video item info from XBMC
	 */
	self.getNowPlayingVideoItem = function(baseJoin) {
		self.rpc("Player.GetItem", {"playerid": 1, "properties":["title","thumbnail","fanart","year","rating","plot"]}, function(data) {
		
			//differentiate the different orientation of movie's(potrait) and episode's (landscape) thumbnails  
			if(data.result.item.type == "episode")
			{
			var picture = self.URL + "vfs/" + data.result.item.thumbnail;		// Use episode thumbnail (landscape)
			var year = "";
			}
			else
			{
			var picture = self.URL + "vfs/" + data.result.item.fanart;		// Use movie fanart (landscape)
			var year = "Year: "+data.result.item.year;
			}
			
			var title = decode_utf8(data.result.item.title);
			var rating = "Rating: "+(Math.round(data.result.item.rating*1000))/1000 + "/" + "10";
			var plot = decode_utf8(data.result.item.plot);
			
			CF.setJoins([
				{join: "s"+(baseJoin+21), value: picture},			// Episode thumbnail or Movie Fanart
				{join: "s"+(baseJoin+22), value: title},			// Title
				{join: "s"+(baseJoin+23), value: rating},			// Rating
				{join: "s"+(baseJoin+24), value: year},			// Year
				{join: "s"+(baseJoin+25), value: plot}				// Plot
				]);
			}
		);
		
		//Initiate the playing timer
		self.startVideoPlayerTime(baseJoin);		
	};
	
	var video_timer;
	
	self.loopVideoTime = function(baseJoin){
		video_timer = setTimeout(function(){self.startVideoPlayerTime(baseJoin);}, 1000);
	};
	
	// This is the function that stops the loop from running. Alternatively should use clearInterval.
	self.stopVideoTimer = function(){
		clearTimeout(video_timer);
	};
	
	/**
	 * Function: Get Now Playing Video item's playing time and duration from XBMC, time is updated every second.
	 */
	self.startVideoPlayerTime = function(baseJoin) {
		self.rpc("Player.GetProperties", {"playerid": 1, "properties": ["time", "percentage", "totaltime", "repeat", "shuffled"]}, function(data) {
		
			// This portion is to check and provide real feedback for player's repeat status
			if(data.result.repeat == "off")
			{
				CF.setJoin("d"+(baseJoin+61), 1);
				CF.setJoin("d"+(baseJoin+62), 0);
				CF.setJoin("d"+(baseJoin+63), 0);
			}else if(data.result.repeat == "one"){
				CF.setJoin("d"+(baseJoin+61), 0);
				CF.setJoin("d"+(baseJoin+62), 1);
				CF.setJoin("d"+(baseJoin+63), 0);
			}else if(data.result.repeat == "all"){
				CF.setJoin("d"+(baseJoin+61), 0);
				CF.setJoin("d"+(baseJoin+62), 0);
				CF.setJoin("d"+(baseJoin+63), 1);
			}
			
			// This portion is to check and provide real feedback for player's shuffled status
			if(data.result.shuffled == false)
			{
				CF.setJoin("d"+(baseJoin+64), 0);
				CF.setJoin("d"+(baseJoin+65), 1);
			}else if(data.result.shuffled == true){
				CF.setJoin("d"+(baseJoin+64), 1);
				CF.setJoin("d"+(baseJoin+65), 0);
			}
			
			// This portion is for the real time feedback of the timer
			self.ItemTimeHour = ("00"+data.result.time.hours).slice(-2);
			self.ItemTimeMinutes = ("00"+data.result.time.minutes).slice(-2);
			self.ItemTimeSeconds = ("00"+data.result.time.seconds).slice(-2);
			self.TotalTimeHour = ("00"+data.result.totaltime.hours).slice(-2);
			self.TotalTimeMinutes = ("00"+data.result.totaltime.minutes).slice(-2);
			self.TotalTimeSeconds = ("00"+data.result.totaltime.seconds).slice(-2);
			
			self.ItemTime = self.ItemTimeHour + ":" +self.ItemTimeMinutes + ":" + self.ItemTimeSeconds;
			self.TotalTime = self.TotalTimeHour + ":" + self.TotalTimeMinutes + ":" + self.TotalTimeSeconds;
			
			CF.setJoin("s"+(baseJoin+26), self.ItemTime);		
			CF.setJoin("s"+(baseJoin+27), self.TotalTime);	
			
			self.video = Math.round((data.result.percentage/100)*(65535));
			CF.setJoin("a"+(baseJoin+30), self.video);
			
			self.loopVideoTime(baseJoin); // To cause the function to loop every second and update the timer
		});
	};
	
	/**
	 * Function: Scrubbing (in seconds) the Now Playing Video item to desired playing time.
	 */
	self.seekVideoPlayerTime = function(data) {
		
		self.TotalTime = parseInt(self.TotalTimeHour*3600) + parseInt(self.TotalTimeMinutes*60) + parseInt(self.TotalTimeSeconds);
		self.newlevel = parseInt((data/100)*self.TotalTime);
		self.newlevel2 = Math.round((data/100)*100);
		
		var hours = Math.floor(self.newlevel/(60*60));
		var remain_minutes = self.newlevel % (60*60);
		var minutes = Math.floor(remain_minutes/60);
		var remain_seconds = remain_minutes % 60;
		var seconds = Math.floor(remain_seconds);
		
		var clockTime = ("00"+hours).slice(-2) + ":" + ("00"+minutes).slice(-2) + ":" + ("00"+seconds).slice(-2);
		
		CF.setJoin("s4428", clockTime);		// display the seek time value
		
		self.rpc("Player.Seek", {"playerid": 1, "value":self.newlevel2}, self.logReplyData);  // Previously Player.SeekTime
		
		setTimeout(function(){self.startVideoPlayerTime();}, 1000);
	};
		
	//------------------------------------------------------------------------------------------------------------------------------
	// Files and Sources : Get a list of sources from XBMC according to media : ["video", "music", "pictures", "files", "programs"]
	//  
	//------------------------------------------------------------------------------------------------------------------------------
	
	/**
	 * Function: Get a list of sources from XBMC according to media : video
	 */
	self.getDirectory = function(listJoin, media) {
		
		self.rpc("Files.GetSources", { "media": media }, function(data) {
			//CF.logObject(data);
			
			// Loop through all returned TV shows
			var listArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
			
			var label = decode_utf8(data.result.sources[i].label);				// previously data.result.shares[i].label;
			var source = decode_utf8(data.result.sources[i].file);
			
			// Add to array to add to list in one go later
				listArray.push({
					s4031: label,
					d4031: {
						tokens: {
							"[file]": source,
							}
					}
				});
			}
			CF.listAdd("l"+listJoin, listArray);
		});
	};
	
	/**
	 * Function: Scroll and enter into the folders and subdirectories according to media
	 */
	self.getSubDirectory = function(file, listJoin){
		self.currentDirectory = file;
		self.rpc("Files.GetDirectory", { "directory": self.currentDirectory }, function(data) {
			//CF.logObject(data);
			// Loop through all returned TV shows
			var listArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				var label = decode_utf8(data.result.files[i].label);
				var source = decode_utf8(data.result.files[i].file);
				// Add to array to add to list in one go later
				listArray.push({
					s4031: label,
					d4031: {
						tokens: {
							"[file]": source,
							}
					}
				});
			}
			CF.listAdd("l"+listJoin, listArray);
		});
	};
	
	self.playFile = function(file) {
		self.rpc("Player.Open", { "item": {"file": file} }, self.logReplyData);
	};
	
	//--------------------------------------------------------------------------------------------------
	// Playlist
	//--------------------------------------------------------------------------------------------------
		
	/**
	 * Function: Get Current Audio Playlist from XBMC.
	 * Note : Using parameter of "file" only enables a single file to be played, the song won't automatically jumps to the next track
	 */
	self.getAudioPlaylist = function(baseJoin) {
		
		self.rpc("Playlist.GetItems", { "playlistid":0, "properties":["thumbnail", "file", "track"]}, function(data) {
					//CF.logObject(data);
				
					// Create array to push all new items in
					var listArray = [];
					CF.listRemove("l"+baseJoin);
						
					// Loop through all returned playlist item
					for (var i = 0; i<data.result.limits.total; i++) {
						
						var playlistid = data.result.items[i].id ;
						var label = decode_utf8(data.result.items[i].label);
						var type = data.result.items[i].type;
						var thumbnail = self.URL + "vfs/"+data.result.items[i].thumbnail;
						var songfile = decode_utf8(data.result.items[i].file);
						var track = data.result.items[i].track;
						var index = i;
						
						// Add to array to add to list in one go later
						listArray.push({
							s4031: thumbnail,
							s4032: label,
							s4033: track,
							d4031: {
								tokens: {
								"[file]": songfile,
								"[index]": index
								}
							},
						});
					}
					CF.listAdd("l"+baseJoin, listArray);
			});	
	};
	
	/**
	 * Function: Get Current Video Playlist from XBMC
	 */
	self.getVideoPlaylist = function(baseJoin) {
		
		self.rpc("Playlist.GetItems", {"playlistid":1, "properties":["thumbnail", "file"]}, function(data) {
					//CF.logObject(data);
				
						// Create array to push all new items in
						var listArray = [];
						CF.listRemove("l"+baseJoin);
						
						// Loop through all returned playlist item
						for (var i = 0; i<data.result.limits.total; i++) {
						var playlistid = data.result.items[i].id ;
						var label = decode_utf8(data.result.items[i].label);
						var type = data.result.items[i].type;
						var thumbnail = self.URL + "vfs/"+data.result.items[i].thumbnail;
						var videofile = decode_utf8(data.result.items[i].file);
						var type = data.result.items[i].type;
						var index = i;

						
						//Because of the different orientation of the thumbnails for episodes and movies, 
						//   have two sets of list item to capture the same information.
						
						if(type === "episode") // thumbnail oreintation is landscape
						{
							// Add to array to add to list in one go later
							listArray.push({
								s4031: thumbnail,		// serial join for episode's thumbnail
								s4032: label,			// serial join for episode's label
								d4031: {
									tokens: {
									"[file]": videofile,
									"[index]": index
									}
								},	
							});
						}else {
							// movie's thumbnail orientation is potrait
							listArray.push({
								s4033: thumbnail,		// serial join for movie's thumbnail
								s4034: label,			// serial join for movie's label
								d4031: {
									tokens: {
									"[file]": videofile,
									"[index]": index
									}
								},	
							});
						}// end else
					}
					// Use the array to push all new list items in one go
					CF.listAdd("l"+baseJoin, listArray);
			});	
	};
	
	// Play the file in the playlist for audio
	self.playAudioPlaylistFile = function(index) {				
		self.listPosition = parseInt(index);
		self.rpc("Player.Open", { "item" : { "playlistid" : 0, "position" : self.listPosition} }, self.logReplyData);
		//self.getAudioPlayerStatus();		// Set feedback status on Play/Pause button
	};
	
	// Play the file in the playlist for audio
	self.playVideoPlaylistFile = function(index) {				
		self.listPosition = parseInt(index);
		self.rpc("Player.Open", { "item" : { "playlistid" : 1, "position" : self.listPosition} }, self.logReplyData);
		//self.getVideoPlayerStatus();		// Set feedback status on Play/Pause button
	};
	
	// Clear audio playlist only
	self.clearAudioPlaylist = function(baseJoin) {
		self.rpc("Playlist.Clear", {"playlistid":0}, self.logReplyData);	
		CF.listRemove("l"+baseJoin);
	};
	
	// Clear video playlist only
	self.clearVideoPlaylist = function(baseJoin) {
		self.rpc("Playlist.Clear", {"playlistid":1}, self.logReplyData);
		CF.listRemove("l"+baseJoin);		
	};
	
	// Clear both audio and video playlist
	self.clearAllPlaylist = function() {
		//self.rpc("Playlist.Clear", {}, self.logReplyData);		*not working to clear any playlist
		CF.listRemove("l"+self.joinCurrentAudioPlaylist);
		CF.listRemove("l"+self.joinCurrentVideoPlaylist);
		
	};
	
	// Delete item from Video Playlist
	self.deleteVideoItem = function(index) {
		self.listPosition = parseInt(index);
		self.rpc("Playlist.Remove", {"playlistid" : 1, "position" : self.listPosition}, self.logReplyData);
	};
	
	// Delete item from Audio Playlist
	self.deleteAudioItem = function(index) {
		self.listPosition = parseInt(index);
		self.rpc("Playlist.Remove", {"playlistid" : 0, "position" : index}, self.logReplyData);
	};
	
	//--------------------------------------------------------------------------------------------------
	// Basic Transport Commands
	//--------------------------------------------------------------------------------------------------
	
	// Playing {"id":"1","jsonrpc":"2.0","result":{"speed":1}}
	// Pause {"id":"1","jsonrpc":"2.0","result":{"speed":0}}
	// Not playing {"error":{"code":-32100,"message":"Failed to execute method."},"id":"1","jsonrpc":"2.0"}
	
	self.getVideoPlayerStatus = function() {				// Play/Pause										
		// Check playback status for Video Player 	
		self.rpc("Player.GetProperties", {"playerid":1, "properties": ["speed"]}, function(data) {
					//CF.logObject(data);
			
			if(data.result.speed == 0){
				CF.setJoin("d6666", 1);		// Show Recent Albums list on the Main Page
			}else{
				CF.setJoin("d6666", 0);		// Show Recent Albums list on the Main Page
			}
		});	
	};
	
	
	self.getAudioPlayerStatus = function() {				// Play/Pause										
		// Check playback status for Audio Player 	
		self.rpc("Player.GetProperties", {"playerid":0, "properties": ["speed"]}, function(data) {
					//CF.logObject(data);
			
			if(data.result.speed == 0){
				CF.setJoin("d4314", 1);		// Show Recent Albums list on the Main Page
			}else{
				CF.setJoin("d4314", 0);		// Show Recent Albums list on the Main Page
			}
		});			
	};
	
	self.playPause = function(media) {				// Play/Pause										
		switch(media)
		{
			case "video":
				// previously self.rpc("Player.PlayPause", {}, self.logReplyData);		
				self.rpc("Player.PlayPause", {"playerid":1}, self.logReplyData);		
				self.getVideoPlayerStatus();		// Set feedback status on Play/Pause button
				break;
			case "audio":
				self.rpc("Player.PlayPause", {"playerid":0}, self.logReplyData);		
				self.getAudioPlayerStatus();		// Set feedback status on Play/Pause button
				break;
		}
		//self.playStatus = data.result.speed;
	};
	
	self.Stop = function(media) {						// Stop									
		switch(media)
		{
			case "video":
				self.rpc("Player.Stop", {"playerid":1}, self.logReplyData);		
				break;
			case "audio":
				self.rpc("Player.Stop", {"playerid":0}, self.logReplyData);		
				break;
		}
	};

	self.smallSkipForward = function(media) {			// Small Skip Forward
		switch(media)
		{
			case "video":
				self.rpc("Player.SmallSkipForward", {"playerid":1}, self.logReplyData);
				break;
			case "audio":
				self.rpc("Player.SmallSkipForward", {"playerid":0}, self.logReplyData);
				break;
		}
	};
	
	self.smallSkipBackward = function(media) {			// Small Skip Backward
		switch(media)
		{
			case "video":
				self.rpc("Player.SmallSkipBackward", {"playerid":1}, self.logReplyData);
				break;
			case "audio":
				self.rpc("Player.SmallSkipBackward", {"playerid":0}, self.logReplyData);
				break;
		}
	};
	
	self.bigSkipForward = function(media) {			// Big Skip Forward
		switch(media)
		{
			case "video":
				self.rpc("Player.BigSkipForward", {"playerid":1}, self.logReplyData);
				break;
			case "audio":
				self.rpc("Player.BigSkipForward", {"playerid":0}, self.logReplyData);
				break;
		}
	};
	
	self.bigSkipBackward = function(media) {		// Big Skip Backward
		switch(media)
		{
			case "video":
				self.rpc("Player.BigSkipBackward", {"playerid":1}, self.logReplyData);
				break;
			case "audio":
				self.rpc("Player.BigSkipBackward", {"playerid":0}, self.logReplyData);
				break;
		}
	};
	
	self.Forward = function(media) {			// Forward
		switch(media)
		{
			case "video":
				self.rpc("Player.Seek", {"playerid":1, "value": "smallforward"}, self.logReplyData);
				break;
			case "audio":
				self.rpc("Player.Seek", {"playerid":0, "value": "smallforward"}, self.logReplyData);
				break;
		}
	};
	
	self.Rewind = function(media) {				// Rewind
		switch(media)
		{
			case "video":
				self.rpc("Player.Seek", {"playerid":1, "value": "smallbackward"}, self.logReplyData);
				break;
			case "audio":
				self.rpc("Player.Seek", {"playerid":0, "value": "smallbackward"}, self.logReplyData);
				break;
		}
	};
	
	self.BigForward = function(media) {			// Big Skip Forward - not used
		switch(media)
		{
			case "video":
				self.rpc("Player.Seek", {"playerid":1, "value": "bigforward"}, self.logReplyData);
				break;
			case "audio":
				self.rpc("Player.Seek", {"playerid":0, "value": "bigforward"}, self.logReplyData);
				break;
		}
	};
	
	self.BigRewind = function(media) {				// Big Skip Rewind - not used
		switch(media)
		{
			case "video":
				self.rpc("Player.Seek", {"playerid":1, "value": "bigbackward"}, self.logReplyData);
				break;
			case "audio":
				self.rpc("Player.Seek", {"playerid":0, "value": "bigbackward"}, self.logReplyData);
				break;
		}
	};
	
	self.skipNext = function(media) {			// Skip Next
		switch(media)
		{
			case "video":
				self.rpc("Player.GoNext", {"playerid":1}, self.logReplyData);		//Have bug - go next will go to audio playlist
				break;
			case "audio":
				self.rpc("Player.GoNext", {"playerid":0}, self.logReplyData);
				break;
		}
		
	};
	
	self.skipPrevious = function(media) {		// Skip Previous
		switch(media)
		{
			case "video":															//Have bug - go next will go to audio playlist
				self.rpc("Player.GoPrevious", {"playerid":1}, self.logReplyData);
				break;
			case "audio":
				self.rpc("Player.GoPrevious", {"playerid":0}, self.logReplyData);
				break;
		}
	};
	
	self.playerRepeat = function(type, state) {		// Repeat Playlist
		switch(type)
		{
			case "audio":															
				switch(state)
				{
					case "off":															
					self.rpc("Player.Repeat", {"playerid": 0, "state": "off"}, self.logReplyData);
					break;
					case "one":
					self.rpc("Player.Repeat", {"playerid": 0, "state": "one"}, self.logReplyData);
					break;
					case "all":
					self.rpc("Player.Repeat", {"playerid": 0, "state": "all"}, self.logReplyData);
					break;	
				}
				break;
			case "video":
				switch(state)
				{
					case "off":															
					self.rpc("Player.Repeat", {"playerid": 1, "state": "off"}, self.logReplyData);
					break;
					case "one":
					self.rpc("Player.Repeat", {"playerid": 1, "state": "one"}, self.logReplyData);
					break;
					case "all":
					self.rpc("Player.Repeat", {"playerid": 1, "state": "all"}, self.logReplyData);
					break;	
				}
				break;	
		}
	};
	
	self.playerShuffle = function(media){		// Shuffle Playlist
		switch(media)
		{
			case "video":															
				self.rpc("Player.Shuffle", {"playerid":1}, self.logReplyData);
				self.getVideoPlaylist(8101);
				break;
			case "audio":
				self.rpc("Player.Shuffle", {"playerid":0}, self.logReplyData);
				self.getAudioPlaylist(8001);
				break;
		}
	};
	
	self.playerUnshuffle = function(media){		// UnShuffle Playlist
		switch(media)
		{
			case "video":															
				self.rpc("Player.UnShuffle", {"playerid":1}, self.logReplyData);
				self.getVideoPlaylist(8101);
				break;
			case "audio":
				self.rpc("Player.UnShuffle", {"playerid":0}, self.logReplyData);
				self.getAudioPlaylist(8001);
				break;
		}
	};
	
	
	self.InputAction = function(action) {
		switch(action)
		{
		case "up":
				self.rpc("Input.Up", {}, self.logReplyData);  		// XBMC Menu : Up 
				break;
		case "down":
				self.rpc("Input.Down", {}, self.logReplyData);  	// XBMC Menu : Down 
				break;
		case "left":
				self.rpc("Input.Left", {}, self.logReplyData);  	// XBMC Menu : Left 
				break;
		case "right":
				self.rpc("Input.Right", {}, self.logReplyData);  	// XBMC Menu : Right 
				break;
		case "select":
				self.rpc("Input.Select", {}, self.logReplyData);  	// XBMC Menu : Up 
				break;
		case "back":
				self.rpc("Input.Back", {}, self.logReplyData); 		// XBMC Menu : Back 
				break;
		case "home":
				self.rpc("Input.Home", {}, self.logReplyData);  	// XBMC Menu : Home 
				break;
		}								
	};
	
	self.SystemAction = function(action, join) {
		// close the subpage
		CF.setJoin(join, 0); 	
		
		// execute the action
		switch(action)
		{
		case "shutdown":
				self.rpc("System.Shutdown", {}, self.logReplyData);  	// XBMC System : Shutdown 
				//CF.setJoin(join, 0);
				break;
		case "suspend":
				self.rpc("System.Suspend", {}, self.logReplyData);  	// XBMC System : Suspend 
				//CF.setJoin(join, 0);
				break;
		case "hibernate":
				self.rpc("System.Hibernate", {}, self.logReplyData);  	// XBMC System : Hibernate 
				//CF.setJoin(join, 0);
				break;
		case "reboot":
				self.rpc("System.Reboot", {}, self.logReplyData);  		// XBMC System : Reboot 
				//CF.setJoin(join, 0);
				break;
		case "exit":
				self.rpc("Application.Quit", {}, self.logReplyData);  	// XBMC System : Quit
				//CF.setJoin(join, 0);	
				break;
		}
	};
	
	self.AudioLibrary = function(action) {
		switch(action)
		{
		case "scan":
				self.rpc("AudioLibrary.Scan", {}, self.logReplyData);  		// Scan
				break;
		case "export":
				self.rpc("AudioLibrary.Export", {}, self.logReplyData); 	// Export
				break;
		case "clean":
				self.rpc("AudioLibrary.Clean", {}, self.logReplyData);  	// Clean
				break;
		}								
	};
	
	self.VideoLibrary = function(action) {
		switch(action)
		{
		case "scan":
				self.rpc("VideoLibrary.Scan", {}, self.logReplyData);  		// Scan
				break;
		case "export":
				self.rpc("VideoLibrary.Export", {}, self.logReplyData);  	// Export
				break;
		case "clean":
				self.rpc("VideoLibrary.Clean", {}, self.logReplyData);  	// Clean
				break;
		}								
	};
	
	//--------------------------------------------------------------------------------------------------
	// Volume Control
	//--------------------------------------------------------------------------------------------------
	
	// Get the current level of the volume
	self.volGet = function(callback) {
		
		// Sample Query: {"jsonrpc": "2.0", "method": "Application.GetProperties", "params": { "properties": ["volume", "muted", "name", "version"] }, "id": "1"}
		// Reply : {"id":"1","jsonrpc":"2.0","result":{"muted":false,"name":"XBMC",
		//           "version":{"major":11,"minor":0,"revision":"20111005-288f496","tag":"alpha"},"volume":100}}
		
		self.rpc("Application.GetProperties", {"properties":["volume", "muted"]}, function(data) {							//Previous XBMC.Get Volume
			self.currentVol = data.result.volume;
			self.currentMute = data.result.muted;
			
			CF.setJoin("a4007", Math.round((self.currentVol/100)*65535));
			
			callback();
		});
	};

	// self.rpc("Application.setVolume", {"value": Math.min(self.currentVol + 2, 100)}, function(data) {			//previous night version
	// "value" replace with volume
	
	// set the volume level
	self.setVolume = function(level) {
		self.rpc("Application.setVolume", {"volume": Math.round((level/100)*100)}, self.logReplyData); 		//Previous XBMC.setVolume
	};

	// Mute toggle the volume
	self.volMute = function(callback) {
		//self.rpc("Application.ToggleMute", {}, function(data) {			//previous Oct 3 night version, previously XBMC.ToggleMute
		self.rpc("Application.SetMute", {"mute": "toggle"}, function(data) {			//Latest night version
			self.currentMute = data.result;
			callback();
		});
	};
	
	// Reduce the volume level
	self.volDown = function(callback) {
		self.rpc("Application.setVolume", {"volume": Math.max(self.currentVol - 5, 0)}, function(data) {
			self.currentVol = data.result;
			callback();
		});
	};

	// Increase the volume level
	self.volUp = function(callback) {
		self.rpc("Application.setVolume", {"volume": Math.min(self.currentVol + 5, 100)}, function(data) {
			self.currentVol = data.result;
			callback();
		});
	};
	
	//--------------------------------------------------------------------------------------------------
	// Instances
	// -> List all available XBMC instances. List will be loaded from preset list, new addition and bonjour lookup
	//--------------------------------------------------------------------------------------------------
	
	// Load preset instances data on setup. These instances are not able to be deleted - useful for important systems.
	self.presetInstance = function() {							
			
			// Add into global array
			CF.listAdd("l4060", [
				{
					s4060: "XBMC Notebook",
					d4060: {
							tokens: {
								"[instSystem]": "XBMC Notebook",
								"[instUsername]": "xbmc",
								"[instPassword]": "xbmc",
								"[instURL]": "192.168.0.101",
								"[instPort]": "8080",
								"[type]": "preset"
						}
					}
				},
				{	// Manual entry for second instance
					s4060: "XBMC MacMini",
					d4060: {
							tokens: {
								"[instSystem]": "XBMC MacMini",
								"[instUsername]": "xbmc",
								"[instPassword]": "xbmc",
								"[instURL]": "192.168.0.105",
								"[instPort]": "8080",
								"[type]": "preset"
						}
					}
				},
				{	// Manual entry for third instance
					s4060: "XBMC HTPC",
					d4060: {
							tokens: {
								"[instSystem]": "XBMC HTPC",
								"[instUsername]": "xbmc",
								"[instPassword]": "xbmc",
								"[instURL]": "192.168.0.103",
								"[instPort]": "8080",
								"[type]": "preset"
						}
					}
				}
			]);
				
	};
	
	// Show all the settings of the selected instance
	self.displayInstanceSettings = function(instSystem, instUsername, instPassword, instURL, instPort, type, listIndex) {
		
		self.glbSystem = instSystem;
		
		// Read the tokens and populate the text field. Hide certain buttons according to the type of instances
		// - Preset and bonjour instances - No delete and editing allowed. Hide "Delete Instance" and "Update Instance" buttons.
		// - User instances - Allow delete and editing. Show all buttons.
		
		if ( type == "preset" || type == "bonjour" ) {
			
			// Hide the "Delete" and "Update" buttons and input fields so that user can't change the settings. Only can select the instance.
			CF.setProperties([
				{join: "d66", opacity: 0.0},
				{join: "d67", opacity: 0.0},
			]);
			
			CF.setJoins([
				{ join:"s4480", value: instSystem },							// System Name
				{ join:"s4481", value: instURL },								// URL
				{ join:"s4482", value: instPort },							// Port
				{ join:"s4483", value: instUsername },						// Username
				{ join:"s4484", value: instPassword },						// Password
				//{ join:"d60", tokens: {"[indexList]": listIndex} }		// Update button
			]);
		
		} else {		//type = user or anything else
		// Show all buttons
			CF.setProperties([
				{join: "d66", opacity: 1.0},
				{join: "d67", opacity: 1.0},
			]);
			
			CF.setJoins([
				{ join:"s4480", value: instSystem },							// System Name
				{ join:"s4481", value: instURL },								// URL
				{ join:"s4482", value: instPort },							// Port
				{ join:"s4483", value: instUsername },						// Username
				{ join:"s4484", value: instPassword },						// Password
				//{ join:"d66", tokens: {"[currentSystem]": instSystem} }			// Update button
			]);
		}
	};
	
	self.updateCurrentInstance = function() {
		CF.getJoins(["s4480", "s4481", "s4482", "s4483", "s4484"], function(joins) {
		
		//CF.logObject("XBMCInstancesArray before", XBMCInstancesArray);	
		
		// Remove selected index
		self.removeSelectedInstance(self.glbSystem);
		
		// Push new data into array as new item
			XBMCInstancesArray.push({	
					s4060: joins.s4480.value,
					d4060: {
							tokens: {
								"[instSystem]": joins.s4480.value,
								"[instURL]": joins.s4481.value,
								"[instPort]": joins.s4482.value,
								"[instUsername]": joins.s4483.value,
								"[instPassword]": joins.s4484.value,
								"[type]": "user"
						}
					}
				});
		
		// Save all data to persistent Global Token
		savePersistentData("[addInstanceArray]", XBMCInstancesArray);
		
		});
	};
	
	self.addNewInstance = function() {									// Gets the values of the IP settings
		// Get the values of all the IP Settings at once.
		//s4480 = System Name, s4481 = Host Name / IP Add, s4482 = port, s4483 = username, s4484 = password
		CF.getJoins(["s4490", "s4491", "s4492", "s4493", "s4494"], function(joins) {
			
			// Add into global array
			XBMCInstancesArray.push({	
					s4060: joins.s4490.value,
					d4060: {
							tokens: {
								"[instSystem]": joins.s4490.value,
								"[instURL]": joins.s4491.value,
								"[instPort]": joins.s4492.value,
								"[instUsername]": joins.s4493.value,
								"[instPassword]": joins.s4494.value,
								"[type]": "user"
						}
					}
				});
			
			
			// Add into list to be displayed			
			CF.listAdd("l4060", [
				{	
					s4060: joins.s4490.value,
					d4060: {
							tokens: {
								"[instSystem]": joins.s4490.value,
								"[instURL]": joins.s4491.value,
								"[instPort]": joins.s4492.value,
								"[instUsername]": joins.s4493.value,
								"[instPassword]": joins.s4494.value,
								"[type]": "user"
						}
					}
				}
			]);	
					
		
		// Save all data to persistent Global Token
		savePersistentData("[addInstanceArray]", XBMCInstancesArray);
		
		});
	};
	
	self.removeSelectedInstance = function(instSystem) {		// using System Name as the unique identifier. Can use others as well i.e. IP Address
		
		// initialize temporary array
		var templistArray = [];															
		
		// go through all the elements in the global array
		for (var i = 0;i<XBMCInstancesArray.length;i++)										
		{
			var inst_s1 = XBMCInstancesArray[i].s4060;
			var inst_sys = XBMCInstancesArray[i].d4060.tokens["[instSystem]"];
			var inst_url = XBMCInstancesArray[i].d4060.tokens["[instURL]"];
			var inst_port = XBMCInstancesArray[i].d4060.tokens["[instPort]"];
			var inst_username = XBMCInstancesArray[i].d4060.tokens["[instUsername]"];
			var inst_password = XBMCInstancesArray[i].d4060.tokens["[instPassword]"];
			var inst_type = XBMCInstancesArray[i].d4060.tokens["[type"];
			
			if(inst_sys != instSystem)										// if the settings if not similar with the one deleted. Make sure this field is unique.
			{
				templistArray.push({	
					s4060: inst_s1,
						d4060: {
								tokens: {
									"[instSystem]": inst_sys,
									"[instURL]": inst_url,
									"[instPort]": inst_port,
									"[instUsername]": inst_username,
									"[instPassword]": inst_password,
									"[type]": inst_type
							}
						}
				});
			}
		}
		
		// Reinitialize global array with new values 
		//XBMCInstancesArray = [];					// delete previous data
		XBMCInstancesArray = templistArray;			// update data with the latest array
		
		// Save all data to persistent Global Token
		savePersistentData("[addInstanceArray]", XBMCInstancesArray);
	};
	
	
	
	//--------------------------------------------------------------------------------------------------
	// Error logging
	//--------------------------------------------------------------------------------------------------
	
	self.logReplyData = function(data) {
		CF.logObject(data);
	};

	// Save the params for this new XBMC object
	self.username = params.username;
	self.password = params.password;
	self.url = params.url;
	self.port = params.port;

	return self;
};

