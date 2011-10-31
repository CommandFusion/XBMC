/*  module for CommandFusion
===============================================================================

AUTHOR:		Terence & Jarrod Bell, CommandFusion
CONTACT:	support@commandfusion.com
URL:		https://github.com/CommandFusion/
VERSION:	v0.0.1
LAST MOD:	

=========================================================================
Module Test Setup:
- Windows XP Professional Edition 
- Windows 7 Ultimate
- MacMini 
- XBMC Night Version Pre 11.0 Git: 20111005-288f496(Compiled October 6 2011).
	*Please use the latest nightlies : http://mirrors.xbmc.org/nightlies/win32/XBMCSetup-20111025-cfa1a05-master.exe version was used for the latest testing.
- Installer File: XBMCSetup-20111005-288f496-master.exe (dated 7 October)
- Guidesigner 2.3.5.2
- iViewer TF v4.0.6

HELP:

TODO

Changes to note (from Oct2011 nightly build onwards)
- "fields" changed to "properties"
- Player, Player and PicturePlayer have all been merged to Player
Previously :
{"jsonrpc": "2.0", "method": "VideoPlayer.PlayPause", "params": {}, "id": "1"}
{"jsonrpc": "2.0", "method": "AudioPlayer.PlayPause", "params": {}, "id": "1"}
{"jsonrpc": "2.0", "method": "PicturePlayer.PlayPause", "params": {}, "id": "1"}

Now :
{"jsonrpc": "2.0", "method": "Player.PlayPause", "params": {"playerid":id}, "id": "1"} where id = 0(audio), 1(video), 2(picture)

- AudioPlaylist, VideoPlaylist and Playlist have all been merged to Playlist
Previously:
{"jsonrpc": "2.0", "method": "VideoPlaylist.GetItems", "params": {}, "id": "1"}
{"jsonrpc": "2.0", "method": "AudioPlaylist.GetItems", "params": {}, "id": "1"}
Now:
{"jsonrpc": "2.0", "method": "Playlist.GetItems", "params": {"playlistid": id}, "id": "1"} where id = 0(audio), 1(video)

- Some methods in JSONRPC namespace have been renamed
-> XBMC.Play replaced by Player.Open 
-> Reply of Player.GetActivePlayers has changed.
//Response {"id":"1","jsonrpc":"2.0","result":[{"playerid":0,"type":"audio"}]}, playerid 0(audio), 1 (video)

- Most methods in XBMC namespace have either been removed or moved to a different namespace (Application namely)

(http://forum.xbmc.org/showthread.php?t=68263&page=128)
(http://forum.xbmc.org/showthread.php?t=68263&page=129)
The main reasons for renaming "fields" to "properties" was that
1. in our opinion (topfs2, ronie and me) "properties" is a better describing name than "fields" for the properties of a media item ("fields" sounds so database-ish)
2. with the introduction of GetProperties methods (which take a "properties" parameter to retrieve needed properties) in the System, 
XBMC, Playlist and Player namespace renaming "fields" to "properties" helped to achieve a uniform naming of parameters across methods and namespaces. 

(http://forum.xbmc.org/showthread.php?t=68263&page=121)
Sunday, September 18th 2011:
Commits: c4f161e177f5e079f2ba and 525833acf0b7fa3a9404
OK these two commits (especially the first one) are a huge step in the current jsonrpc API because they completely refactor the handling of players and playlists. First of all there will be no seperate VideoPlayer, AudioPlayer and PicturePlayer anymore but only one Player namespace. The same goes for VideoPlaylist and AudioPlaylist which has been replaced by a refactored Playlist namespace which even offers limited support for picture playlists (aka slideshows). Furthermore a lot of methods have been merged/refactored/moved. From now on the Playlist namespace simply represents a playlist (i.e. a sorted list of playable items) and does not provide any playback controlling functionalities anymore. Those have all been moved into the Player namespace because the players are responsible for playing items and not the playlists. I'm sure there will be quite a few questions about these changes so don't hesitate to post them here or ask me on IRC. Here is a more or less complete list of all important changes:

    Merged AudioPlayer, VideoPlayer and PicturePlayer into Player
    Merged AudioPlaylist and VideoPlaylist to replace Playlist and provide initial support for picture playlists (aka slideshows)
    Players/Playlists are no longer accessed by their media type (video, audio, picture) but by a unique ID. Active players/playlists (their ID and media type) can still be retrieved using Player.GetActivePlayers/Playlist.GetPlaylists
    Replaced Playlist.State with Playlist.GetProperties
    Replaced Player.State, Player.GetTime and Player.GetPercentage with Player.GetProperties
    Removed Playlist.SkipPrevious and Playlist.SkipNext (use Player.GoPrevious and Player.GoNext instead)
    The following methods have been moved from the Playlist to the Player namespace: Play (renamed to Open), Shuffle, UnShuffle, Repeat
    Refactored notifications for the Player namespace
    Unified naming of position/item/index parameters in Player and Playlist namespaces
    Merged XBMC.Play and XBMC.StartSlideshow into Player.Open
    Make Playlist.Add, Playlist.Clear and Player.Open work for picture playlists
    Replace Rewind and Forward with SetSpeed in Player namespace
    Replace "value" parameter in "Player.SeekTime" with time struct parameters
    Merge SeekTime, SeekPercentage and (Small|Big)Skip(Forward|Backward) into Seek in Player namespace
    Add Player.SetAudioStream, Player.SetSubtitle and the properties "currentaudiostream", "audiostreams", "subtitleenabled", "currentsubtitle" and "subtitles" to Player.GetProperties
	

(http://forum.xbmc.org/showthread.php?t=68263&page=130)

OK here is another set of final tweaks to clean up the API:

Saturday, October 8th 2011:
Commits: 845288d417d40dea22f6, c2d1e992fdd64f380d67, 6c9af5c7c0ae8075c0f8, c00ff2defb35333206f2, 253dd7e808d1e7a83682

    renamed "value" parameter of Application.Setvolume to "volume"
    refactored Application.ToggleMute into Application.SetMute which takes the following parameters: true, false, "toggle"
    removed optional parameter "albums" from AudioLibrary.GetRecentlyAddedAlbums (use the "limits" parameter to limit the number of returned items (maximum is 25))
    renamed parameter "albums" from AudioLibrary.GetRecentlyAddedSongs to "albumlimit"
    refactored (Audio|Video)Library.Export parameters using union types to better distinguish between single and multi file export
	=> need to upgrade to the latest nightly build

(http://forum.xbmc.org/showthread.php?t=68263&page=132)
Friday, October 14th 2011:
Commit: 53ee2724ede510a8a3a0

    Refactored Files.Download into Files.PrepareDownload and Files.Download. Using jsonrpc over HTTP Files.PrepareDownload does, what Files.Download did until now. 
	It provides a URL which can be called to download the file (beware the answer format has changed). The idea behind the changes is that some transport layers will 
	support direct download through Files.Download while others (like HTTP) will not and in that case the method name "Download" may be confusing. That's why we split 
	the functionality into Files.PrepareDownload (which will be available over HTTP) and Files.Download (which will not be available over HTTP because it's not supported).

22nd October:
Installed the latest nightly build from http://mirrors.xbmc.org/nightlies/win32/XBMCSetup-20111020-59dec96-master.exe to test the latest changes. 

27th October:
No mention of any more changes to the JSON protocol since Oct 14th. Using the latest nightlies:
http://mirrors.xbmc.org/nightlies/win32/XBMCSetup-20111025-cfa1a05-master.exe dated 26th Oct. 

=========================================================================
*/

// ======================================================================
// Global Object
// ======================================================================

