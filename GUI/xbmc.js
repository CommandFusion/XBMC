/*  module for CommandFusion
===============================================================================

AUTHOR:		Jarrod Bell, CommandFusion
CONTACT:	support@commandfusion.com
URL:		https://github.com/CommandFusion/
VERSION:	v0.0.1
LAST MOD:	08 June 2011

=========================================================================
HELP:

TODO

=========================================================================
*/

// ======================================================================
// Global Object
// ======================================================================

var XBMC = function(params) {
	var self = {
		// Connection definitions
		url:				"",			// URL for XBMC
		username:			null,		// username or null for authentification
		password:			null,		// password or null for authentification
		// General parameters
		reqID:				0,			// next request ID, used internally
		apiVersion:			null,		// XBMC API version, gathered at init
		lastError:			null,		// The last error that occurred when talking to XBMC
		currentShowID:		null,
		currentSeasonID:	null,
		currentEpisodeID:	null,
		currentEpisodeFile: null,
		// GUI definitions
		joinTVShows:		3001,
		joinTVSeasons:		3002,
		joinTVEpisodes:		3003,
		joinTVEpisode:		4001
	};

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
			var host = self.getURL() + "jsonrpc";
			CF.request(host, "POST", null, JSON.stringify(json), function(status, headers, body) {
				try {
					if (status == 200) {
						var data = JSON.parse(body);
						if (data.error !== undefined) {
							CF.log("ERROR REPLY ---------");
							self.lastError = data.error;
							CF.logObject(self.lastError);
						} else {
							callback(JSON.parse(body));
						}
					} else {
                        self.lastError = (typeof(body)=="string" && body.length>0) ? body : "HTTP status: " + status;
						CF.logObject(self.lastError);
						//callback(null);
					}
				} catch(e) {
					CF.log("Exception caught while processing response in xbmc.rpc: " + e);
				}
			});
		} catch (e) {
			CF.log("Exception caught in xbmc.rpc: " + e);
		}
	};

	self.setup = function() {
		// Hide the TV Shows browse bar
		//CF.setProperties({join: "d"+(self.joinTVShows+100), opacity: 0.0});
		// Show the TV Shows subpage automatically
		CF.setJoin("d"+self.joinTVShows, 1);
		self.toggleTVShows(1);
		// Move TV Seasons subpage off screen
		self.toggleTVSeasons(0);
		// Move TV Episodes subpage off screen
		self.toggleTVEpisodes(0);

		// Now request the list of TV Shows
		self.getTVShows();
	};

	self.getURL = function() {
		var host;
		if (self.username != null) {
			if (self.password != null)
				host = "http://" + self.username + ":" + self.password + "@" + self.url + ":8080/";
			else
				host = "http://" + self.username + "@" + self.url + ":8080/";
		} else {
			host = "http://" + self.url + ":8080/";
		}
		return host;	
	};

	/**
	 * Function: Get a list of TV shows from XBMC, in alphabetical order
	 */
	self.getTVShows = function() {
		//self.rpc("VideoLibrary.GetTVShows", { "start": 0, "fields": ["title"] }, function(data) { // OLD XBMC
		self.rpc("VideoLibrary.GetTVShows", {"fields": ["thumbnail"]}, function(data) {
			//CF.logObject(data);
			// Loop through all returned TV shows
			var listArray = [];
			CF.listRemove("l"+self.joinTVShows);
			for (var i = 0; i<data.result.limits.total; i++) {
				var showID = data.result.tvshows[i].tvshowid;
				var thumbnail = self.getURL() + "vfs/"+data.result.tvshows[i].thumbnail;
				var title = data.result.tvshows[i].label;
				// Add to array to add to list in one go later
				listArray.push({
					s1: thumbnail,
					d1: {
						tokens: {
							"[id]": showID,
							"[showname]": title
						}
					}
				});
			}
			CF.listAdd("l"+self.joinTVShows, listArray);
		});
	};

	self.selectTVShow = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			// Hide TV Shows list
			self.toggleTVShows(0);
			// Hide TV Episodes list
			self.toggleTVEpisodes(0);
			// Show TV Seasons list
			CF.setJoin("d"+self.joinTVSeasons, 1);
			// Hide TV Episode Details subpage
			CF.setJoin("d"+self.joinTVEpisode, 0);
			// Ensure the seasons subpage is visible before animating it in (for a smoother look)
			setTimeout(function(){self.toggleTVSeasons(1);}, 50);
			// Set the show name title
			CF.setJoin("s"+self.joinTVSeasons, t["[showname]"]);
			// Get TV Seasons
			self.getTVSeasons(t["[id]"]);
		});
	};

	/**
	 * Function: Get a list of Seasons for a particular show from XBMC
	 * @Param {integer} ID of the show from the XBMC database
	 */
	self.getTVSeasons = function(id) {
		self.currentShowID = parseInt(id);
		self.rpc("VideoLibrary.GetSeasons", { "tvshowid": self.currentShowID, "fields": ["season", "episode", "thumbnail"] }, function(data) {
			CF.logObject(data);
			// Create array to push all new items in
			var listArray = [];
			// Clear the list
			CF.listRemove("l"+self.joinTVSeasons);
			// Sort seasons correctly - sort methods in XBMC JSON implementation dont work for seasons when you have more than 9
			data.result.seasons.sort(function(a,b) { return parseInt(a.season) - parseInt(b.season) } );
			// Loop through all returned TV Seasons
			for (var i = 0; i<data.result.limits.total; i++) {
				var seasonID = data.result.seasons[i].season;
				var season = data.result.seasons[i].label;
				var episodes = data.result.seasons[i].episode;
				var thumbnail = self.getURL() + "vfs/"+data.result.seasons[i].thumbnail;
				// Add to array to add to list in one go later
				listArray.push({
					s1: thumbnail,
					s2: season,
					s3: episodes,
					d1: {
						tokens: {
							"[id]": seasonID,
							"[season]": season
						}
					}
				});
			}
			// Use the array to push all new list items in one go
			CF.listAdd("l"+self.joinTVSeasons, listArray);
		});
	};

	self.selectTVSeason = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			// Hide TV Shows list
			self.toggleTVShows(0);
			// Hide TV Seasons list
			self.toggleTVSeasons(0);
			// Show TV Episodes list
			CF.setJoin("d"+self.joinTVEpisodes, 1);
			// Ensure the episodes subpage is visible before animating it in (for a smoother look)
			setTimeout(function(){self.toggleTVEpisodes(1);}, 50);
			// Set the show name title
			CF.setJoin("s"+self.joinTVEpisodes, t["[season]"]);
			// Get TV Episodes
			self.getTVEpisodes(t["[id]"]);
		});
	};

	/**
	 * Function: Get a list of TV Episodes for a particular show and season from XBMC
	 * @Param {integer} ID of the season from the XBMC database
	 */
	self.getTVEpisodes = function(id) {
		self.currentSeasonID = parseInt(id);
		self.rpc("VideoLibrary.GetEpisodes", { "tvshowid": self.currentShowID, "season": self.currentSeasonID, "fields": ["title", "episode", "playcount", "thumbnail", "firstaired", "runtime"] }, function(data) {
			//CF.logObject(data);
			// Loop through all returned TV Episodes
			var listArray = [];
			CF.listRemove("l"+self.joinTVEpisodes);
			for (var i = 0; i<data.result.limits.total; i++) {
				var episodeID = data.result.episodes[i].episodeid;
				var thumbnail = self.getURL() + "vfs/"+data.result.episodes[i].thumbnail;
				// Add to array to add to list in one go later
				listArray.push({
					s1: thumbnail,
					s2: data.result.episodes[i].episode + ". " + data.result.episodes[i].label,
					s3: data.result.episodes[i].firstaired,	
					d1: {
						tokens: {
							"[id]": episodeID
						}
					},
					d2: (data.result.episodes[i].playcount > 0) ? 1 : 0
				});
			}
			CF.listAdd("l"+self.joinTVEpisodes, listArray);
		});
	};

	self.selectTVEpisode = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			// Hide TV Shows list
			self.toggleTVShows(0);
			// Hide TV Seasons list
			self.toggleTVSeasons(0);
			// Show TV Episodes list
			CF.setJoin("d"+self.joinTVEpisodes, 1);
			// Ensure the episodes subpage is visible before animating it in (for a smoother look)
			setTimeout(function(){self.joinTVEpisodes(1);}, 50);
			// Get TV Episode Details
			self.getTVEpisodeDetails(t["[id]"]);
		});
	};

	/**
	 * Function: Get a list of TV Episodes for a particular show and season from XBMC
	 * @Param {integer} ID of the season from the XBMC database
	 */
	self.getTVEpisodeDetails = function(id) {
		self.currentEpisodeID = parseInt(id);
		self.rpc("VideoLibrary.GetEpisodeDetails", { "episodeid": self.currentEpisodeID, "fields": ["title", "episode", "playcount", "thumbnail", "fanart", "plot", "firstaired", "runtime", "file"] }, function(data) {
			//CF.logObject(data);
			
			var episodeID = data.result.episodedetails.episodeid;
			var thumbnail = self.getURL() + "vfs/"+data.result.episodedetails.thumbnail;
			var fanart = self.getURL() + "vfs/"+data.result.episodedetails.fanart;
			var title = data.result.episodedetails.episode + ". " + data.result.episodedetails.label;
			self.currentEpisodeFile = data.result.episodedetails.file;
			CF.setJoins([
				{join: "s"+self.joinTVEpisode, value: thumbnail},						// Thumbnail
				{join: "s"+(self.joinTVEpisode+1), value: fanart},						// Fan Art
				{join: "s"+(self.joinTVEpisode+2), value: title},						// Title
				{join: "s"+(self.joinTVEpisode+3), value: data.result.episodedetails.plot},	// Plot
				{join: "d"+self.joinTVEpisode, value: 1}
			]);
		});
	};

	self.playEpisode = function(file) {
		if (file === undefined) {
			file = self.currentEpisodeFile;
		}
		self.rpc("XBMC.Play", { "file": file }, self.logReplyData);
	};

	self.playPause = function() {
		self.rpc("VideoPlayer.PlayPause", {}, self.logReplyData);
	};

	self.previous = function() {
		self.rpc("VideoPlayer.SmallSkipBackward", {}, self.logReplyData);
	};

	self.next = function() {
		self.rpc("VideoPlayer.SmallSkipForward", {}, self.logReplyData);
	};

	self.introspect = function() {
		self.rpc("JSONRPC.Introspect", {}, self.logReplyData);
	};

	self.logReplyData = function(data) {
		CF.logObject(data);
	};

	self.toggleTVShows = function(forceMode) {
		if (forceMode !== undefined) {
			// Use the forceMode to set a specific placement of the subpage
			if (forceMode == 1) {
				// Show the subpage
				CF.setProperties({join: "d"+self.joinTVShows, x: 0}, 0, 0.33, CF.AnimationCurveEaseOut);
				// Hide the browse bar
				CF.setProperties({join: "d"+(self.joinTVShows+100), opacity: 0.0}, 0, 0.33);
			} else {
				// Hide the subpage
				CF.setProperties({join: "d"+self.joinTVShows, x: -450}, 0, 0.33, CF.AnimationCurveEaseOut);
				// Show the browse bar
				CF.setProperties({join: "d"+(self.joinTVShows+100), opacity: 1.0}, 0, 0.33);
			}
		} else {
			// Automatically toggle the subpage location
			CF.getProperties("d"+self.joinTVShows, function(j) {
				if (j.x < 0) {
					// Item is off the page, so bring it back on
					CF.setProperties({join: j.join, x: 0}, 0, 0.33, CF.AnimationCurveEaseOut);
					// Hide the browse bar
					CF.setProperties({join: "d"+(self.joinTVShows+100), opacity: 0.0}, 0, 0.33);
				} else {
					// Item is on the page, so push it back off
					CF.setProperties({join: j.join, x: -450}, 0, 0.33, CF.AnimationCurveEaseOut);
					// Show the browse bar
					CF.setProperties({join: "d"+(self.joinTVShows+100), opacity: 1.0}, 0, 0.33);
				}
			});
		}
	};

	self.toggleTVSeasons = function(forceMode) {
		if (forceMode !== undefined) {
			// Use the forceMode to set a specific placement of the subpage
			if (forceMode == 1) {
				// Show the subpage
				CF.setProperties({join: "d"+self.joinTVSeasons, x: 50}, 0, 0.33, CF.AnimationCurveEaseOut);
				// Hide the browse bar
				CF.setProperties({join: "d"+(self.joinTVSeasons+100), opacity: 0.0}, 0, 0.33);
			} else {
				// Hide the subpage
				CF.setProperties({join: "d"+self.joinTVSeasons, x: -273}, 0, 0.33, CF.AnimationCurveEaseOut);
				// Show the browse bar
				CF.setProperties({join: "d"+(self.joinTVSeasons+100), opacity: 1.0}, 0, 0.33);
			}
		} else {
			// Automatically toggle the subpage location
			CF.getProperties("d"+self.joinTVSeasons, function(j) {
				if (j.x < 0) {
					// Item is off the page, so bring it back on
					CF.setProperties({join: j.join, x: 50}, 0, 0.33, CF.AnimationCurveEaseOut);
					// Hide the browse bar
					CF.setProperties({join: "d"+(self.joinTVSeasons+100), opacity: 0.0}, 0, 0.33);
				} else {
					// Item is on the page, so push it back off
					CF.setProperties({join: j.join, x: -273}, 0, 0.33, CF.AnimationCurveEaseOut);
					// Show the browse bar
					CF.setProperties({join: "d"+(self.joinTVSeasons+100), opacity: 1.0}, 0, 0.33);
				}
			});
		}
	};

	self.toggleTVEpisodes = function(forceMode) {
		if (forceMode !== undefined) {
			// Use the forceMode to set a specific placement of the subpage
			if (forceMode == 1) {
				// Show the subpage
				CF.setProperties({join: "d"+self.joinTVEpisodes, x: 100}, 0, 0.33, CF.AnimationCurveEaseOut);
			} else {
				// Hide the subpage
				CF.setProperties({join: "d"+self.joinTVEpisodes, x: -215}, 0, 0.33, CF.AnimationCurveEaseOut);
			}
		} else {
			// Automatically toggle the subpage location
			CF.getProperties("d"+self.joinTVEpisodes, function(j) {
				if (j.x < 0) {
					// Item is off the page, so bring it back on
					CF.setProperties({join: j.join, x: 100}, 0, 0.33, CF.AnimationCurveEaseOut);
				} else {
					// Item is on the page, so push it back off
					CF.setProperties({join: j.join, x: -215}, 0, 0.33, CF.AnimationCurveEaseOut);
				}
			});
		}
	};

	// Save the params for this new XBMC object
	self.username = params.username;
	self.password = params.password;
	self.url = params.url;

	return self;
};

var XBMCMacMini = new XBMC({username: "xbmc", password: "xbmc", url: "192.168.168.207"});

CF.userMain = function() {
	XBMCMacMini.setup();
};