/* XBMC View for CommandFusion
===============================================================================

AUTHOR:		Jarrod Bell, CommandFusion
CONTACT:	support@commandfusion.com
URL:		https://github.com/CommandFusion/
VERSION:	v0.0.1

Module Test Setup:
- Windows XP Professional Edition 
- Windows 7 Ultimate
- XBMC Night Version Pre 11.0 Git: 20111005-288f496(Compiled October 6 2011)
- Installer File: XBMCSetup-20111005-288f496-master.exe (dated 7 October)
- Guidesigner 2.3.4.1
- iViewer TF v4.0.6
=========================================================================
HELP:

This script is used to separate the XBMC GUI interaction from the XBMC controller

=========================================================================
*/

// ======================================================================
// Global Object
// ======================================================================

var XBMC_GUI = function(params) {
	var self = {
		// XBMC Instance
		XBMC:						null,
		
		//Menu button joins
		joinbtnTVShows: 			10,
		joinbtnMovies: 				11,
		joinbtnMusic: 				12,
		joinbtnPlayingNow: 			13,
		joinbtnPlaylist: 			14,
		joinLEDstatus:				1111,
		
		//Dropdown Menu Subpage joins
		joinmenuTVShowsMain:		20,
		joinmenuTVShowsOrder:		21,
		joinmenuTVShowsAscend:		22,
		joinmenuTVShowsDescend:		23,
		
		// GUI definitions
		joinTVShows:				3001,
		joinTVSeasons:				3002,
		joinTVEpisodes:				3003,
		joinRecentEpisodes:			3004,
		joinTVShowsGenre:			3005,
		joinTVShowsGenreDetails:	3006,
		joinTVEpisodeDetails:		4001,
		
		joinMute:					2999,
		
		joinMovies:					1001,
		joinMovieWall:				1002,
		joinRecentMovies:			1003,
		joinMoviesGenre:			1004,
		joinMoviesGenreDetails:		1005,
		joinMovieDetails:   		1101,
		
		joinMusicArtist: 			5001,
		joinMusicAlbum: 			5002,
		joinMusicSong: 				5003,
		joinRecentAlbums:			5004,
		joinRecentSongs:			5005,
		joinRecentAlbumSongs:		5006,
		joinAllAlbums:				5007,
		joinAlbumSongs:				5008,
		joinAllSongs:				5009,
		joinMusicDetails:			6001,
		
		joinNowPlaying: 			8000,
		joinCurrentAudioPlaylist: 	8001,
		joinCurrentVideoPlaylist: 	8101,
		
		joinFileList: 				9001,
		
		joinRecentEpisodesMain:		9101,
		joinRecentMoviesMain:		9102,
		joinRecentAlbumsMain:		9103,
		joinRecentSongsMain:		9104
	};

		
	self.setup = function() {
		
		// Clear lists for new XBMC instance to load data
		/*joinTVShows:				3001,
		joinTVSeasons:				3002,
		joinTVEpisodes:				3003,
		joinRecentEpisodes:			3004,
		joinTVShowsGenreDetails:	3006,
		joinMovies:					1001,
		joinMovieWall:				1002,
		joinRecentMovies:			1003,
		joinMoviesGenre:			1004,
		joinMoviesGenreDetails:		1005,
		joinMusicArtist: 			5001,
		joinMusicAlbum: 			5002,
		joinMusicSong: 				5003,
		joinRecentAlbums:			5004,
		joinRecentSongs:			5005,
		joinRecentAlbumSongs:		5006,
		joinAllAlbums:				5007,
		joinAlbumSongs:				5008,
		joinAllSongs:				5009,
		joinNowPlaying: 			8000,
		joinCurrentAudioPlaylist: 	8001,
		joinCurrentVideoPlaylist: 	8101,
		joinFileList: 				9001,
		joinRecentEpisodesMain:		9101,
		joinRecentMoviesMain:		9102,
		joinRecentAlbumsMain:		9103,
		joinRecentSongsMain:		9104
		*/
		
		CF.setJoins([
			{join: "l"+self.joinTVShows, value: "0x"},
			{join: "l"+self.joinTVSeasons, value: "0x"},
			{join: "l"+self.joinTVEpisodes, value: "0x"},
			{join: "l"+self.joinRecentEpisodes, value: "0x"},
			{join: "l"+self.joinTVShowsGenreDetails, value: "0x"},
			{join: "l"+self.joinMovies, value: "0x"},
			{join: "l"+self.joinMovieWall, value: "0x"},
			{join: "l"+self.joinRecentMovies, value: "0x"},
			{join: "l"+self.joinMoviesGenre, value: "0x"},
			{join: "l"+self.joinMusicArtist, value: "0x"},
			{join: "l"+self.joinMusicAlbum, value: "0x"},
			{join: "l"+self.joinMusicSong, value: "0x"},
			{join: "l"+self.joinRecentAlbums, value: "0x"},
			{join: "l"+self.joinRecentAlbumSongs, value: "0x"},
			{join: "l"+self.joinRecentSongs, value: "0x"},
			{join: "l"+self.joinAllAlbums, value: "0x"},
			{join: "l"+self.joinAlbumSongs, value: "0x"},
			{join: "l"+self.joinAllSongs, value: "0x"},
			{join: "l9101", value: "0x"},
			{join: "l9102", value: "0x"},
			{join: "l9103", value: "0x"}
		]); 
		
		// Shows subpages automatically
		CF.setJoin("d"+self.joinTVShows, 1);				// Show TV Show subpage
		CF.setJoin("d"+self.joinTVSeasons, 0);				// Hide TV Seasons list
		CF.setJoin("d"+self.joinTVEpisodes, 0);				// Hide TV Episodes list
			
		CF.setJoin("d"+self.joinMovies, 1);					// Show Movie subpage
		CF.setJoin("d"+self.joinMusicArtist, 1);			// Show Music Artist subpage
		//CF.setJoin("d"+self.joinRecentAdded, 1);			// Show Recently Added Subpage
		
		CF.setJoin("d"+self.joinbtnTVShows, 1);				// Show active icon for default page (TV Show)
		
		// Shows list 
		CF.setJoin("d"+self.joinCurrentAudioPlaylist, 1);	// Show Playlist subpage - Audio Playlist list
		CF.setJoin("d"+self.joinCurrentVideoPlaylist, 1);	// Show Playlist subpage - Video Playlist list
		CF.setJoin("d"+self.joinFileList, 1);				// Show file subpage - File list
		
		// Call the setup function on the XBMC instance
		self.XBMC.setup();
		
		// Get volume state on startup
		self.volGet();
		
		// Check XBMC connectivity by triggering the loop.
		self.NowPlaying();
		
		// Get media player playback status for both player on startup (pause/playing/stop)
		self.XBMC.getVideoPlayerStatus();
		self.XBMC.getAudioPlayerStatus();
		
		//--------------------------------------------------------------------------------------------------
		// Request all the initial lists 
		//--------------------------------------------------------------------------------------------------
		
		// TV Show function (subpage join, sort order, method). Default sorting is ascending and by label
		self.XBMC.getTVShows(self.joinTVShows, "ascending", "label");			
		
		// Movies function (subpage join, sort order, method). Default sorting is ascending and by label. Default view is Movie List format.
		self.XBMC.getMovies(self.joinMovies, "ascending", "label");				
		
		// Music general function (subpage join, sort order, method). Default sorting is ascending and by label
		self.XBMC.getMusicArtist(self.joinMusicArtist, "ascending", "label");					// Get all artists
		self.XBMC.getAllAlbums(self.joinAllAlbums, "ascending", "label");						// Get all albums
		self.XBMC.getAllSongs(self.joinAllSongs, "ascending", "label");							// Get all songs
		
		// Get All recent items
		CF.setJoin("d"+self.joinRecentAlbumsMain, 1);											// Show Recent Albums list on the Main Page
		CF.setJoin("d"+self.joinRecentSongsMain, 0);											// Hide Recent Songs list on the Main Page
		self.XBMC.getRecentAlbums(self.joinRecentAlbums, self.joinRecentAlbumsMain);			// Recently Added Albums
		self.XBMC.getRecentEpisodes(self.joinRecentEpisodes, self.joinRecentEpisodesMain);		// Recently Added Episodes
		self.XBMC.getRecentMovies(self.joinRecentMovies, self.joinRecentMoviesMain);			// Recently Added Movies
		self.XBMC.getRecentSongs(self.joinRecentSongs);											// Recently Added Songs
		
	};
	
	//================================================================================================================================
	/* TV SHOWS																														*/
	//================================================================================================================================
	
	// ************************	TV Series -> Seasons -> Episodes -> Episode Details -> Play/Playlist episode *************************
	
	// Displays a list of Season when TV Show item is selected
	self.selectTVShow = function(list, listIndex, join) {							
			CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinTVShows, 0);									// Hide TV Show subpage
			CF.setJoin("d"+self.joinTVSeasons, 1);									// Show TV Seasons subpage
			CF.setJoin("d"+self.joinTVEpisodes, 0);									// Hide TV Episodes suppage
			CF.setJoin("d"+self.joinRecentEpisodes, 0);								// Hide Recently Added Episodes subpage
			CF.setJoin("d"+self.joinTVShowsGenreDetails, 0);						// Hide Genre Details subpage
			CF.setJoin("d"+self.joinTVEpisodeDetails, 0);							// Hide Episode Details subpage
			
			self.XBMC.getTVSeasons(t["[id]"],t["[fanart]"], self.joinTVSeasons); 	// Get TV Seasons list
		});
	};

	// Displays a list of Episodes when Season item is selected
	self.selectTVSeason = function(list, listIndex, join) {							
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinTVShows, 0);									// Hide TV Show subpage
			CF.setJoin("d"+self.joinTVSeasons, 0);									// Hide TV Seasons subpage
			CF.setJoin("d"+self.joinTVEpisodes, 1);									// Show TV Episodes subpage
			CF.setJoin("d"+self.joinRecentEpisodes, 0);								// Hide Recently Added Episodes subpage
			CF.setJoin("d"+self.joinTVShowsGenreDetails, 0);						// Hide Genre Details subpage
			CF.setJoin("d"+self.joinTVEpisodeDetails, 0);							// Hide Episode Details subpage
			
			self.XBMC.getTVEpisodes(t["[id]"], t["[season]"], t["[showtitle]"], t["[fanart]"], self.joinTVEpisodes); 	// Get TV Episodes list
		});
	};

	// Displays the details of the selected Episodes when Episode item is selected
	self.selectTVEpisode = function(list, listIndex, join) {						
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinTVEpisodeDetails, 1);							// Show Episode Details subpage
			self.XBMC.getTVEpisodeDetails(t["[id]"], self.joinTVEpisodeDetails);	// Get TV Episodes Details and show TV Episode Details subpage
		});
	};
	
	// Play the Selected Episode. Clear the previous items on playlist and add current item to playlist.
	self.playSelectedEpisode = function(){
			self.XBMC.clearVideoPlaylist(self.joinCurrentVideoPlaylist);			// Clear the playlist of previous items
			setTimeout(function(){self.XBMC.playEpisode();}, 1000);					// Play the file
	};
	
	// Play the selected Recent Episode on the Main Menu page. Clear the previous items on playlist and add current item to playlist.
	self.playRecentEpisode = function(list, listIndex, join){
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.XBMC.clearVideoPlaylist(self.joinCurrentVideoPlaylist);				// Clear the playlist of previous items
			setTimeout(function(){self.XBMC.playRecentEpisode(t["[file]"]);}, 1000);	// Play the file
		});
	};
	
	// ************************	Flipping between subpages ****************************************************************************
	
	// "Series" button in the Season list. Also for the dropdown Menu button "TV Shows" in the TV Series subpage.
	self.showSeries = function() {
		CF.setJoin("d"+self.joinTVShows, 1);						// Show TV Show subpage
		CF.setJoin("d"+self.joinTVSeasons, 0);						// Hide TV Seasons list
		CF.setJoin("d"+self.joinTVEpisodes, 0);						// Hide TV Episodes list
		CF.setJoin("d"+self.joinRecentEpisodes, 0);					// Hide Recently Added Episodes list
		CF.setJoin("d"+self.joinTVShowsGenreDetails, 0);			// Hide Genre detail's subpage
		CF.setJoin("d"+self.joinTVEpisodeDetails, 0);				// Hide Episode Details subpage
	};
	
	// "Season" button in the Episode list. Also for dropdown Menu button "Season from Selected TV Show"
	self.showSeason = function() {
		CF.setJoin("d"+self.joinTVShows, 0);						// Hide TV Show subpage
		CF.setJoin("d"+self.joinTVSeasons, 1);						// Show TV Seasons list
		CF.setJoin("d"+self.joinTVEpisodes, 0);						// Hide TV Episodes list
		CF.setJoin("d"+self.joinRecentEpisodes, 0);					// Hide Recently Added Episodes list
		CF.setJoin("d"+self.joinTVShowsGenreDetails, 0);			// Hide Genre detail's subpage
		CF.setJoin("d"+self.joinTVEpisodeDetails, 0);				// Hide Episode Details subpage
	};
	
	// Dropdown Menu button "Episodes from Selected Season"
	self.showEpisodes = function() {
		CF.setJoin("d"+self.joinTVShows, 0);						// Hide TV Show subpage
		CF.setJoin("d"+self.joinTVSeasons, 0);						// Hide TV Seasons list
		CF.setJoin("d"+self.joinTVEpisodes, 1);						// Show TV Episodes list
		CF.setJoin("d"+self.joinRecentEpisodes, 0);					// Hide Recently Added Episodes list
		CF.setJoin("d"+self.joinTVShowsGenreDetails, 0);			// Hide Genre detail's subpage
		CF.setJoin("d"+self.joinTVEpisodeDetails, 1);				// Hide Episode Details subpage
	};
	
	// Shows the subpage ofthe Recently Added Episodes. The list is already loaded at startup. 
	self.showRecentAddedEpisodes = function(){
		CF.setJoin("d"+self.joinTVShows, 0);						// TV Show subpage
		CF.setJoin("d"+self.joinTVSeasons, 0);						// Hide TV Seasons list
		CF.setJoin("d"+self.joinTVEpisodes, 0);						// Hide TV Episodes list
		CF.setJoin("d"+self.joinRecentEpisodes, 1);					// Show Recently Added Episodes list
		CF.setJoin("d"+self.joinTVShowsGenreDetails, 0);			// Hide Genre detail's subpage
		CF.setJoin("d"+self.joinTVEpisodeDetails, 0);				// Hide Episode Details subpage
	};
	
	// Shows a list of all the Genre categories (for TV Shows only) in the drop down menu
	self.showTVShowsGenre = function(){
		CF.setJoin("d"+self.joinTVShowsGenre, 1);					// Show Genre list's subpage and is part of the dropdown menu.
		self.XBMC.getTVShowsGenre(self.joinTVShowsGenre);	
	};
	
	// ************************	Sorting & Searching **********************************************************************************
	
	// Sorting options is available for TV Series only 
	self.sortTVShow = function(order, method) {
		CF.setJoin("d"+self.joinTVShows, 1);						// Show TV Show subpage
		CF.setJoin("d"+self.joinTVSeasons, 0);						// Hide TV Seasons list
		CF.setJoin("d"+self.joinTVEpisodes, 0);						// Hide TV Episodes list
		CF.setJoin("d"+self.joinRecentEpisodes, 0);					// Hide Recently Added Episodes list
		CF.setJoin("d"+self.joinTVShowsGenreDetails, 0);			// Hide Genre detail's subpage
		CF.setJoin("d"+self.joinTVEpisodeDetails, 0);				// Hide Episode Details subpage
		
		self.XBMC.getTVShows(self.joinTVShows, order, method);
	};
	
	// Search options is available for TV Series only 
	self.TVShowSearch = function(search_string) {					// data passed is assigned as string_search
		CF.setJoin("d"+self.joinTVShows, 1);						// Show TV Show subpage
		CF.setJoin("d"+self.joinTVSeasons, 0);						// Hide TV Seasons list
		CF.setJoin("d"+self.joinTVEpisodes, 0);						// Hide TV Episodes list
		CF.setJoin("d"+self.joinRecentEpisodes, 0);					// Hide Recently Added Episodes list
		CF.setJoin("d"+self.joinTVShowsGenreDetails, 0);			// Hide Genre detail's subpage
		CF.setJoin("d"+self.joinTVEpisodeDetails, 0);				// Hide Episode Details subpage
		
		self.XBMC.searchTVShows(search_string, self.joinTVShows);
	};
	
	// Shows a list of all the TV Shows under the selected Genre categories (for TV Shows only)
	self.searchTVShowsGenre = function(list, listIndex, join){
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinTVShows, 0);					// Hide TV Show subpage
			CF.setJoin("d"+self.joinTVSeasons, 0);					// Hide TV Seasons list
			CF.setJoin("d"+self.joinTVEpisodes, 0);					// Hide TV Episodes list
			CF.setJoin("d"+self.joinRecentEpisodes, 0);				// Hide Recently Added Episodes list
			CF.setJoin("d"+self.joinTVShowsGenreDetails, 1);		// Show Genre detail's subpage
			CF.setJoin("d"+self.joinTVEpisodeDetails, 0);			// Hide Episode Details subpage
		
			self.XBMC.getTVShowsGenreDetails(t["[genre]"], self.joinTVShowsGenreDetails);				
		});
	};
	
	
	
	// Animation scripting example
	/*self.toggleTVShows = function(forceMode) {
		if (forceMode !== undefined) {
			// Use the forceMode to set a specific placement of the subpage
			if (forceMode == 1) {
				// Show the subpage
				CF.setProperties({join: "d"+self.joinTVShows, x: 0}, 0, 0.33, CF.AnimationCurveEaseOut);
				// Hide the browse bar
				CF.setProperties({join: "d"+(self.joinTVShows+100), opacity: 0.0}, 0, 0.33);
				// Move the episode details subpage over
				CF.setProperties({join: "d"+self.joinTVEpisode, x: 501}, 0.2, 0.15, CF.AnimationCurveEaseOut);
			} else {
				// Hide the subpage
				CF.setProperties({join: "d"+self.joinTVShows, x: -450}, 0, 0.33, CF.AnimationCurveEaseOut);
				// Show the browse bar
				CF.setProperties({join: "d"+(self.joinTVShows+100), opacity: 1.0}, 0, 0.33);
				// Move the episode details subpage back
				CF.setProperties({join: "d"+self.joinTVEpisode, x: 473}, 0, 0.33, CF.AnimationCurveEaseOut);
			}
		} else {
			// Automatically toggle the subpage location
			CF.getProperties("d"+self.joinTVShows, function(j) {
				if (j.x < 0) {
					// Item is off the page, so bring it back on
					CF.setProperties({join: j.join, x: 0}, 0, 0.33, CF.AnimationCurveEaseOut);
					// Hide the browse bar
					CF.setProperties({join: "d"+(self.joinTVShows+100), opacity: 0.0}, 0, 0.33);
					// Move the episode details subpage over
					CF.setProperties({join: "d"+self.joinTVEpisode, x: 501}, 0.2, 0.15, CF.AnimationCurveEaseOut);
				} else {
					// Item is on the page, so push it back off
					CF.setProperties({join: j.join, x: -450}, 0, 0.33, CF.AnimationCurveEaseOut);
					// Show the browse bar
					CF.setProperties({join: "d"+(self.joinTVShows+100), opacity: 1.0}, 0, 0.33);
					// Move the episode details subpage back
					CF.setProperties({join: "d"+self.joinTVEpisode, x: 473}, 0, 0.33, CF.AnimationCurveEaseOut);
				}
			});
		}
	};

	*/
	
	//================================================================================================================================
	/* MOVIES																														*/
	//================================================================================================================================
	
	// ************************	Movie List / Movie Wall / Recent Movies -> Movie Details *********************************************
	
	// Displays Movie List subpage. List is already loaded at startup.
	self.MovieList = function(){
		CF.setJoin("d"+self.joinMovies, 1);						// Show Movie list subpage	
		CF.setJoin("d"+self.joinMovieWall, 0);					// Hide Movie Wall subpage
		CF.setJoin("d"+self.joinRecentMovies, 0);				// Hide Recently Added Movie subpage
		CF.setJoin("d"+self.joinMoviesGenreDetails, 0);			// Hide Movie Genre Details subpage
	};
	
	// Displays a list of movies in Movie Wall format. Reads the data from global array.
	self.MovieWall = function(){
		CF.setJoin("d"+self.joinMovies, 0);						// Hide Movie list subpage	
		CF.setJoin("d"+self.joinMovieWall, 1);					// Show Movie Wall subpage
		CF.setJoin("d"+self.joinRecentMovies, 0);				// Hide Recently Added Movie subpage
		CF.setJoin("d"+self.joinMoviesGenreDetails, 0);			// Hide Movie Genre Details subpage
		
		self.XBMC.buildMovieWall(self.joinMovieWall);			// Show the Movie Wall
		
	};
	
	// Displays a list of recently added movies
	self.recentAddMovies = function(){
		CF.setJoin("d"+self.joinMovies, 0);						// Hide Movie list subpage	
		CF.setJoin("d"+self.joinMovieWall, 0);					// Hide Movie Wall subpage
		CF.setJoin("d"+self.joinRecentMovies, 1);				// Show Recently Added Movie subpage
		CF.setJoin("d"+self.joinMoviesGenreDetails, 0);			// Hide Movie Genre Details subpage
	};
	
	// Displays details of movies when selected
	self.selectMovie = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinMovieDetails, 1);			// Show MovieDetails subpage
			self.XBMC.getMovieDetails(t["[id]"], self.joinMovieDetails);
		});
	};
	
	// Play the selected Movie file
	self.playSelectedMovie = function(){
			self.XBMC.clearVideoPlaylist(self.joinCurrentVideoPlaylist);			// Clear the playlist of previous items
			setTimeout(function(){self.XBMC.playMovie(self.XBMC.currentMovieFile);}, 250);
	};
	
	// Play the selected Recent Movie file
	self.playRecentMovie = function(list, listIndex, join){
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.XBMC.clearVideoPlaylist(self.joinCurrentVideoPlaylist);			// Clear the playlist of previous items
			setTimeout(function(){self.XBMC.playMovie(t["[file]"]);}, 250);
		});
	};
	
	// ************************	General Sorting & Searching **********************************************************************************
	
	// Sorting 
	self.sortMovie = function(order, method) {
		CF.setJoin("d"+self.joinMovies, 1);						// Show Movie list subpage	
		CF.setJoin("d"+self.joinMovieWall, 0);					// Hide Movie Wall subpage
		CF.setJoin("d"+self.joinRecentMovies, 0);				// Hide Recently Added Movie subpage
		CF.setJoin("d"+self.joinMoviesGenreDetails, 0);			// Hide Movie Genre Details subpage
		self.XBMC.getMovies(self.joinMovies, order, method); 	// Sort and repopulate main Movie Array
	};
	
	// Searching (by title only)
	self.searchMovie = function(search_string){
		CF.setJoin("d"+self.joinMovies, 1);						// Show Movie list subpage	
		CF.setJoin("d"+self.joinMovieWall, 0);					// Hide Movie Wall subpage
		CF.setJoin("d"+self.joinRecentMovies, 0);				// Hide Recently Added Movie subpage
		CF.setJoin("d"+self.joinMoviesGenre, 0);				// Hide Movie Genre subpage
		CF.setJoin("d"+self.joinMoviesGenreDetails, 0);			// Hide Movie Genre Details subpage
		
		self.XBMC.getSearchedMovieArray(search_string, self.joinMovies);
	};
	
	// ************************	Show and Search Genres ****************************************************************************
	
	// Displays a list of all the Genre categories in the dropdown menu
	self.showMoviesGenre = function(){
		CF.setJoin("d"+self.joinMoviesGenre, 1);					// Show Movie Genre dropdown menu
		
		self.XBMC.getMoviesGenre(self.joinMoviesGenre);			
	};
	
	// Displays a list of all the Movies under the selected Genre categories
	self.searchMoviesGenre = function(list, listIndex, join){
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinMovies, 0);					// Hide Movie list subpage	
			CF.setJoin("d"+self.joinMovieWall, 0);				// Hide Movie Wall subpage
			CF.setJoin("d"+self.joinRecentMovies, 0);			// Hide Recently Added Movie subpage
			CF.setJoin("d"+self.joinMoviesGenreDetails, 1);		// Show Movie Genre Details subpage
			
			self.XBMC.getMoviesGenreDetails(t["[genre]"], self.joinMoviesGenreDetails);				
		});
	};
	
	//================================================================================================================================
	/* MUSIC																														*/
	//================================================================================================================================
	
	// ************************	All Artists -> Albums -> Songs -> Song Details *******************************************************
	
	// Displays a list of Albums when Artist item is selected
	self.selectMusicArtist = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinMusicArtist, 0);			// Hide Artist subpage
			CF.setJoin("d"+self.joinMusicAlbum, 1); 			// Show Music Album list
			CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Music Details subpage
			CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
			CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
			CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
			CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
			CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
			CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
			CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
			
			self.XBMC.getMusicAlbum(t["[id]"], t["[artist]"], t["[fanart]"], self.joinMusicAlbum);
		});
	};

	// Displays a list of Songs when Album item is selected
	self.selectMusicAlbum = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			
			CF.setJoin("d"+self.joinMusicArtist, 0);			// Hide Artist subpage
			CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
			CF.setJoin("d"+self.joinMusicSong, 1);				// Show Song subpage
			CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
			CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
			CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
			CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
			CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
			CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
			CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
			
			// Get Music Song list
			self.XBMC.getMusicSong(t["[id]"], t["[artist]"], t["[albumtitle]"], t["[fanart]"], self.joinMusicSong);
		});
	};
	
	// Displays a list of Songs when Recent Album item is selected
	self.selectRecentAlbum = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			
			CF.setJoin("d"+self.joinMusicArtist, 0);			// Hide Artist subpage
			CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
			CF.setJoin("d"+self.joinMusicSong, 0);				// Show Song subpage
			CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
			CF.setJoin("d"+self.joinRecentAlbumSongs, 1);		// Hide Recently Added Albums -> Songs subpage
			CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
			CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
			CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
			CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
			CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
			
			// Get Music Song list
			self.XBMC.getMusicSong(t["[id]"], t["[artist]"], t["[albumtitle]"], t["[fanart]"], self.joinRecentAlbumSongs);
		});
	};
	
	// Displays details of the Songs and automatically plays the Song when Song item is selected on the Song Page
	self.selectMusicSong = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinMusicDetails, 1);			// Show Song Details subpage
			
			self.XBMC.getMusicDetails(t["[id]"],t["[file]"], self.joinMusicDetails);
			self.XBMC.playSong(t["file"]);						// Plays the song
			self.XBMC.addAudioPlaylist(t["file"]); 				//Adds the song into playlist
		});
	};
	
	// Displays details of the Songs and automatically adds the item to the Audio Playlist when Song item is selected
	self.addSongPlaylist = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinMusicDetails, 1);			// Show Song Details subpage
			
			self.XBMC.getMusicDetails(t["[id]"],t["[file]"], self.joinMusicDetails);
			self.XBMC.addAudioPlaylist(t["file"]); 				//Adds the song into playlist by pessing the "Playlist" icon.
		});
	};
	
	// Adds whole album to playlist and play album starting from the first song. Deletes any previous items in the playlist and 
	// stop any other items that are playing.
	self.queueAlbumPlaylist = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.clearPlaylistAudio();													//  Clear list of any previous playing items
			setTimeout(function(){self.XBMC.addAlbumPlaylist(t["[id]"]);}, 250); 		//	Adds the song into playlist by pressing the "Play Album" icon.
		});
	};
	
	// ************************	All Albums -> Songs -> Song Details *************************************************************
	
	// Displays a list of Songs when Album item is selected
	self.selectAllAlbums = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			
			CF.setJoin("d"+self.joinMusicArtist, 0);			// Hide Artist subpage
			CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
			CF.setJoin("d"+self.joinMusicSong, 0);				// Show Song subpage
			CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
			CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
			CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
			CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
			CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
			CF.setJoin("d"+self.joinAlbumSongs, 1);				// Hide All Albums -> Songs subpage
			CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
			
			// Get Music Song list
			self.XBMC.getMusicSong(t["[id]"], t["[artist]"], t["[albumtitle]"], t["[fanart]"], self.joinAlbumSongs);
		});
	};
	
	// Displays details of the Songs and automatically plays the Song when Song item is selected on the Song Page
	self.selectAlbumSong = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinMusicDetails, 1);			// Show Song Details subpage
			
			self.XBMC.getMusicDetails(t["[id]"],t["[file]"], self.joinMusicDetails);
			self.XBMC.playSong(t["file"]);						// Plays the song
			self.XBMC.addAudioPlaylist(t["file"]); 				//Adds the song into playlist
		});
	};
	
	// ************************	All Songs -> Song Details ***********************************************************************
	
	
	// ************************	This is for Main Page : Recent Albums -> Songs **************************************************
	
	// Displays a list of Songs when Album item is selected
	self.selectRecentAlbumMainPage = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			
			CF.setJoin("d"+self.joinRecentAlbumsMain, 0);		// Show Recent Albums list on the Main Page
			CF.setJoin("d"+self.joinRecentSongsMain, 1);		// Hide Recent Songs list on the Main Page
			
			// Get Music Song list
			self.XBMC.getMusicSong(t["[id]"], t["[artist]"], t["[albumtitle]"], "", self.joinRecentSongsMain);
			
		});
	};
	
	// Displays details of the Songs and automatically plays the Song when Song item is selected on the Main Page
	self.selectMusicSongMainPage = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.XBMC.getMusicDetails(t["[id]"],t["[file]"], self.joinMusicDetails);
			self.XBMC.playSong(t["file"]);						// Plays the song
			self.XBMC.addAudioPlaylist(t["file"]); 				//Adds the song into playlist
		});
	};
	
	// This is Album <-> Songs subpage flipping on the Main Menu page.
	self.showRecentAlbums = function() {
		CF.setJoin("d"+self.joinRecentAlbumsMain, 1);		// Show Recent Albums list on the Main Page
		CF.setJoin("d"+self.joinRecentSongsMain, 0);		// Hide Recent Songs list on the Main Page
	};
	
	// ************************	Flipping between subpages ****************************************************************************
	
	// This is for the "Artist" button (to go back to previous list) in the Album list; dropdown Menu button "Artist"
	self.showArtists = function() {
		CF.setJoin("d"+self.joinMusicArtist, 1);			// Show Artist subpage
		CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
		CF.setJoin("d"+self.joinMusicSong, 0);				// Hide Song subpage
		CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
		CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
		CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
		CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
		CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
		CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
		CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
	};
	
	// This is for the "Album" button (to go back to previous list) in the Song list; dropdown Menu button "Album"
	self.showAlbums = function() {
		CF.setJoin("d"+self.joinMusicArtist, 0);			// Hide Artist subpage
		CF.setJoin("d"+self.joinMusicAlbum, 1);				// Show Album subpage
		CF.setJoin("d"+self.joinMusicSong, 0);				// Hide Song subpage
		CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
		CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
		CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
		CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
		CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
		CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
		CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
	};
	
	// This is for dropdown Menu button "Songs"
	self.showSongs = function() {
		CF.setJoin("d"+self.joinMusicArtist, 0);			// Hide Artist subpage
		CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
		CF.setJoin("d"+self.joinMusicSong, 1);				// Show Song subpage
		CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
		CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
		CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
		CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
		CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
		CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
		CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
	};
	
	// This is for dropdown Menu button "Songs"
	self.showAllAlbums = function() {
		CF.setJoin("d"+self.joinMusicArtist, 0);			// Hide Artist subpage
		CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
		CF.setJoin("d"+self.joinMusicSong, 0);				// Show Song subpage
		CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
		CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
		CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
		CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
		CF.setJoin("d"+self.joinAllAlbums, 1);				// Hide All Albums subpage
		CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
		CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
	};
	
	// This is for dropdown Menu button "Songs"
	self.showAlbumSongs = function() {
		CF.setJoin("d"+self.joinMusicArtist, 0);			// Hide Artist subpage
		CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
		CF.setJoin("d"+self.joinMusicSong, 0);				// Show Song subpage
		CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
		CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
		CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
		CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
		CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
		CF.setJoin("d"+self.joinAlbumSongs, 1);				// Hide All Albums -> Songs subpage
		CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
	};
	
	// This is for dropdown Menu button "Songs"
	self.showAllSongs = function() {
		CF.setJoin("d"+self.joinMusicArtist, 0);			// Hide Artist subpage
		CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
		CF.setJoin("d"+self.joinMusicSong, 0);				// Show Song subpage
		CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
		CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
		CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
		CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
		CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
		CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
		CF.setJoin("d"+self.joinAllSongs, 1);				// Hide All Songs subpage
	};
	
	// Shows a list of all the Recently Added Albums on the Music Page. Data is already loaded at startup, just need to switch to subpage. 
	self.recentAddAlbums = function(){
		CF.setJoin("d"+self.joinMusicArtist, 0);			// Hide Artist subpage
		CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
		CF.setJoin("d"+self.joinMusicSong, 0);				// Hide Song subpage
		CF.setJoin("d"+self.joinRecentAlbums, 1);			// Show Recently Added Albums subpage
		CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
		CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
		CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
		CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
		CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
		CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
	};
	
	// Shows a list of all the Recently Added Songs. Data is already loaded at startup, just need to switch to subpage. 
	self.recentAddSongs = function(){
		CF.setJoin("d"+self.joinMusicArtist, 0);			// Hide Artist subpage
		CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
		CF.setJoin("d"+self.joinMusicSong, 0);				// Hide Song subpage
		CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
		CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
		CF.setJoin("d"+self.joinRecentSongs, 1);			// Show Recently Added Songs subpage
		CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
		CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
		CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
		CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
	};
	
	// ************************	Sorting & Searching ****************************************************************************
	
	// Sorting options is only available for Artists.
	self.sortArtist = function(order, method) {
		CF.setJoin("d"+self.joinMusicArtist, 1);			// Show Artist subpage
		CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
		CF.setJoin("d"+self.joinMusicSong, 0);				// Hide Song subpage
		CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
		CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
		CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
		CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
		CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
		CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
		CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
		
		self.XBMC.getMusicArtist(self.joinMusicArtist, order, method);
	};
	
	// Searching options is available for Artist (by Artist name only)
	self.ArtistSearch = function(search_string) {
		CF.setJoin("d"+self.joinMusicArtist, 1);				// Show Artist subpage
			CF.setJoin("d"+self.joinMusicAlbum, 0);				// Hide Album subpage
			CF.setJoin("d"+self.joinMusicSong, 0);				// Hide Song subpage
			CF.setJoin("d"+self.joinRecentAlbums, 0);			// Hide Recently Added Albums subpage
			CF.setJoin("d"+self.joinRecentAlbumSongs, 0);		// Hide Recently Added Albums -> Songs subpage
			CF.setJoin("d"+self.joinRecentSongs, 0);			// Hide Recently Added Songs subpage
			CF.setJoin("d"+self.joinMusicDetails, 0);			// Hide Song Details subpage
			CF.setJoin("d"+self.joinAllAlbums, 0);				// Hide All Albums subpage
			CF.setJoin("d"+self.joinAlbumSongs, 0);				// Hide All Albums -> Songs subpage
			CF.setJoin("d"+self.joinAllSongs, 0);				// Hide All Songs subpage
		
		self.XBMC.searchArtist(search_string, self.joinMusicArtist);
	};
	
	//================================================================================================================================
	/* PLAYLISTS																													*/
	//================================================================================================================================
	
	// Gets the current Active Player. Gets the current playing item's details. Loops every 5s for feedback and update of playing media info.
	self.NowPlaying = function() {
		self.XBMC.getNowPlaying(self.joinNowPlaying);
	};
	
	self.selectAudioPlaylist = function(list, listIndex, join) {			// Plays the file in Audio playlist
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.XBMC.playAudioPlaylistFile(t["[index]"]);
		});
	};
	
	self.selectVideoPlaylist = function(list, listIndex, join) {			// Plays the file in Video playlist
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.XBMC.playVideoPlaylistFile(t["[index]"]);
		});
	};
	
	self.clearPlaylistAudio = function() {									// Clears the Audio Playlist only
		self.XBMC.clearAudioPlaylist(self.joinCurrentAudioPlaylist);
	};
	
	self.getPlaylistAudio = function() {									// Get items from the Audio Playlist only
		self.XBMC.getAudioPlaylist(self.joinCurrentAudioPlaylist);
	};
	
	self.clearPlaylistVideo = function() {									// Clears the Video Playlist only
		self.XBMC.clearVideoPlaylist(self.joinCurrentVideoPlaylist);
	};
	
	self.getPlaylistVideo = function() {									// Get items from the Video Playlist only
		self.XBMC.getVideoPlaylist(self.joinCurrentVideoPlaylist);
	};
	
	self.getAllPlaylist = function() {										// Get items from the both Playlist 
		self.XBMC.getAudioPlaylist(self.joinCurrentAudioPlaylist);
		self.XBMC.getVideoPlaylist(self.joinCurrentVideoPlaylist);
	};
	
	self.clearAllPlaylist = function() {									// Clears items from the both Playlist
		self.XBMC.clearAudioPlaylist(self.joinCurrentAudioPlaylist);
		self.XBMC.clearVideoPlaylist(self.joinCurrentVideoPlaylist);
	};
	
	//================================================================================================================================
	/* FILE																														*/
	//================================================================================================================================
	
	self.getVideoSource = function() {										// Get list of sources for Video
		self.XBMC.getSourceVideo(self.joinFileList);	
	};
	
	self.selectVideoDirectory = function(list, listIndex, join) {			// Get list of directory for sources for Video
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.XBMC.getDirectoryVideo(t["[file]"], self.joinFileList);
		});
	};
	
	self.getMusicSource = function() {										// Get list of sources for Music
		self.XBMC.getSourceMusic(self.joinFileList);	
	};
	
	self.getPictureSource = function() {									// Get list of sources for Pictures
		self.XBMC.getSourcePicture(self.joinFileList);	
	};
	
	self.getFileSource = function() {										// Get list of sources for Files
		self.XBMC.getSourceFile(self.joinFileList);	
	};
	
	self.getProgramSource = function() {									// Get list of sources for Programs
		self.XBMC.getSourceProgram(self.joinFileList);	
	};
		
	//================================================================================================================================
	/* ALL STARTUP COMMANDS																														*/
	//================================================================================================================================
	
	self.playStatusGet = function() {											// Get the current state of muting for volume
		self.XBMC.playPauseStatus(self.playStatus);
	};
	
	self.volGet = function() {											// Get the current state of muting for volume
		self.XBMC.volGet(self.setMuteState);
	};

	self.volMute = function() {											// Mutes the volume
		self.XBMC.volMute(self.setMuteState);
	};

	self.setMuteState = function() {									// Sets the feedback of the volume.
		if(self.XBMC.currentMute == true) {		// this means volume level = 0, means muted state
			CF.setJoin("d"+self.joinMute, 1);
			CF.setJoin("a90", 0);
		}else{
			CF.setJoin("d"+self.joinMute, 0);
			self.XBMC.volGet();
		}
	};
	
	self.searchInstances = function() {									// Search for all XBMC instances in the bonjour network : Still in progress
		self.XBMC.getXBMCBonjour();
	};

	self.setIPSettings = function() {									// Gets the values of the IP settings
		// Get the values of all the IP Settings at once.
		//s60 = System Name, s61 = Host Name / IP Add, s62 = port, s63 = username, s64 = password
		CF.getJoins(["s60", "s61", "s62", "s63", "s64"], function(joins) {
			
			//CF.log("System name: " + joins.s60.value);
			//CF.log("Host name/IP address: " + joins.s61.value);
			//CF.log("Port: " + joins.s62.value);
			//CF.log("Username: " + joins.s63.value);
			//CF.log("Password: " + joins.s64.value);

			//	Set all these values as global tokens and persist, use CF.setToken(CF.GlobalTokensJoin)
			CF.setToken(CF.GlobalTokensJoin, "[inputSysName]", joins.s60.value);
			CF.setToken(CF.GlobalTokensJoin, "[inputURL]", joins.s61.value);
			CF.setToken(CF.GlobalTokensJoin, "[inputPort]", joins.s62.value);				
			CF.setToken(CF.GlobalTokensJoin, "[inputUsername]", joins.s63.value);
			CF.setToken(CF.GlobalTokensJoin, "[inputPassword]", joins.s64.value);
				
			
			// once changed all the settings, switch and connect to the new system.
			self.XBMC.url = joins.s61.value;
			self.XBMC.port = joins.s62.value;
			self.XBMC.username = joins.s63.value;
			self.XBMC.password = joins.s64.value;
			
			self.setup();
		});
	};
	
	self.XBMC = new XBMC_Controller(params);

	return self;
}