var XBMC_Controller = function(params) {

	var self = {
		// Connection definitions
		url:				"",			// URL for XBMC
		port:				"",			// port for XBMC, default is 8080
		username:			null,		// username or null for authentification
		password:			null,		// password or null for authentification
		URL:				null,		// Final URL used for requests
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
			var host = self.URL + "jsonrpc";
			CF.request(host, "POST", null, JSON.stringify(json), function(status, headers, body) {
				try {
					if (status == 200) {
						var data = JSON.parse(body);
						if (data.error !== undefined) {
							self.lastError = data.error;
							CF.log("ERROR REPLY ---------");
							CF.logObject(self.lastError);
						} else {
							callback(JSON.parse(body));
						}
					} else {
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

	self.setup = function() {
		self.URL = self.getURL();
		
		MovieslistArray = [];
		TVSerieslistArray = [];
		ArtistlistArray = [];
	};

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
	
	/*
	
	var XBMCInstances = [];

	function startXBMCLookup() {
			CF.startLookup("_daap._tcp", "", function(addedServices, removedServices, error) {
				try {
					
					// remove disappearing services
						XBMCInstances.forEach(function(service, index) {
							if (removedServices.some(function(item) { return (item.name == service.name); })) {
								CF.log("Closed XBMC instance [" + index + "]: " + service.name);
							XBMCInstances.splice(index, 1);
							}
						});

					// add new services
						addedServices.forEach(function(service) {
							CF.log("New XBMC instance [" + XBMCInstances.length + "]: " + service.name);
						XBMCInstances.push(service);
						});
				}
				catch (e) {
					CF.log("Exception in XBMC services processing: " + e);
				}
			});
		}

	function stopXBMCLookup() {
		CF.stopLookup("_daap._tcp", "");
		CF.log("Stop looking for XBMC")
	}
	
	self.getXBMCBonjour = function(){
		// Start looking for XBMC, kill the lookup 1mn later
		startXBMCLookup();
		setTimeout(stopXBMCLookup, 60000);
	};
	
	*/

	//--------------------------------------------------------------------------------------------------
	// Extra functions
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
	}
	
	//--------------------------------------------------------------------------------------------------
	// TV Shows
	//--------------------------------------------------------------------------------------------------
	
	var TVSerieslistArray = new Array();		//Global array for TV Series
	
	/*
	 * Function: Get a list of TV shows from XBMC, sorted in alphabetical order by default
	 */
	self.getTVShows = function(listJoin, order, method, search_string) {
		
		//Subpages
		CF.setJoin("d"+(listJoin+1100), 1);				// Show Blank subpage
		CF.setJoin("d"+(listJoin+1000), 0);				// Hide TVShow Details subpage
		CF.setJoin("s20", order);
		CF.setJoin("s21", method);
				
		self.rpc("VideoLibrary.GetTVShows", {"sort": { "order": order, "method": method}, "properties": ["thumbnail", "fanart", "title", "year", "rating", "genre"]}, function(data) {
			
			// Loop through all returned TV shows and store in array
			TVSerieslistArray = [];			//initialize array
			CF.listRemove("l"+listJoin);	//clear list of any previous entries
			
				for (var i = 0; i<data.result.limits.total; i++) {							
				
				var showID = data.result.tvshows[i].tvshowid;
				var thumbnail = self.URL + "vfs/" + data.result.tvshows[i].thumbnail;
				var fanart = self.URL + "vfs/" + data.result.tvshows[i].fanart;
				var title = data.result.tvshows[i].title;
				var genre = data.result.tvshows[i].genre;
				
				TVSerieslistArray.push({				// Add to array to add to list in one go later
					s1: thumbnail,
					s2: title,
					s3: genre,
					d1: {
						tokens: {
							"[id]": showID,
							"[fanart]": fanart
						}
					}
				});
			}
			CF.listAdd("l"+listJoin, TVSerieslistArray);
		
		CF.setJoin("s100", "TV SHOWS" + " (" + data.result.limits.total + ")");
		});
	};
	
	self.labelTVShow = function(){
		CF.setJoin("s100", "TV SHOWS" + " (" + TVSerieslistArray.length + ")");
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
			var searchThumbnail = TVSerieslistArray[i].s1;
			var searchTitle = TVSerieslistArray[i].s2;
			var searchTokenId = TVSerieslistArray[i].d1.tokens["[id]"];
			var searchTokenShowTitle = TVSerieslistArray[i].d1.tokens["[showname]"];
			
			if(newCompare(TVSerieslistArray[i].s2, search_string))			// refer to newCompare() from customised function section
			{
				templistArray.push({				// Add to array to add to list in one go later
					s1: searchThumbnail,
					s2: searchTitle,
					d1: {
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

	/**
	 * Function: Get a list of Seasons for a particular show from XBMC
	 * @Param {integer} ID of the TV show from the XBMC database
	 */
	
	var TVSeasonsArray = new Array();		//for labelling purpose only
	
	self.getTVSeasons = function(id, fanart, listJoin) {
	
		CF.setJoin("d"+(listJoin+1100-1), 1);				// Show Blank subpage
		CF.setJoin("d"+(listJoin+1000-1), 0);				// Hide TVShow Details subpage
		CF.setJoin("s10000", fanart);
	
		self.currentShowID = parseInt(id);					
		
		self.rpc("VideoLibrary.GetSeasons", { "tvshowid": self.currentShowID, "properties": ["season", "episode", "thumbnail", "showtitle"] }, function(data) {
			
			// Create array to push all new items in
			var listArray = [];
			TVSeasonsArray = [];
			
			// Clear the list
			CF.listRemove("l"+listJoin);
			
			// Loop through all returned TV Seasons
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var seasonID = data.result.seasons[i].season;
				var season = data.result.seasons[i].label;
				//var episodes = data.result.seasons[i].episode;
				var showtitle = data.result.seasons[i].showtitle;
				var thumbnail = self.URL + "vfs/" + data.result.seasons[i].thumbnail;
				
				// Add to array to add to list in one go later
				listArray.push({
					s1: thumbnail,
					s2: season,
					s3: showtitle,
					d1: {
						tokens: {
							"[id]": seasonID,
							"[season]": season,
							"[showtitle]": showtitle
						}
					}
				});
				
				TVSeasonsArray.push(showtitle);
			}
			// Use the array to push all new list items in one go
			CF.listAdd("l"+listJoin, listArray);
		
			if(data.result.limits.total == 1){
			CF.setJoin("s100", "["+showtitle+"]" + " (" + data.result.limits.total+ " Season)");
			}else{
			CF.setJoin("s100", "["+showtitle+"]" + " (" + data.result.limits.total+ " Seasons)");
			}
		});
	};
	
	self.labelTVSeason = function(){
		if(TVSeasonsArray.length == 1){
			CF.setJoin("s100", "[" + TVSeasonsArray[0] + "]" + " (" + TVSeasonsArray.length + " Season)");
			}else{
			CF.setJoin("s100", "[" + TVSeasonsArray[0] + "]" + " (" + TVSeasonsArray.length + " Seasons)");
			}
	};

	/**
	 * Function: Get a list of TV Episodes for a particular show and season from XBMC
	 * @Param {integer} ID of the season from the XBMC database
	 */
	self.getTVEpisodes = function(id, season, showtitle, listJoin) {
	
		CF.setJoin("d"+(listJoin+1100-2), 1);				// Show Blank subpage
		CF.setJoin("d"+(listJoin+1000-2), 0);				// Hide TVShow Details subpage
		CF.setJoin("d"+(listJoin+1000-2), 0);				// Hide TVShow Details subpage
		
		
		self.currentSeasonID = parseInt(id);
		self.rpc("VideoLibrary.GetEpisodes", { "tvshowid": self.currentShowID, "season": self.currentSeasonID, "properties": ["title", "episode", "playcount", "thumbnail", "firstaired", "runtime"] }, function(data) {
			//CF.logObject(data);
			
			// Loop through all returned TV Episodes
			var listArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var episodeID = data.result.episodes[i].episodeid;
				var thumbnail = self.URL + "vfs/"+data.result.episodes[i].thumbnail;
				var episodenum = data.result.episodes[i].episode;
				
				// Add to array to add to list in one go later
				listArray.push({
					s1: thumbnail,
					s2: data.result.episodes[i].label,
					s3: season + ", Episode " + episodenum,	
					d1: {
						tokens: {
							"[id]": episodeID
						}
					},
					d2: (data.result.episodes[i].playcount > 0) ? 1 : 0
				});
			}
			CF.listAdd("l"+listJoin, listArray);
		
		CF.setJoin("s100", "[" + showtitle + "] " + season + " (" + data.result.limits.total + " eps)");				// Hide TVShow Details subpage
		});
	};

	/**
	 * Function: Get a list of TV Episodes for a particular show and season from XBMC
	 * @Param {integer} ID of the season from the XBMC database
	 */
	self.getTVEpisodeDetails = function(id, baseJoin) {
		
		CF.setJoin("d"+baseJoin, 1);				// Show TV Details subpage
		CF.setJoin("d"+(baseJoin+100), 0);			// Hide Blank subpage
	
	
		self.currentEpisodeID = parseInt(id);
		self.rpc("VideoLibrary.GetEpisodeDetails", { "episodeid": self.currentEpisodeID, "properties": ["thumbnail","fanart","title","plot","showtitle","season","episode","runtime","firstaired","rating","file"]}, function(data) {
			//CF.logObject(data);
			
			var episodeID = data.result.episodedetails.episodeid;
			var thumbnail = self.URL + "vfs/"+data.result.episodedetails.thumbnail;
			var fanart = self.URL + "vfs/"+data.result.episodedetails.fanart;
			var title = data.result.episodedetails.episode + ". " + data.result.episodedetails.label;
			var plot = data.result.episodedetails.plot;
			var showtitle = "Show Title: " + data.result.episodedetails.showtitle;
			var season = "Season: " + data.result.episodedetails.season;
			var episode = "Episode: " + data.result.episodedetails.episode;
			var runtime = "Runtime: " + data.result.episodedetails.runtime + " min";
			var firstair = "Premiered: " + data.result.episodedetails.firstaired;
			var rating = "Rating: " + (Math.round(data.result.episodedetails.rating*1000))/1000 + "/" + "10";
			self.currentEpisodeFile = data.result.episodedetails.file;
			
			CF.setJoins([
				{join: "s"+baseJoin, value: thumbnail},			// Thumbnail
				{join: "s"+(baseJoin+1), value: fanart},		// Fan Art
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
			
		});
	};
	
	self.playEpisode = function(file) {
		if (file === undefined) {
			var file = self.currentEpisodeFile;
			
		}
		self.rpc("Player.Open", {"item": {"file": file}}, self.logReplyData);
	};
	
	self.addEpisodePlaylist = function(file) {
		if (file === undefined) {
			var file = self.currentEpisodeFile;
			
		}
		self.rpc("Playlist.Add", { "playlistid":1, "item":{"file": file}}, self.logReplyData);	
	};
	
	self.playFile = function(file) {
		self.rpc("Player.Open", {"item": {"file": file}}, self.logReplyData);
	};
	
	/*
	 * Function: Search the array list of TV shows and get the results that matches exactly/contain the characters in the search string
	 */
	 self.getTVShowsGenre = function(baseJoin){

	 self.rpc("VideoLibrary.GetGenres", {"type":"tvshow", "sort": {"order": "ascending", "method": "label"}}, function(data) {
			//CF.logObject(data);
			
			listArray = [];				//initialize array
			CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
		// method 1:
		//loop thru all the element in the TV Show Array and display the match
		for (var i = 0; i<data.result.limits.total; i++) {
				
				var label = data.result.genres[i].label;
				//var genre = data.result.genres[i].title;
				
				CF.log ("label " + label);
				//CF.log ("title " + genre);
				
				// Add to array to add to list in one go later
				listArray.push({
					s2: label,
					d1: {
						tokens: {
							"[genre]": label
						}
					}
				});
			}
		CF.listAdd("l"+baseJoin, listArray);
	
		CF.setJoin("s100", "GENRES " + "(" + data.result.limits.total + ")");				// Show Genre Total Count
		});
	};
	
	self.getTVShowsGenreDetails = function(genre, baseJoin){
	 
			templistArray = [];				//initialize array
			CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
		// method 1:
		//loop thru all the element in the TV Show Array and display the match
		for (var i = 0;i<TVSerieslistArray.length;i++)
		{
			var searchThumbnail = TVSerieslistArray[i].s1;
			var searchTitle = TVSerieslistArray[i].s2;
			var searchGenre = TVSerieslistArray[i].s3;
			var searchTVSeriesID = TVSerieslistArray[i].d1.tokens["[id]"];
			var searchTokenShowTitle = TVSerieslistArray[i].d1.tokens["[showname]"];
			
			//CF.log("TVSerieslistArray[i].s3 "+ TVSerieslistArray[i].s3);
			//CF.log("TVSerieslistArray[i].s3 length "+ TVSerieslistArray[i].s3.length);
			//CF.log("genre " + genre);
			//CF.log("genre length: " + genre.length);
			
			
			if(newCompare(TVSerieslistArray[i].s3, genre))			// refer to newCompare() from customised function section
			{
				templistArray.push({				// Add to array to add to list in one go later
					s1: searchThumbnail,
					s2: searchTitle,
					s3: searchGenre,
					d1: {
						tokens: {
							"[id]": searchTVSeriesID,
							"[showname]": searchTokenShowTitle
						}
					}
				});
			}
		}
		CF.listAdd("l"+baseJoin, templistArray);
	};
	
	//--------------------------------------------------------------------------------------------------
	// Movies
	//--------------------------------------------------------------------------------------------------
	
	var MovieslistArray = new Array();		//Global array for Movies
	
	/**
	 * Function: Get a list of Movies from XBMC
	 * @Param {integer} ID of the Movie from the XBMC database
	 */
	self.getMovies = function(listJoin, order, method) {
		
		CF.setJoin("d"+(listJoin+101), 1);					// Blank subpage
		CF.setJoin("d"+(listJoin+100), 0);					// Movie subpage
		CF.setJoin("s31", order);
		CF.setJoin("s32", method);
		
		self.rpc("VideoLibrary.GetMovies", { "sort": {"order": order, "method": method}, "properties": ["thumbnail", "genre"]}, function(data) {
			//CF.logObject(data);
			
			MovieslistArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var movieID = data.result.movies[i].movieid;
				var thumbnail = self.URL + "vfs/" + data.result.movies[i].thumbnail;
				var label = data.result.movies[i].label;
				var genre = data.result.movies[i].genre;
				
				// Add to array to add to list in one go later
				MovieslistArray.push({
					s1: thumbnail,
					s2: label,
					s3: genre,
					d1: {
						tokens: {
							"[id]": movieID
						}
					}
				});
			}
								
			CF.listAdd("l"+listJoin, MovieslistArray);
			CF.setJoin("s300", "MOVIES " + "(" + data.result.limits.total + ")");				// Show Movie Text and Total Quantity
		});
	};
	
	self.buildMovieWall = function(listJoin){		
			
		var templistArray = [];			//initialize array
		CF.listRemove("l"+(listJoin+1));	//clear list of any previous entries
		
			// Create a 3 x N row of movie wall, scroll vertically
			for (i=0; i<MovieslistArray.length; i=i+3) {
			var sub = {};
				for (j=0; j<3; j++) {
					if ((i+j) < MovieslistArray.length) {
					
					sub["s"+(j+1)]= MovieslistArray[i+j].s1;
					sub["s"+(j+4)]= MovieslistArray[i+j].s2;
					sub["d"+(j+1)] = { 
										tokens : { 
											"[id]": MovieslistArray[i+j].d1.tokens["[id]"]
											} 
										};
					}// end (i+j) loop
				}//end j loop
				templistArray.push(sub);
			}//end i loop
		
		CF.listAdd("l"+(listJoin+1), templistArray );
		CF.setJoin("s300", "MOVIES " + "(" + MovieslistArray.length + ")");				// Show Movie Text and Total Quantity
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
			var title = data.result.moviedetails.label;			
			var plot = data.result.moviedetails.plot;
			var genre = "Genre: " + data.result.moviedetails.genre;
			var year = "Year: " + data.result.moviedetails.year;
			var rating = "Rating: " + (Math.round(data.result.moviedetails.rating*1000))/1000 + "/" + "10";
			var runtime = "Runtime: " + data.result.moviedetails.runtime + " min";
			var director = "Director: "+data.result.moviedetails.director;
			var writer = "Writer: " + data.result.moviedetails.writer;
			
			self.currentMovieFile = data.result.moviedetails.file;
			
			CF.setJoins([
				{join: "s"+baseJoin, value: thumbnail},		// Thumbnail
				{join: "s"+(baseJoin+1), value: fanart},	// Fan Art
				{join: "s"+(baseJoin+2), value: title},		// Title
				{join: "s"+(baseJoin+3), value: plot},		// Plot
				{join: "s"+(baseJoin+4), value: genre},		// Genre
				{join: "s"+(baseJoin+5), value: year},		// Year
				{join: "s"+(baseJoin+6), value: rating},	// Rating
				{join: "s"+(baseJoin+7), value: runtime},	// Runtime
				{join: "s"+(baseJoin+8), value: director},	// Director
				{join: "s"+(baseJoin+9), value: writer},	// Writer
				{join: "d"+baseJoin, value: 1}				// Show Subpage
			]);
		});
	};

	self.playMovie = function(file) {
		if (file === undefined) {
			var file = self.currentMovieFile;
		}
		self.rpc("Player.Open", { "item":{"file": file} }, self.logReplyData);
	};
	
	self.addMoviePlaylist = function(file) {
		if (file === undefined) {
			var file = self.currentMovieFile;
		}
		self.rpc("Playlist.Add", { "playlistid":1, "item":{ "file": file}}, self.logReplyData);	
	};
	
	var MovieSearchlistArray = new Array();
	
	/*
	 * Function: Search the array list of TV shows and get the results that matches exactly/contain the characters in the search string
	 */
	 self.getSearchedMovieArray = function(search_string, listJoin){
	 
			CF.setJoin("d"+(listJoin+1), 0);		//hide the movie wall list
			CF.setJoin("d"+listJoin, 1);	// show the thumbnail and title wall list only.
			
			//push all values into array into a singular format
			self.rpc("VideoLibrary.GetMovies", { "sort": {"order": "ascending", "method": "label"}, "properties": ["plot", "title", "thumbnail", "fanart"]}, function(data) {
			
			MovieSearchlistArray = [];
			CF.listRemove("l"+listJoin);
			
			for (i=0; i<data.result.limits.total; i++) {
				var thumbnail = self.URL + "vfs/" + data.result.movies[i].thumbnail;
				var movieid = data.result.movies[i].movieid;
				var title = data.result.movies[i].title;
				
			if(newCompare(title, search_string))			// refer to newCompare() from customised function section)
			{
				//CF.log(thumbnail);
				//CF.log(movieid);
				//CF.log(title);
				
				MovieSearchlistArray.push({				// Add to array to add to list in one go later
					s1: thumbnail,
					s2: title,
					d1: {
						tokens: {
							"[id]": movieid,
							"[showname]": title
							}
						}
					});
			}
			
		}//end for loop
		
		CF.listAdd("l"+listJoin, MovieSearchlistArray);
		});
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
				
				var label = data.result.genres[i].label;
				//var genre = data.result.genres[i].title;
				
				//CF.log ("label " + label);
				//CF.log ("title " + genre);
				
				// Add to array to add to list in one go later
				listArray.push({
					s2: label,
					d1: {
						tokens: {
							"[genre]": label
						}
					}
				});
			}
		CF.listAdd("l"+baseJoin, listArray);
	
		CF.setJoin("s300", "GENRES " + "(" + data.result.limits.total + ")");				// Show Genre Total Count
		});
	};
	
	self.getMoviesGenreDetails = function(genre, baseJoin){
	 
			templistArray = [];				//initialize array
			CF.listRemove("l"+baseJoin);	//clear list of any previous entries
		
		// method 1:
		//loop thru all the element in the TV Show Array and display the match
		for (var i = 0;i<MovieslistArray.length;i++)
		{
			var searchThumbnail = MovieslistArray[i].s1;
			var searchTitle = MovieslistArray[i].s2;
			var searchGenre = MovieslistArray[i].s3;
			var searchMovieID = MovieslistArray[i].d1.tokens["[id]"];
			
			if(newCompare(MovieslistArray[i].s3, genre))			// refer to newCompare() from customised function section
			{
				templistArray.push({				// Add to array to add to list in one go later
					s1: searchThumbnail,
					s2: searchTitle,
					s3: searchGenre,
					d1: {
						tokens: {
							"[id]": searchMovieID
						}
					}
				});
			}
		}
		CF.listAdd("l"+baseJoin, templistArray);
	};
			

	//--------------------------------------------------------------------------------------------------
	// Music
	//--------------------------------------------------------------------------------------------------
	
	var ArtistlistArray = new Array();
	
	/**
	 * Function: Get a list of Artist from XBMC
	 * @Param {integer} ID of the Artist from the XBMC database
	 */
	self.getMusicArtist = function(listJoin, order, method) {
		
		CF.setJoin("d"+(listJoin+1100), 0);				// Hide Song Details subpage
		CF.setJoin("d"+(listJoin+1200), 1);				// Show Blank subpage
		CF.setJoin("s41", order);						//FB on Options list: Check sort order
		CF.setJoin("s42", method);						//FB on Options list: Check sort method
		
		
		self.rpc("AudioLibrary.GetArtists", { "sort": {"order": order, "method": method}, "properties": ["thumbnail", "fanart"]}, function(data) {
			//CF.logObject(data);
			
			// Loop through all returned Artist names
			ArtistlistArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var artistID = data.result.artists[i].artistid;
				var thumbnail = self.URL + "vfs/"+ data.result.artists[i].thumbnail;
				var fanart = self.URL + "vfs/"+ data.result.artists[i].fanart;
				var artist = data.result.artists[i].label;
				
				// Add to array to add to list in one go later
				ArtistlistArray.push({
					s1: thumbnail,
					s2: artist,
					d1: {
						tokens: {
							"[id]": artistID,
							"[artist]": artist,
							"[fanart]": fanart
						}
					}
				});
			}
			CF.listAdd("l"+listJoin, ArtistlistArray);
			
			CF.setJoin("s200", "ARTIST " + "(" + data.result.limits.total + ")" );
		});
	};
	
	self.labelArtist = function(){
		CF.setJoin("s200", "ARTIST " + "(" + ArtistlistArray.length + ")" );
	};
	
	/**
	 * Function: Get a list of Albums for a particular Artist from XBMC
	 * @Param {integer} ID of the Album from the XBMC database
	 */
	 var MusicAlbumArray = new Array();
	 
	self.getMusicAlbum = function(id, artist, fanart, listJoin) {
	
		CF.setJoin("d"+(listJoin+1100-1), 0);				// Hide Song Details subpage
		CF.setJoin("d"+(listJoin+1200-1), 1);				// Show Blank subpage
		CF.setJoin("s200", artist);
		CF.setJoin("s10000", fanart);
	
		self.currentArtistID = parseInt(id);
		self.rpc("AudioLibrary.GetAlbums", { "artistid": self.currentArtistID, "properties": ["thumbnail", "title"] }, function(data) {
			//CF.logObject(data);
			
			// Create array to push all new items in
			var listArray = [];
			MusicAlbumArray = [];
			
			CF.listRemove("l"+listJoin);
			
			// Loop through all returned Albums
			for (var i = 0; i<data.result.limits.total; i++) {
			
				var albumID = data.result.albums[i].albumid;
				var albumtitle = data.result.albums[i].title;
				var thumbnail = self.URL + "vfs/" + data.result.albums[i].thumbnail;
								
				// Add to array to add to list in one go later
				listArray.push({
					s1: thumbnail,
					s2: albumtitle,
					s3: artist,
					d1: {
						tokens: {
							"[id]": albumID,
							"[albumtitle]": albumtitle,
							"[artist]": artist
						}
					}
				});
				
				MusicAlbumArray.push(artist);
			}
			// Use the array to push all new list items in one go
			CF.listAdd("l"+listJoin, listArray);
			
			//More for language purpose, to differentiate singular and plural items
			if(data.result.limits.total == 1)
			{
			CF.setJoin("s200", artist + " (" + data.result.limits.total + " Album)" );
			}else{
			CF.setJoin("s200", artist + " (" + data.result.limits.total + " Albums)" );
			}
		});
	};
	
	self.labelAlbum = function(){
		if(MusicAlbumArray.length == 1){
			CF.setJoin("s200", "[" + MusicAlbumArray[0] + "]" + " (" + MusicAlbumArray.length + " Album)");
			}else{
			CF.setJoin("s200", "[" + MusicAlbumArray[0] + "]" + " (" + MusicAlbumArray.length + " Albums)");
			}
	};
	
	/**
	 * Function: Get a list of Songs for a particular Album and Artist from XBMC
	 * @Param {integer} ID of the Song from the XBMC database
	 */
	self.getMusicSong = function(id, artist, albumtitle, listJoin) {
	
		CF.setJoin("d"+(listJoin+1100-2), 0);				// Hide Song Details subpage
		CF.setJoin("d"+(listJoin+1200-2), 1);				// Show Blank subpage
		CF.setJoin("s200", "["+artist+"] " + albumtitle);
		
		self.currentAlbumID = parseInt(id);
		self.rpc("AudioLibrary.GetSongs", { "albumid": self.currentAlbumID, "sort": {"order": "ascending", "method": "track"}, "properties": ["thumbnail", "title", "track", "file"]}, function(data) {
			//CF.logObject(data);
			
			// Loop through all returned TV Episodes
			var listArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				
				var songID = data.result.songs[i].songid;
				var title = data.result.songs[i].title;
				var thumbnail = self.URL + "vfs/" + data.result.songs[i].thumbnail;
				var tracknum = "Track #" + data.result.songs[i].track;
				var songfile = data.result.songs[i].file;
												
				// Add to array to add to list in one go later
				listArray.push({
					s1: thumbnail,
					s2: title,
					s3: tracknum,
					d1: {
						tokens: {
							"[id]": songID,
							"[file]": songfile
						}
					},
					//d2: (data.result.songs[i].playcount > 0) ? 1 : 0
				});
			}
			CF.listAdd("l"+listJoin, listArray);
			
		});
	};
	
	/**
	 * Function: Get details for a particular Song, Album and Artist from XBMC
	 */
	 self.getMusicDetails = function(id, file, baseJoin) {
	
		CF.setJoin("d"+baseJoin, 1);				// Show Song Details subpage
		CF.setJoin("d"+(baseJoin+100), 1);			// Show Playlist and Play Music buttons
		CF.setJoin("d"+(baseJoin+200), 0);			// Hide Blank subpage
	
		self.currentSongID = parseInt(id);
		self.currentSongFile = file;
		
		self.rpc("AudioLibrary.GetSongDetails", {"songid": self.currentSongID, "properties": ["thumbnail","fanart","title","comment","album","year","artist","duration"]}, function(data) {
			//CF.logObject(data);
			
			var thumbnail = self.URL + "vfs/"+data.result.songdetails.thumbnail;
			var fanart = self.URL + "vfs/"+data.result.songdetails.fanart;
			var title = data.result.songdetails.title;
			var comment = data.result.songdetails.comment;
			var album = "Album: " + data.result.songdetails.album;
			var year = "Year: " + data.result.songdetails.year;
			var artist = "Artist: " + data.result.songdetails.artist;
			var duration = "Runtime: " + ("00"+Math.floor(data.result.songdetails.duration / 60)).slice(-2) + ":" + ("00"+(Math.ceil(data.result.songdetails.duration)% 60)).slice(-2) + " min";
						
			CF.setJoins([
				{join: "s"+baseJoin, value: thumbnail},		// Thumbnail
				{join: "s"+(baseJoin+1), value: fanart},	// Fan Art
				{join: "s"+(baseJoin+2), value: title},		// Title
				//{join: "s"+(baseJoin+3), value: comment},	// Comment	*Gibberish data extracted, got to find out the correct parameter to extract the info
				{join: "s"+(baseJoin+4), value: album},		// Album
				{join: "s"+(baseJoin+5), value: artist},	// Artist
				{join: "s"+(baseJoin+6), value: year},		// Year
				{join: "s"+(baseJoin+7), value: duration},	// Runtime
			]);
		});
	};
	
	self.playSong = function(file) {				
		if (file === undefined) {
			var file = self.currentSongFile;
		}
		self.rpc("Player.Open", { "item": {"file": file} }, self.logReplyData);
	};
	
	// Add audio files into audio playlist only
	self.addAudioPlaylist = function(file) {
		if (file === undefined) {
			var file = self.currentSongFile;
		}
		self.rpc("Playlist.Add", { "playlistid":0, "item": {"file": file}}, self.logReplyData);	
	};
	
	/*
	 * Function: Search the array list of TV shows and get the results that matches exactly/contain the characters in the search string
	 */
	 self.searchArtist = function(search_string, listJoin){
	 
			var templistArray = [];				//initialize array
			CF.listRemove("l"+listJoin);	//clear list of any previous entries
		
		// method 1:
		//loop thru all the element in the TV Show Array and display the match
		for (var i = 0;i<ArtistlistArray.length;i++)
		{
			var searchThumbnail = ArtistlistArray[i].s1;
			var searchArtist = ArtistlistArray[i].s2;
			var searchTokenArtistId = ArtistlistArray[i].d1.tokens["[id]"];
			var searchTokenArtist = ArtistlistArray[i].d1.tokens["[artist]"];
			
			if(newCompare(searchArtist, search_string))			// refer to newCompare() from customised function section
			{
				templistArray.push({				// Add to array to add to list in one go later
					s1: searchThumbnail,
					s2: searchArtist,
					d1: {
						tokens: {
							"[id]": searchTokenArtistId,
							"[artist]": searchTokenArtist
							}
						}
					});
			}
		}
		CF.listAdd("l"+listJoin, templistArray);
	};
	
	//--------------------------------------------------------------------------------------------------
	// Now Playing
	// *Need to improve coding part for setTimeout looping with function passing parameter
	// - for scrubbing slider: On Pressed and On Slide(stop timing loop), On Release (Restart timing loop after 1s)
	//		*To try? Press(Stop Time), Slide(Seek Time) and Release(restart time)
	//		* To improve : To loop subpage every 10s to check and see whether the media player is playing or has changed media, and update accordingly.
	//--------------------------------------------------------------------------------------------------
	
	/**
	 * Function: Get Active Player and Now Playing item from XBMC
	 */
	self.getNowPlaying = function(baseJoin) {
		
		self.rpc("Player.GetActivePlayers", {}, function(data) {
			//CF.logObject(data);
			
			self.currentPlayer = data.result[0].type;
			//Response {"id":"1","jsonrpc":"2.0","result":[{"playerid":0,"type":"audio"}]}
			
		//	self.currentVideoPlayer = data.result.video;
		//	self.currentPicturePlayer = data.result.picture;		//not commonly used
			
			if(self.currentPlayer == "audio")
			{
					CF.setJoin("s"+baseJoin, "AUDIO");		// Show player status : AUDIO
					CF.setJoin("d"+(baseJoin+2), 1);		// Show Now Playing Audio subpage
					CF.setJoin("d"+(baseJoin+3), 0);		// Hide Now Playing Video subpage
					
					//Get the latest details
					self.getNowPlayingAudioItem(baseJoin);
					//Initiate the playing timer
					self.startAudioPlayerTime();
			}
			else if(self.currentPlayer == "video")
			{
				CF.setJoin("s"+baseJoin, "VIDEO");			// Show player status : VIDEO
				CF.setJoin("d"+(baseJoin+2), 0);			// Hide Now Playing Audio subpage
				CF.setJoin("d"+(baseJoin+3), 1);			// Show Now Playing Video subpage
				
				//Get the latest details
				self.getNowPlayingVideoItem(baseJoin);
				//Initiate the playing timer
				self.startVideoPlayerTime();
			}else if(self.currentPlayer == undefined){
				//Hide both subpages
				CF.setJoin("d"+(baseJoin+2), 0);			// Hide Now Playing Audio subpage
				CF.setJoin("d"+(baseJoin+3), 0);			// Show Now Playing Video subpage
			}
			
		});
	};
	
	/**
	 * Function: Get Now Playing Audio item's playing details and information.
	 */
	self.getNowPlayingAudioItem = function(baseJoin) {
		
		//Previously Playlist.GetItems
		self.rpc("Player.GetItem", { "playerid": 0, "properties":[ "title", "album", "track", "thumbnail", "year"]}, function(data) {
		
			var thumbnail = self.URL + "vfs/" + data.result.item.thumbnail;
			var title = data.result.item.title;
			var track = data.result.item.track;
			//var artist = data.result.item.artist;
			var album = data.result.item.album;
			var year = data.result.item.year;
			
			CF.setJoins([
				{join: "s"+(baseJoin+201), value: thumbnail},		// Thumbnail
				{join: "s"+(baseJoin+202), value: title},			// Fan Art
				{join: "s"+(baseJoin+203), value: track},			// Title
				{join: "s"+(baseJoin+204), value: album},			// Plot
				{join: "s"+(baseJoin+205), value: year}				// Show Subpage
				]);
			});	
	};
	
	var audio_timer;		//setTimeout ID
	
	// This is the function that creates the loop, runs every second. Alternatively should use setInterval.
	self.loopAudioTime = function(){
		audio_timer = setTimeout(function(){self.startAudioPlayerTime();}, 1000);
	};
	
	// This is the function that stops the loop from running. Alternatively should use clearInterval.
	self.stopAudioTimer = function(){
		clearTimeout(audio_timer);
	};
	
	/**
	 * Function: Get Now Playing Audio item's playing time and duration from XBMC, time is updated every second.
	 */
	self.startAudioPlayerTime = function() {
		
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
		self.rpc("Player.GetProperties", { "playerid": 0, "properties": ["time", "percentage", "totaltime"]}, function(data) {
		
			//self.ItemTimeHour = ("00"+data.result.time.hours).slice(-2);					*not commonly used for music files
			self.ItemTimeMinutes = ("00"+data.result.time.minutes).slice(-2);
			self.ItemTimeSeconds = ("00"+data.result.time.seconds).slice(-2);
			//self.TotalTimeHour = ("00"+data.result.totaltime.hours).slice(-2);			*not commonly used for music files
			self.TotalTimeMinutes = ("00"+data.result.totaltime.minutes).slice(-2);
			self.TotalTimeSeconds = ("00"+data.result.totaltime.seconds).slice(-2);
			self.timePercentage = Math.round((data.result.percentage/100)*(65535));
			
			self.ItemTime = self.ItemTimeMinutes + ":" + self.ItemTimeSeconds;			// this will be updated every second
			self.TotalTime = self.TotalTimeMinutes + ":" + self.TotalTimeSeconds;		// this will be static
			
			CF.setJoin("s8206", self.ItemTime);											//TEMPORARY MANUALLY INSERT JOIN NUMBER ONLY!!!!
			CF.setJoin("a8206", self.ItemTime);											//TEMPORARY MANUALLY INSERT JOIN NUMBER ONLY!!!!
			CF.setJoin("s8207", self.TotalTime);										//TEMPORARY MANUALLY INSERT JOIN NUMBER ONLY!!!!
		
			CF.setJoin("a8100", self.timePercentage);									//TEMPORARY MANUALLY INSERT JOIN NUMBER ONLY!!!!
		
			self.loopAudioTime(); // To cause the function to loop every second and update the timer
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
		
		CF.setJoin("s8210", clockTime);						//TEMPORARY MANUALLY INSERT JOIN NUMBER ONLY!!!!
		
		self.rpc("Player.Seek", {"playerid": 0, "value": self.newlevel2}, self.logReplyData);
	
		setTimeout(function(){self.startAudioPlayerTime();}, 250);
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
			
			var title = data.result.item.title;
			var rating = "Rating: "+(Math.round(data.result.item.rating*1000))/1000 + "/" + "10";
			var plot = data.result.item.plot;
			
			CF.setJoins([
				{join: "s"+(baseJoin+301), value: picture},			// Episode thumbnail or Movie Fanart
				{join: "s"+(baseJoin+302), value: title},			// Title
				{join: "s"+(baseJoin+303), value: rating},			// Rating
				{join: "s"+(baseJoin+304), value: year},			// Year
				{join: "s"+(baseJoin+305), value: plot}				// Plot
				]);
			}
		);	
	};
	
	var video_timer;
	
	self.loopVideoTime = function(){
		video_timer = setTimeout(function(){self.startVideoPlayerTime();}, 1000);
	};
	
	// This is the function that stops the loop from running. Alternatively should use clearInterval.
	self.stopVideoTimer = function(){
		clearTimeout(video_timer);
	};
	
	/**
	 * Function: Get Now Playing Video item's playing time and duration from XBMC, time is updated every second.
	 */
	self.startVideoPlayerTime = function() {
		self.rpc("Player.GetProperties", {"playerid": 1, "properties": ["time", "percentage", "totaltime"]}, function(data) {
		
			self.ItemTimeHour = ("00"+data.result.time.hours).slice(-2);
			self.ItemTimeMinutes = ("00"+data.result.time.minutes).slice(-2);
			self.ItemTimeSeconds = ("00"+data.result.time.seconds).slice(-2);
			self.TotalTimeHour = ("00"+data.result.totaltime.hours).slice(-2);
			self.TotalTimeMinutes = ("00"+data.result.totaltime.minutes).slice(-2);
			self.TotalTimeSeconds = ("00"+data.result.totaltime.seconds).slice(-2);
			
			self.ItemTime = self.ItemTimeHour + ":" +self.ItemTimeMinutes + ":" + self.ItemTimeSeconds;
			self.TotalTime = self.TotalTimeHour + ":" + self.TotalTimeMinutes + ":" + self.TotalTimeSeconds;
			
			CF.setJoin("s8306", self.ItemTime);		//TEMPORARY MANUALLY INSERT JOIN NUMBER ONLY!!!!
			CF.setJoin("s8307", self.TotalTime);	//TEMPORARY MANUALLY INSERT JOIN NUMBER ONLY!!!!
			
			self.video = Math.round((data.result.percentage/100)*(65535));
			CF.setJoin("a8300", self.video);
			CF.setJoin("a8400", self.video);
			//CF.setJoin("a8400", self.video);	Feedback to scrubbing slider - will cause not smoothness
			//CF.setJoin("s8300", self.video);  For checking the values of feedback only
			
			self.loopVideoTime(); // To cause the function to loop every second and update the timer
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
		
		CF.setJoin("s8400", self.TotalTimeHour);							//TEMPORARY MANUALLY INSERT JOIN NUMBER ONLY!!!!
		CF.setJoin("s8401", self.TotalTimeMinutes);							//TEMPORARY MANUALLY INSERT JOIN NUMBER ONLY!!!!
		CF.setJoin("s8402", self.TotalTimeSeconds);							//TEMPORARY MANUALLY INSERT JOIN NUMBER ONLY!!!!
		CF.setJoin("s8403", self.TotalTimeSeconds);							//TEMPORARY MANUALLY INSERT JOIN NUMBER ONLY!!!!
		
		
		CF.setJoin("s8320", self.TotalTime);
		CF.setJoin("s8310", clockTime);		// display the seek time value
		
		self.rpc("Player.Seek", {"playerid": 1, "value":self.newlevel2}, self.logReplyData);  // Previously Player.SeekTime
		
		setTimeout(function(){self.startVideoPlayerTime();}, 1000);
	};
		
	//------------------------------------------------------------------------------------------------------------------------------
	// Files and Sources : Get a list of sources from XBMC according to media : ["video", "music", "pictures", "files", "programs"]
	//  *possible bug in current XBMC test version - doesn't give back the file path, previous version have. Cannot bring forward the path to use File.GetDirectory
	//------------------------------------------------------------------------------------------------------------------------------
	
	/**
	 * Function: Get a list of sources from XBMC according to media : video
	 */
	self.getSourceVideo = function(listJoin) {
		self.rpc("Files.GetSources", { "media": "video" }, function(data) {
			//CF.logObject(data);
			
			// Loop through all returned TV shows
			var listArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
			
			var label = data.result.sources[i].label;				// previously data.result.shares[i].label;
			var source = data.result.sources[i].file;
			
			// Add to array to add to list in one go later
				listArray.push({
					s2: label,
					d1: {
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
	 * Function: Get a list of sources from XBMC according to media : music
	 */
	self.getSourceMusic = function(listJoin) {
		self.rpc("Files.GetSources", { "media": "music" }, function(data) {
			//CF.logObject(data);
			// Loop through all returned TV shows
			var listArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				var label = data.result.sources[i].label;
				var source = data.result.sources[i].file;
				// Add to array to add to list in one go later
				listArray.push({
					s2: label,
					d1: {
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
	 * Function: Get a list of sources from XBMC according to media : picture
	 */
	self.getSourcePicture = function(listJoin) {
		self.rpc("Files.GetSources", { "media": "pictures" }, function(data) {
			//CF.logObject(data);
			// Loop through all returned TV shows
			var listArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				var label = data.result.sources[i].label;
				var source = data.result.sources[i].file;
				// Add to array to add to list in one go later
				listArray.push({
					s2: label,
					d1: {
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
	 * Function: Get a list of sources from XBMC according to media : file
	 */
	self.getSourceFile = function(listJoin) {
		self.rpc("Files.GetSources", { "media": "files" }, function(data) {
			//CF.logObject(data);
			// Loop through all returned TV shows
			var listArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				var label = data.result.sources[i].label;
				var source = data.result.sources[i].file;
				// Add to array to add to list in one go later
				listArray.push({
					s2: label,
					d1: {
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
	 * Function: Get a list of sources from XBMC according to media : program
	 */
	self.getSourceProgram = function(listJoin) {
		self.rpc("Files.GetSources", { "media": "programs" }, function(data) {
			//CF.logObject(data);
			// Loop through all returned TV shows
			var listArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				var label = data.result.sources[i].label;
				var source = data.result.sources[i].file;
				// Add to array to add to list in one go later
				listArray.push({
					s2: label,
					d1: {
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
	 * Function: Scroll and enter into the folders and subdirectories according to media : video
	 */
	self.getDirectoryVideo = function(file, listJoin){
		self.currentDirectory = file;
		self.rpc("Files.GetDirectory", { "directory": self.currentDirectory }, function(data) {
			//CF.logObject(data);
			// Loop through all returned TV shows
			var listArray = [];
			CF.listRemove("l"+listJoin);
			
			for (var i = 0; i<data.result.limits.total; i++) {
				var label = data.result.files[i].label;
				var source = data.result.files[i].file;
				// Add to array to add to list in one go later
				listArray.push({
					s2: label,
					d1: {
						tokens: {
							"[file]": source,
							}
					}
				});
			}
			CF.listAdd("l"+listJoin, listArray);
		});
	};
	
	//--------------------------------------------------------------------------------------------------
	// Playlist
	//--------------------------------------------------------------------------------------------------
		
	/**
	 * Function: Get Current Audio Playlist from XBMC
	 */
	self.getAudioPlaylist = function(baseJoin) {
		
		self.rpc("Playlist.GetItems", { "playlistid":0, "properties":["thumbnail", "file"]}, function(data) {
					//CF.logObject(data);
				
					// Create array to push all new items in
					var listArray = [];
					CF.listRemove("l"+baseJoin);
						
					// Loop through all returned playlist item
					for (var i = 0; i<data.result.limits.total; i++) {
						
						var playlistid = data.result.items[i].id ;
						var label = data.result.items[i].label;
						var type = data.result.items[i].type;
						var thumbnail = self.URL + "vfs/"+data.result.items[i].thumbnail;
						var songfile = data.result.items[i].file;
						
						// Add to array to add to list in one go later
						listArray.push({
							s1: thumbnail,
							s2: label,
							d1: {
								tokens: {
								"[file]": songfile
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
						var label = data.result.items[i].label;
						var type = data.result.items[i].type;
						var thumbnail = self.URL + "vfs/"+data.result.items[i].thumbnail;
						var videofile = data.result.items[i].file;
						var type = data.result.items[i].type;
						
						//Because of the different orientation of the thumbnails for episodes and movies, 
						//   have two sets of list item to capture the same information.
						
						if(type === "episode") // thumbnail oreintation is landscape
						{
							// Add to array to add to list in one go later
							listArray.push({
								s1: thumbnail,		// serial join for episode's thumbnail
								s2: label,			// serial join for episode's label
								d1: {
									tokens: {
									"[file]": videofile
									}
								},	
							});
						}else {
							// movie's thumbnail orientaion is potrait
							listArray.push({
								s3: thumbnail,		// serial join for movie's thumbnail
								s4: label,			// serial join for movie's label
								d1: {
									tokens: {
									"[file]": videofile
									}
								},	
							});
						}// end else
					}
					// Use the array to push all new list items in one go
					CF.listAdd("l"+baseJoin, listArray);
			});	
	};
	
	// Play the file in the playlist for both audio and video
	self.playPlaylistFile = function(file) {				
		self.rpc("Player.Open", { "item":{"file": file} }, self.logReplyData);
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
	
	//--------------------------------------------------------------------------------------------------
	// Recently Added Items
	//--------------------------------------------------------------------------------------------------
	
	var RecentEpisodelistArray = new Array();
	var RecentMovieslistArray = new Array();
	var RecentAlbumlistArray = new Array();
	var RecentSonglistArray = new Array();
	
	/**
	 * Function: Get Recently Added Episodes list from XBMC
	 */
	self.getRecentEpisodes = function(baseJoin, baseJoinMainPage) {
	
		self.rpc("VideoLibrary.GetRecentlyAddedEpisodes", {"properties":["thumbnail", "season", "showtitle", "file"]}, function(data) {
					//CF.logObject(data);
				
						// Create array to push all new items in
						RecentEpisodelistArray = [];		//for TV Show Page
												
						// Clear the list
						CF.listRemove("l"+baseJoin);
						CF.listRemove("l"+baseJoinMainPage);
						
						// Loop through all returned playlist item
						for (var i = 0; i<data.result.limits.total; i++) {
						var episodeid = data.result.episodes[i].episodeid ;
						var thumbnail = self.URL + "vfs/"+data.result.episodes[i].thumbnail;
						var label = data.result.episodes[i].label;
						var season = data.result.episodes[i].season;
						var showtitle = data.result.episodes[i].showtitle;
						var file = data.result.episodes[i].file;
						
						
						// Add to array to add to list in one go later
						RecentEpisodelistArray.push({
							s1: thumbnail,
							s2: label,
							s3: "["+showtitle+"] "+"Season "+season,
							d1: {
								tokens: {
								"[id]": episodeid,
								"[file]": file
								}
							},
							
						});
						
					}
					// Use the array to push all new list items in one go
					CF.listAdd("l"+baseJoin, RecentEpisodelistArray);
					CF.listAdd("l"+baseJoinMainPage, RecentEpisodelistArray);
				
					CF.setJoin("s700", "RECENT ADDED EPISODES " + "(" + data.result.limits.total + ")" );
				});	
	};
	
	self.labelRecentEpisodes = function(){
		CF.setJoin("s100", "RECENT ADDED EPISODES " + "(" + RecentEpisodelistArray.length + ")" );
	};
	
	/**
	 * Function: Get Recently Added Movies list from XBMC
	 */
	self.getRecentMovies = function(baseJoin, baseJoinMainPage) {
	
		self.rpc("VideoLibrary.GetRecentlyAddedMovies", {"properties":["thumbnail", "file"]}, function(data) {
					//CF.logObject(data);
				
						// Create array to push all new items in
						RecentMovieslistArray = [];			// for Movie Page
					
						// Clear the list
						CF.listRemove("l"+baseJoin);
						CF.listRemove("l"+baseJoinMainPage);
						
						// Loop through all returned playlist item
						for (var i = 0; i<data.result.limits.total; i++) {
						
						var movieid = data.result.movies[i].movieid ;
						var thumbnail = self.URL + "vfs/"+data.result.movies[i].thumbnail;
						var label = data.result.movies[i].label;
						var filepath = data.result.movies[i].file;
						
						// Add to array to add to list in one go later
						RecentMovieslistArray.push({
							s1: thumbnail,
							s2: label,
							d1: {
								tokens: {
								"[id]": movieid,
								"[file]": filepath
								}
							},
							
						});
					}
					// Use the array to push all new list items in one go
					CF.listAdd("l"+baseJoin, RecentMovieslistArray);
					CF.listAdd("l"+baseJoinMainPage, RecentMovieslistArray);
				
				CF.setJoin("s701", "RECENT ADDED MOVIES " + "(" + data.result.limits.total + ")" );
				});	
	};
	
	self.labelRecentMovies = function(){
		CF.setJoin("s300", "RECENT ADDED MOVIES " + "(" + RecentMovieslistArray.length + ")" );
	};
	
	/**
	 * Function: Get Recently Added Albums list from XBMC
	 */
	self.getRecentAlbums = function(baseJoin, baseJoinMainPage) {
	
		self.rpc("AudioLibrary.GetRecentlyAddedAlbums", {"properties":["thumbnail", "artist"]}, function(data) {
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
						var label = data.result.albums[i].label;
						var artist = data.result.albums[i].artist;
						
						// Add to array to add to list in one go later
						RecentAlbumlistArray.push({
							s1: thumbnail,
							s2: label,
							d1: {
								tokens: {
								"[id]": albumid,
								"[artist]": artist,
								"[albumtitle]": label
								}
							},
							
						});
					}
					// Use the array to push all new list items in one go
					CF.listAdd("l"+baseJoin, RecentAlbumlistArray);
					CF.listAdd("l"+baseJoinMainPage, RecentAlbumlistArray);
										
				CF.setJoin("s702", "RECENT ADDED ALBUMS " + "(" + data.result.limits.total + ")" );
				});	
		};
		
	self.labelRecentAlbums = function(){
		CF.setJoin("s200", "RECENT ADDED ALBUMS " + "(" + RecentAlbumlistArray.length + ")"  );
	};
	
	/**
	 * Function: Get Recently Added Songs list from XBMC
	 */
	self.getRecentSongs = function(baseJoin, baseJoinMainPage) {
	
		self.rpc("AudioLibrary.GetRecentlyAddedSongs", {"properties":["thumbnail", "file"]}, function(data) {
					//CF.logObject(data);
				
						// Create array to push all new items in
						RecentSonglistArray = [];
						
						// Clear the list
						CF.listRemove("l"+baseJoin);
						CF.listRemove("l"+baseJoinMainPage);
						
						// Loop through all returned playlist item
						for (var i = 0; i<data.result.limits.total; i++) {
						var songid = data.result.songs[i].songid ;
						var thumbnail = self.URL + "vfs/"+data.result.songs[i].thumbnail;
						var label = data.result.songs[i].label;
						var songfile = data.result.songs[i].file;
						
						// Add to array to add to list in one go later
						RecentSonglistArray.push({
							s1: thumbnail,
							s2: label,
							d1: {
								tokens: {
								"[id]": songid,
								"[file]": songfile
								}
							},
							
						});
					}
					// Use the array to push all new list items in one go
					CF.listAdd("l"+baseJoin, RecentSonglistArray);
					CF.listAdd("l"+baseJoinMainPage, RecentSonglistArray);
					
					//CF.setJoin("s702", "RECENT ADDED SONGS " + "(" + data.result.limits.total + ")" );
					
				});	
	};
	
	self.labelRecentSongs = function(){
		CF.setJoin("s200", "RECENT ADDED SONGS " + "(" + RecentSonglistArray.length + ")" );
	};
	
	//--------------------------------------------------------------------------------------------------
	// Basic Transport Commands
	//--------------------------------------------------------------------------------------------------
	
	self.playPauseStatus = function(media) {				// Play/Pause										
		switch(media)
		{
			case "video":
				// previously self.rpc("Player.PlayPause", {}, self.logReplyData);		
				self.rpc("Player.GetProperties", {"playerid":1, "properties": ["speed"]}, self.logReplyData);		
				break;
			case "audio":
				self.rpc("Player.GetProperties", {"playerid":0, "properties": ["speed"]}, self.logReplyData);		
				break;
		}
		self.playStatus = data.result.speed;
		callback();
	};
	
	self.playPause = function(media, callback) {				// Play/Pause										
		switch(media)
		{
			case "video":
				// previously self.rpc("Player.PlayPause", {}, self.logReplyData);		
				self.rpc("Player.PlayPause", {"playerid":1}, self.logReplyData);		
				break;
			case "audio":
				self.rpc("Player.PlayPause", {"playerid":0}, self.logReplyData);		
				break;
		}
		self.playStatus = data.result.speed;
		callback();
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
	
	self.InputAction = function(action) {
		switch(action)
		{
		case "up":
				self.rpc("Input.Up", {}, self.logReplyData);  	// XBMC Menu : Up 
				break;
		case "down":
				self.rpc("Input.Down", {}, self.logReplyData);  // XBMC Menu : Down 
				break;
		case "left":
				self.rpc("Input.Left", {}, self.logReplyData);  // XBMC Menu : Left 
				break;
		case "right":
				self.rpc("Input.Right", {}, self.logReplyData);  // XBMC Menu : Right 
				break;
		case "select":
				self.rpc("Input.Select", {}, self.logReplyData);  // XBMC Menu : Up 
				break;
		case "back":
				self.rpc("Input.Back", {}, self.logReplyData);  // XBMC Menu : Back 
				break;
		case "home":
				self.rpc("Input.Home", {}, self.logReplyData);  // XBMC Menu : Home 
				break;
		}								
	};
	
	self.SystemAction = function(action) {
		switch(action)
		{
		case "shutdown":
				self.rpc("System.Shutdown", {}, self.logReplyData);  // XBMC System : Shutdown 
				break;
		case "suspend":
				self.rpc("System.Suspend", {}, self.logReplyData);  // XBMC System : Suspend 
				break;
		case "hibernate":
				self.rpc("System.Hibernate", {}, self.logReplyData);  // XBMC System : Hibernate 
				break;
		case "reboot":
				self.rpc("System.Reboot", {}, self.logReplyData);  // XBMC System : Reboot 
				break;
		case "exit":
				self.rpc("Application.Quit", {}, self.logReplyData);  // XBMC System : Quit 
				break;
		}								
	};
	
	self.AudioLibrary = function(action) {
		switch(action)
		{
		case "scan":
				self.rpc("AudioLibrary.Scan", {}, self.logReplyData);  // XBMC Menu : Down 
				break;
		case "export":
				self.rpc("AudioLibrary.Export", {}, self.logReplyData);  // XBMC Menu : Left 
				break;
		case "clean":
				self.rpc("AudioLibrary.Clean", {}, self.logReplyData);  // XBMC Menu : Right 
				break;
		}								
	};
	
	self.VideoLibrary = function(action) {
		switch(action)
		{
		case "scan":
				self.rpc("VideoLibrary.Scan", {}, self.logReplyData);  // XBMC Menu : Down 
				break;
		case "export":
				self.rpc("VideoLibrary.Export", {}, self.logReplyData);  // XBMC Menu : Left 
				break;
		case "clean":
				self.rpc("VideoLibrary.Clean", {}, self.logReplyData);  // XBMC Menu : Right 
				break;
		}								
	};
	
	// Get the current level of the volume
	self.volGet = function(callback) {
		
		// Sample Query: {"jsonrpc": "2.0", "method": "Application.GetProperties", "params": { "properties": ["volume", "muted", "name", "version"] }, "id": "1"}
		// Reply : {"id":"1","jsonrpc":"2.0","result":{"muted":false,"name":"XBMC",
		//           "version":{"major":11,"minor":0,"revision":"20111005-288f496","tag":"alpha"},"volume":100}}
		
		self.rpc("Application.GetProperties", {"properties":["volume", "muted"]}, function(data) {							//Previous XBMC.Get Volume
			self.currentVol = data.result.volume;
			self.currentMute = data.result.muted;
			
			CF.setJoin("a90", Math.round((self.currentVol/100)*65535));
			
			callback();
		});
	};

	// self.rpc("Application.setVolume", {"value": Math.min(self.currentVol + 2, 100)}, function(data) {			//previous night version
	// "value" replace with volume
	
	// set the volume level
	self.setVolume = function(level) {
		self.rpc("Application.setVolume", {"volume": Math.round((level/100)*100)},{}); 		//Previous XBMC.setVolume
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
	
	
	//self.introspect = function() {
	//	self.rpc("Application.setVolume", {"value": Math.min(self.currentVol + 1, 100)}, self.logReplyData);		//Previous XBMC.setVolume
	//};

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


/*
//--- Some notes and extra stuff ------------------------------//
	
sort method syntax {"jsonrpc":"2.0","method":"AudioLibrary.GetAlbums","id":1,"params":{"sortmethod":"strAlbum","start":0,"end":10}}
	               "sort": { "method": "foo", "order": "ascending" }
	
Start Slideshow {"jsonrpc": "2.0", "method": "XBMC.StartSlideshow","params": { "directory": "/Volumes/Pictures/2008_Afrika/" }, "id": 1}

Show specific picture from directory {"jsonrpc": "2.0", "method": "XBMC.Play", "params": { "file": "/Volumes/Pictures/2008_Afrika/103-0311.JPG" }, "id": 1}
	 				or {"jsonrpc": "2.0", "method": "XBMC.StartSlideshow","params": { "directory": "/Volumes/Pictures/2008_Afrika/103-0311.JPG" }, "id": 1}
	
VideoPlaylist Add {"jsonrpc" : "2.0", "method" : "VideoPlaylist.Add", "params": { "item": {"file": "D:/Media Files/Movie/How to train your dragon (2010) 1080p.avi" }}, "id":1}
	
Get directory {"jsonrpc": "2.0", "method": "Files.GetDirectory", "params": {"directory": ""}, "id": "1"}
	
sort {"jsonrpc": "2.0", "method": "AudioLibrary.GetRecentlyAddedAlbums", "params" :{ "sort": { "order": "ascending", "method": "size" } },"id": 1}
	"enum": [ "none", "label", "date", "size", "file", "drivetype", "track", "duration", "title", "artist", "album", "genre", "year", "videorating", "programcount", "playlist", "episode", "videotitle",
    "sorttitle", "productioncode", "songrating", "mpaarating", "videoruntime", "studio", "fullpath",
                  "lastplayed", "unsorted", "max" ]
				  
Clock formatting var elapsedString = ("00"+Math.floor((elapsed/1000) / 60)).slice(-2) + ":" + ("00"+(Math.ceil(elapsed/1000)% 60)).slice(-2);

volume control/seek - output formatting

*/