var XBMCMacMini;
var newSysName;
var newURL;
var newPort;
var newUsername;
var newPassword;

CF.userMain = function() {
	
	// On startup, check for global tokens via CF.getJoin(CF.GlobalTokensJoin) and get the values for all the paramaters.
	
	//Get the global tokens values. Can set the default value of the tokens via Global Token Manager.
	CF.getJoin(CF.GlobalTokensJoin, function(join, values, tokens) {
	
		//Read the tokens, if accidentally deleted the settings of the tokens then use default values.
		this.newSysName = tokens["inputSysName"]|| "HTPC";
		this.newURL = tokens["[inputURL]"] || "192.168.0.100";
		this.newPort = tokens["[inputPort]"] || "8080";
		this.newUsername = tokens["[inputUsername]"];
		this.newPassword = tokens["[inputPassword]"];
		
		CF.setJoins([{join: "s60", value: this.newSysName}, {join: "s61", value: this.newURL}, {join: "s62", value: this.newPort}, {join: "s63", value: this.newUsername}, {join: "s64", value: this.newPassword}]);
	
		this.XBMCMacMini = new XBMC_GUI({username: this.newUsername, password: this.newPassword, url: this.newURL, port: this.newPort});
		
		//Manually assign IP address and settings of the system
		//this.XBMCMacMini = new XBMC_GUI({username: "xbmc", password: "xbmc", url: "192.168.0.100", port: 8080}); 
		
		this.XBMCMacMini.setup();
	});
	
};