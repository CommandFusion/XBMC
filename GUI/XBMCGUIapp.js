/* XBMC View for CommandFusion
===============================================================================

AUTHOR:		Jarrod Bell, CommandFusion
CONTACT:	support@commandfusion.com
URL:		https://github.com/CommandFusion/
VERSION:	Beta v0.0.2
LAST MOD :	December 2012
MODULE JOIN RANGE: 4000 - 4499
MODULE TEST SETUP : 
- Windows XP Professional Edition 
- Windows 7 Ultimate
- XBMC Eden v11.0 
- Guidesigner 2.4.1.0
- iViewer 4 v4.0.214 build 215
- iViewer Next v4.0.210 build 210
- iViewer TF v4.0.233
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
		
		// Menu button joins
		joinbtnTVShows: 			4000,		// 10
		joinbtnMovies: 				4001,       // 11
		joinbtnMusic: 				4002,       // 12
		joinbtnPlayingNow: 			4003,		// 13
		joinbtnPlaylist: 			4004,       // 14
		joinbtnFile: 				4005,       // 15
		joinLEDstatus:				4006,       // 4006
		joinVolSlider:				4007,		// 90
		joinVolMute:                4008,       // 2999
		//joinMainSettings:			4009,		// 18, changed to 4055
		joinbtnPower:				4010,		// 4010
		joinbtnShutdown:			4011,		// 80
		joinbtnSuspend:				4012, 		// 81
		joinbtnHibernate:			4013,		// 82
		joinbtnReboot:				4014, 		// 83
		joinbtnExit:				4015,       // 84
		joinbtnHome:				4016,		// none
		//joinSubpageFanart:		4017,		// 10000
		joinSystemDisconnected:		4018,		// none
		
		//Dropdown Menu Subpage joins
		joinmenuTVShowsMain:			4020,       // 20
		joinmenuTVShowsOrder:			4021,       // 21
		joinmenuTVShowsAscend:			4022,       // 22
		joinmenuTVShowsDescend:			4023,       // 23
		joinmenuTVShowsRecentEpisode:	4024,       // 24
		joinmenuTVShowsSettings:		4025,       // 25
		joinmenuTVShowsEpisode:			4026,       // 29
		joinmenuTVShowsHide:			4027,       // none
		joinmenuTVShowsGenre:			4028,       // none
		
		// joins for lists usage	4031 - 4039
		
		joinmenuMusicArtist:		4040,		// 40
		joinmenuMusicAlbumSort:		4041,		// 41
		joinmenuMusicSongSort:		4042,		// 42
		joinmenuMusicSong:			4043,		// 43
		joinmenuMusicMain:			4044,		// 44
		joinmenuMusicMain:			4045,		// 45
		joinmenuMusicAlbum:			4046,		// 46
		joinmenuMusicRecentAlbums:	4047,		// 47
		joinmenuMusicRecentSongs:	4048,		// 48
		
		joinmenuMovieMain:			4050,		// 30
		joinmenuMovieSortOrder:		4051,		// 31
		joinmenuMovieSortMethod:	4052,		// 32
		joinmenuMovieHide:			4053,		// 33
		
		joinMainSettings:			4055,		// 17
		joinMainSettingsDetails:	4056,		// 18
		joinMainSettingsAdd:		4057,		// 19
		
		joinInstanceLookup:			4060,		// none
		
		joinSearchTVSeries:			4061,		// 50
		joinSearchMovies:			4062,		// 51
		joinSearchArtist:			4063,		// 52
		joinSearchAlbum:			4064,		// 53
		joinSearchSong:				4065,		// 52
		
		// GUI definitions
		joinTVShows:				4101,		// 4101
		joinTVSeasons:				4102,		// 4102
		joinTVEpisodes:				4103,		// 4103
		joinRecentEpisodes:			4104,		// 4104
		joinTVShowsGenre:			4105,		// 4105
		joinTVShowSortLabel:		4106,		// 4106
		joinTVEpisodeDetails:		4110,		// 4110 - 4119 for episode details
		joinAlphabarTVSeries:		4120,
		joinTVFanart:				4121,		// 11000
		
		joinMovies:					4201,		// 1001
		joinMovieWall:				4202,		// 4202
		joinRecentMovies:			4203,		// 1003
		joinMoviesGenre:			4204,		// 1004
		joinMoviesGenreDetails:		4205,		// 1005
		joinMovieDetails:   		4210,		// 4210 - 4220 for movie details
		joinAlphabarMovies:			4221,
		
		joinAllArtists: 			4301,		// 5001
		joinArtistAlbums: 			4302,		// 5002
		joinArtistAlbumSongs: 		4303,		// 5003
		joinRecentAlbums:			4304,		// 5004
		joinRecentSongs:			4305,		// 5005
		joinRecentAlbumSongs:		4306,		// 5006
		joinAllAlbums:				4307,		// 5007
		joinAlbumSongs:				4308,		// 5008
		joinAllSongs:				4309,		// 5009
		joinMusicDetails:			4310,		// 4310 - 4320 for music details
		joinRecentAlbumsMain:		4321,		// 9103
		joinRecentAlbumSongsMain:	4322,		// 9104
		joinAlphabarArtist:			4323,		// 5556
		joinAlphabarAlbum:			4324,		// 5555
		joinAlphabarSong:			4325,		// 5557
		joinMusicFanart:			4326,		// 10000
		
		joinNowPlaying: 			4400,		// 8000 4400
		joinNowPlayingBlank:		4401,		// 8001
		joinNowPlayingAudio:		4402,		// 8002
		joinNowPlayingVideo:		4403,		// 8003
		joinAudioRewind:			4404,		// 1
		joinAudioPlayPause:			4405,		// 5555
		joinAudioForward:			4406,		// 3
		joinVideoRewind:			4407,		// 1
		joinVideoPlayPause:			4408,		// 6666
		joinVideoForward:			4409,		// 3
		joinNowPlayingAudioDetails:	4411,		// 4411 - 4420 for audio details
		joinNowPlayingVideoDetails:	4421,		// 4421 - 4430 for video details 		
		
		joinCurrentAudioPlaylist: 	4441,		// 4441
		joinCurrentVideoPlaylist: 	4442,		// 4442
		joinSavedPlaylist:			4443,		// none
		joinmenuPlaylist:			4444,		// none
		
		joinAudioRepeatOff:			4451,		// 8201
		joinAudioRepeatOne:			4452,		// 8202
		joinAudioRepeatAll:			4453,		// 8203
		joinAudioShuffleOn:			4454,		// 8204
		joinAudioShuffleOff:		4455,		// 8205
		
		joinVideoRepeatOff:			4461,		// 8301
		joinVideoRepeatOne:			4462,		// 8302
		joinVideoRepeatAll:			4463,		// 8303
		joinVideoShuffleOn:			4464,		// 8304
		joinVideoShuffleOff:		4465,		// 8305
		
		joinFileList: 				4470,		// 9001
		
		joinGesture: 				4475,		// 45
		joinPortraitQuit:			4476,		// 84
		
		joinSystemDescription:		4480,		// 60
		joinSystemHost:				4481,		// 61
		joinSystemPort:				4482,		// 62
		joinSystemUsername:			4483,		// 63
		joinSystemPassword:			4484,		// 64
		joinSystemSelectInstance:	4485,		// 65
		joinSystemUpdateInstance:	4486,		// 66
		joinSystemDeleteInstance:	4487,		// 67
		joinSystemLabelInstance:	4488,		// 68
		joinAddSystemDescription:	4490,		// 70
		joinAddSystemHost:			4491,		// 71
		joinAddSystemPort:			4492,		// 72
		joinAddSystemUsername:		4493,		// 73
		joinAddSystemPassword:		4494,		// 74
		
		//joinRecentEpisodesMain:	4108,		// 9101
		//joinRecentMoviesMain:		4207,		// 9102
		
	};

		
	self.setup = function() {
		
		// Clear lists from previous data for new XBMC instance to load new data
		CF.setJoins([
			{join: "l"+self.joinTVShows, value: "0x"},				// TV Series list
			{join: "l"+self.joinTVSeasons, value: "0x"},			// TV Seasons list
			{join: "l"+self.joinTVEpisodes, value: "0x"},			// TV Episodes list
			{join: "l"+self.joinRecentEpisodes, value: "0x"},		// TV Recent Episodes list
			{join: "l"+self.joinTVShowSortLabel, value: "0x"},		// TV Sort Label list
			{join: "l"+self.joinTVShowsSettings, value: "0x"},		// TV Shows Settings list
			{join: "l"+self.joinMovies, value: "0x"},				// Movies list
			{join: "l"+self.joinMovieWall, value: "0x"},			// Movie Wall list
			{join: "l"+self.joinRecentMovies, value: "0x"},			// Recent Movies list
			{join: "l"+self.joinMoviesGenre, value: "0x"},			// Movies Genre list
			{join: "l"+self.joinAllArtists, value: "0x"},			// All Artists list
			{join: "l"+self.joinArtistAlbums, value: "0x"},			// All Artists -> Albums list
			{join: "l"+self.joinArtistAlbumSongs, value: "0x"},		// All Artists -> Albums -> Songs list
			{join: "l"+self.joinRecentAlbums, value: "0x"},			// Recent Albums list
			{join: "l"+self.joinRecentAlbumSongs, value: "0x"},		// Recent Albums -> Songs list
			{join: "l"+self.joinRecentSongs, value: "0x"},			// Recent Songs list
			{join: "l"+self.joinAllAlbums, value: "0x"},			// All Albums list
			{join: "l"+self.joinAlbumSongs, value: "0x"},			// All Albums -> Songs list
			{join: "l"+self.joinAllSongs, value: "0x"},				// All Songs list
			{join: "l"+self.joinRecentEpisodesMain, value: "0x"},	// TV Recent Episode list on the starting page
			{join: "l"+self.joinRecentMoviesMain, value: "0x"},		// Recent Movies list on the starting page
			{join: "l"+self.joinRecentAlbumsMain, value: "0x"}		// Recent Albums list on the starting page
		]); 
		
		// Shows list 
		CF.setJoin("d"+self.joinCurrentAudioPlaylist, 1);	// Show Audio Playlist list
		CF.setJoin("d"+self.joinCurrentVideoPlaylist, 1);	// Show Video Playlist list
		CF.setJoin("d"+self.joinFileList, 1);				// Show File list
		
		// retrieve global array
		//self.XBMC.retrieveGlobalArray();
		
		// Call the setup function on the XBMC instance
		self.XBMC.setup();
		
		// Get volume state on startup
		self.volGet();
		
		// Check XBMC connectivity by triggering the loop.
		self.NowPlaying();
		
		// Start watching changes to icons. Lights up the different icons when the page changes.
		CF.watch(CF.ObjectPressedEvent, ["d"+self.joinbtnTVShows, "d"+self.joinbtnMovies, "d"+self.joinbtnMusic, "d"+self.joinbtnPlayingNow, 
		"d"+self.joinbtnPlaylist, "d"+self.joinbtnFile, "d"+self.joinbtnHome], self.onPageChanged);
		
		//--------------------------------------------------------------------------------------------------
		// Request all the initial lists and show the correct subpages
		//--------------------------------------------------------------------------------------------------
		
		// Get All Recent Items
		//self.XBMC.getRecentEpisodes(self.joinRecentEpisodes, self.joinRecentEpisodesMain);		// Recently Added Episodes
		self.XBMC.getRecentEpisodes(self.joinRecentEpisodes);		// Recently Added Episodes
		//self.XBMC.getRecentMovies(self.joinRecentMovies, self.joinRecentMoviesMain);			// Recently Added Movies
		self.XBMC.getRecentMovies(self.joinRecentMovies);			// Recently Added Movies
		
		CF.setJoin("d"+self.joinRecentAlbumsMain, 1);											// Show Recent Albums list on the Main Page
		CF.setJoin("d"+self.joinRecentAlbumSongsMain, 0);										// Hide Recent Songs list on the Main Page
		self.XBMC.getRecentAlbums(self.joinRecentAlbums, self.joinRecentAlbumsMain);			// Recently Added Albums
		self.XBMC.getRecentSongs(self.joinRecentSongs);											// Recently Added Songs
		
		// TV Show function (subpage join, sort order, method). Default sorting is ascending and by label. Default shows TV Series subpage.
		self.XBMC.getTVShows(self.joinTVShows, "ascending", "label");			
		self.subpageSeries();
		
		// Movies function (subpage join, sort order, method). Default sorting is ascending and by label. Default shows Movie List subpage.
		self.XBMC.getMovies(self.joinMovies, "ascending", "label");				
		self.subpageMovies();
		
		// Music general function (subpage join, sort order, method). Default sorting is ascending and by label. Default shows All Artists subpage.
		self.XBMC.getMusicArtist(self.joinAllArtists, "ascending", "label");					// Get all artists
		self.XBMC.getAllAlbums(self.joinAllAlbums, "ascending", "label");						// Get all albums
		self.XBMC.getAllSongs(self.joinAllSongs, "ascending", "label");						    // Get all songs. Disable this if number of songs gets too big.
		self.subpageAllArtists();
	};
	
	self.onPageChanged = function(join, value, tokens) {
			switch(join)
			{
				case "d"+self.joinbtnTVShows:
					CF.flipToPage("TVShow");								// Flip to TV Show page
					CF.setJoins([
						{ join:"d"+self.joinbtnTVShows, value:1 }, 			// On TV Show icon
						{ join:"d"+self.joinbtnMovies, value:0 },       	// Off Movies icon        
						{ join:"d"+self.joinbtnMusic, value:0 },            // Off Music icon   
						{ join:"d"+self.joinbtnPlayingNow, value:0 },       // Off Now Playing icon
						{ join:"d"+self.joinbtnPlaylist, value:0 },         // Off Playlist icon       
						{ join:"d"+self.joinbtnFile, value:0 }        		// Off File icon         				
					]);
					break;
				case "d"+self.joinbtnMovies:
					CF.flipToPage("Movie");									// Flip to Movie page
					CF.setJoins([
						{ join:"d"+self.joinbtnTVShows, value:0 }, 			// Off TV Show icon
						{ join:"d"+self.joinbtnMovies, value:1 },       	// On Movies icon        
						{ join:"d"+self.joinbtnMusic, value:0 },            // Off Music icon   
						{ join:"d"+self.joinbtnPlayingNow, value:0 },       // Off Now Playing icon
						{ join:"d"+self.joinbtnPlaylist, value:0 },         // Off Playlist icon       
						{ join:"d"+self.joinbtnFile, value:0 }        		// Off File icon         				
					]);
					break;
				case "d"+self.joinbtnMusic:
					CF.flipToPage("Music");									// Flip to Music page
					CF.setJoins([
						{ join:"d"+self.joinbtnTVShows, value:0 }, 			// Off TV Show icon
						{ join:"d"+self.joinbtnMovies, value:0 },       	// Off Movies icon        
						{ join:"d"+self.joinbtnMusic, value:1 },            // On Music icon   
						{ join:"d"+self.joinbtnPlayingNow, value:0 },       // Off Now Playing icon
						{ join:"d"+self.joinbtnPlaylist, value:0 },         // Off Playlist icon       
						{ join:"d"+self.joinbtnFile, value:0 }        		// Off File icon         				
					]);
					break;
				case "d"+self.joinbtnPlayingNow:
					CF.flipToPage("PlayingNow");							// Flip to Playing Now page
					CF.setJoins([
						{ join:"d"+self.joinbtnTVShows, value:0 }, 			// Off TV Show icon
						{ join:"d"+self.joinbtnMovies, value:0 },       	// Off Movies icon        
						{ join:"d"+self.joinbtnMusic, value:0 },            // Off Music icon   
						{ join:"d"+self.joinbtnPlayingNow, value:1 },       // On Now Playing icon
						{ join:"d"+self.joinbtnPlaylist, value:0 },         // Off Playlist icon       
						{ join:"d"+self.joinbtnFile, value:0 }        		// Off File icon         				
					]);
					break;
				case "d"+self.joinbtnPlaylist:
					CF.flipToPage("Playlist");								// Flip to Playlist page
					CF.setJoins([
						{ join:"d"+self.joinbtnTVShows, value:0 }, 			// Off TV Show icon
						{ join:"d"+self.joinbtnMovies, value:0 },       	// Off Movies icon        
						{ join:"d"+self.joinbtnMusic, value:0 },            // Off Music icon   
						{ join:"d"+self.joinbtnPlayingNow, value:0 },       // Off Now Playing icon
						{ join:"d"+self.joinbtnPlaylist, value:1 },         // On Playlist icon       
						{ join:"d"+self.joinbtnFile, value:0 }        		// Off File icon         				
					]);
					break;
				case "d"+self.joinbtnFile:
					CF.flipToPage("File");									// Flip to File page
					CF.setJoins([
						{ join:"d"+self.joinbtnTVShows, value:0 }, 			// Off TV Show icon
						{ join:"d"+self.joinbtnMovies, value:0 },       	// Off Movies icon        
						{ join:"d"+self.joinbtnMusic, value:0 },            // Off Music icon   
						{ join:"d"+self.joinbtnPlayingNow, value:0 },       // Off Now Playing icon
						{ join:"d"+self.joinbtnPlaylist, value:0 },         // On Playlist icon       
						{ join:"d"+self.joinbtnFile, value:1 }        		// Off File icon         				
					]);
					break;
				case "d"+self.joinbtnHome:
					CF.flipToPage("MainMenu");								// Flip to Main Menu page
					CF.setJoins([
						{ join:"d"+self.joinbtnTVShows, value:0 }, 			// Off TV Show icon
						{ join:"d"+self.joinbtnMovies, value:0 },       	// Off Movies icon        
						{ join:"d"+self.joinbtnMusic, value:0 },            // Off Music icon   
						{ join:"d"+self.joinbtnPlayingNow, value:0 },       // Off Now Playing icon
						{ join:"d"+self.joinbtnPlaylist, value:0 },         // On Playlist icon       
						{ join:"d"+self.joinbtnFile, value:0 }        		// Off File icon         				
					]);
					break;	
			} 
	};
	
	// ************************	Flipping between dropdown menu for Main Page ***********************************************************
	
	self.menuMainPage = function() {
		CF.setJoins([
				{ join:"d"+self.joinMainSettings, value:1 },   				// Show Main Page main drop down menu
				{ join:"d"+self.joinMainSettingsDetails, value:0 },       	// Hide Main Page drop down menu details          
				{ join:"d"+self.joinMainSettingsAdd, value:0 }              // Hide Main Page drop down menu Add details   
		]);
	};
	
	self.menuMainDetails = function() {
		CF.setJoins([
				{ join:"d"+self.joinMainSettings, value:0 },   				// Show Main Page main drop down menu
				{ join:"d"+self.joinMainSettingsDetails, value:1 },       	// Hide Main Page drop down menu details          
				{ join:"d"+self.joinMainSettingsAdd, value:0 }              // Hide Main Page drop down menu Add details   
		]);
	};
	
	self.menuMainAdd = function() {
		CF.setJoins([
				{ join:"d"+self.joinMainSettings, value:0 },   				// Show Main Page main drop down menu
				{ join:"d"+self.joinMainSettingsDetails, value:0 },       	// Hide Main Page drop down menu details          
				{ join:"d"+self.joinMainSettingsAdd, value:1 }              // Hide Main Page drop down menu Add details   
		]);
	};
	
	// ************************	Flipping between dropdown menu for TV Shows ***********************************************************
	
	self.menuTVShowGenre = function() {
		CF.setJoins([
				{ join:"d"+self.joinmenuTVShowsMain, value:1 },   			// Show Main Page main drop down menu
				{ join:"d"+self.joinTVShowsGenre, value:0 },       			// Hide Main Page drop down menu details          
		]);
	};
	
	// ************************	Flipping between dropdown menu for Movie    ***********************************************************
	
	self.menuMovieGenre = function() {
		CF.setJoins([
				{ join:"d"+self.joinmenuMovieMain, value:1 },   			// Show Main Page main drop down menu
				{ join:"d"+self.joinMoviesGenre, value:0 },       			// Hide Main Page drop down menu details          
		]);
	};
	
	// ************************	Flipping between dropdown menu for Music    ***********************************************************
	
	self.menuMusicSongSort = function() {
		CF.setJoins([
				{ join:"d"+self.joinmenuMusicSong, value:1 },   			// Show Main Page main drop down menu
				{ join:"d"+self.joinmenuMusicSongSort, value:0 },       	// Hide Main Page drop down menu details          
		]);
	};
	
	self.menuMusicAlbumSort = function() {
		CF.setJoins([
				{ join:"d"+self.joinmenuMusicAlbum, value:1 },   			// Show Main Page main drop down menu
				{ join:"d"+self.joinmenuMusicAlbumSort, value:0 },       	// Hide Main Page drop down menu details          
		]);
	};
	
	//================================================================================================================================
	/* TV SHOWS																														*/
	//================================================================================================================================
	
	// ************************	TV Series -> Seasons -> Episodes -> Episode Details -> Play/Playlist episode *************************
	
	// Displays a list of Season when TV Show item is selected
	self.selectTVShow = function(list, listIndex, join) {							
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.subpageSeason();
			self.XBMC.getTVSeasons(t["[id]"],t["[fanart]"], t["[series]"], self.joinTVSeasons, "ascending", "label"); 	// Get TV Seasons list
		});
	};

	// Displays a list of Episodes when Season item is selected
	self.selectTVSeason = function(list, listIndex, join) {							
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.subpageEpisodes();
			self.XBMC.getTVEpisodes(t["[id]"], t["[fanart]"], self.joinTVEpisodes, "ascending", "episode"); 	// Get TV Episodes list
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
	
	// ************************	Sorting & Searching **********************************************************************************
	
	// Sorting options is available for TV Series only 
	self.sortTVShow = function(order, method) {
		self.subpageSortLabel();
		self.XBMC.getTVShows(self.joinTVShowSortLabel, order, method);
	};
	
	// Sorting options is available for TV Series only 
	self.sortEpisodes = function(order, method) {
		self.subpageEpisodes();
		self.XBMC.sortTVEpisodes(self.joinTVEpisodes, order, method); 	// Get TV Episodes list
		
	};
	
	// Search options is available for TV Series only 
	self.TVShowSearch = function(search_string) {					// data passed is assigned as string_search
		self.subpageSeries();
		self.XBMC.searchTVShows(search_string, self.joinTVShows);
	};
	
	// Alphabar Search options is available for TV Series only 
	self.alphasrchTVShows = function(sliderval) {					// data passed is assigned as string_search
		self.subpageSeries();
		self.XBMC.alphabarTVShows(sliderval, self.joinTVShows);
	};
	
	// Shows a list of all the TV Shows under the selected Genre categories (for TV Shows only)
	self.searchTVShowsGenre = function(list, listIndex, join){
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.subpageSortLabel();
			self.XBMC.getTVShowsGenreDetails(t["[genre]"], self.joinTVShowSortLabel);				
		});
	};
	
	// Shows a list of all the unwatched Episodes
	self.showUnwatchedEpisodes = function(){
		self.subpageEpisodes();
		self.XBMC.getUnwatchedEpisodes(self.joinTVEpisodes);
	};
	
	// Shows a list of all the Episodes
	self.showAllEpisodes = function(){
		self.subpageEpisodes();
		self.XBMC.getAllEpisodes(self.joinTVEpisodes);
	};
	
	// ************************	Flipping between subpages ****************************************************************************
	
	// "Series" button in the Season list. Also for the dropdown Menu button "TV Shows" in the TV Series subpage.
	self.subpageSeries = function() {
		CF.setJoins([
				{ join:"d"+self.joinTVShows, value:1 },   				// Show Series subpage
				{ join:"d"+self.joinTVSeasons, value:0 },       		// Hide Season subpage          
				{ join:"d"+self.joinTVEpisodes, value:0 },              // Hide Episodes subpage   
				{ join:"d"+self.joinRecentEpisodes, value:0 },          // Hide Recent Episodes subpage       
				{ join:"d"+self.joinTVShowSortLabel, value:0 },         // Hide Genre subpage       
				{ join:"d"+self.joinTVEpisodeDetails, value:0 }        // Hide Episode Details subpage         				
		]);
	};
	
	// "Season" button in the Episode list. Also for dropdown Menu button "Season from Selected TV Show"
	self.subpageSeason = function() {
		CF.setJoins([
				{ join:"d"+self.joinTVShows, value:0 },   				// Hide Series subpage
				{ join:"d"+self.joinTVSeasons, value:1 },       		// Show Season subpage          
				{ join:"d"+self.joinTVEpisodes, value:0 },              // Hide Episodes subpage   
				{ join:"d"+self.joinRecentEpisodes, value:0 },          // Hide Recent Episodes subpage       
				{ join:"d"+self.joinTVShowSortLabel, value:0 },         // Hide Genre subpage       
				{ join:"d"+self.joinTVEpisodeDetails, value:0 }        // Hide Episode Details subpage         				
		]);
	};
	
	// Dropdown Menu button "Episodes from Selected Season"
	self.subpageEpisodes = function() {
		CF.setJoins([
				{ join:"d"+self.joinTVShows, value:0 },   				// Hide Series subpage
				{ join:"d"+self.joinTVSeasons, value:0 },       		// Hide Season subpage          
				{ join:"d"+self.joinTVEpisodes, value:1 },              // Show Episodes subpage   
				{ join:"d"+self.joinRecentEpisodes, value:0 },          // Hide Recent Episodes subpage       
				{ join:"d"+self.joinTVShowSortLabel, value:0 },         // Hide Genre subpage       
				{ join:"d"+self.joinTVEpisodeDetails, value:0 }        // Hide Episode Details subpage         				
		]);
	};
	
	// Shows the subpage ofthe Recently Added Episodes. The list is already loaded at startup. 
	self.subpageRecentEpisodes = function(){
		CF.setJoins([
				{ join:"d"+self.joinTVShows, value:0 },   				// Hide Series subpage
				{ join:"d"+self.joinTVSeasons, value:0 },       		// Hide Season subpage          
				{ join:"d"+self.joinTVEpisodes, value:0 },              // Hide Episodes subpage   
				{ join:"d"+self.joinRecentEpisodes, value:1 },          // Show Recent Episodes subpage       
				{ join:"d"+self.joinTVShowSortLabel, value:0 },         // Hide Genre subpage       
				{ join:"d"+self.joinTVEpisodeDetails, value:0 }        // Hide Episode Details subpage         				
		]);
	};
	
	// Shows the subpage ofthe Recently Added Episodes. The list is already loaded at startup. 
	self.subpageSortLabel = function(){
		CF.setJoins([
				{ join:"d"+self.joinTVShows, value:0 },   				// Hide Series subpage
				{ join:"d"+self.joinTVSeasons, value:0 },       		// Hide Season subpage          
				{ join:"d"+self.joinTVEpisodes, value:0 },              // Hide Episodes subpage   
				{ join:"d"+self.joinRecentEpisodes, value:0 },          // Hide Recent Episodes subpage       
				{ join:"d"+self.joinTVShowSortLabel, value:1 },         // Show Genre subpage       
				{ join:"d"+self.joinTVEpisodeDetails, value:0 }        // Hide Episode Details subpage         				
		]);
	};
	
	// Shows a list of all the Genre categories (for TV Shows only) in the drop down menu
	self.showTVShowsGenre = function(){
		CF.setJoin("d"+self.joinTVShowsGenre, 1);					// Show Genre list's subpage and is part of the dropdown menu.
		self.XBMC.getTVShowsGenre(self.joinTVShowsGenre);	
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
		self.subpageMovies();
	};
	
	// Displays a list of movies in Movie Wall format. Reads the data from global array.
	self.MovieWall = function(){
		self.subpageMovieWall();
		self.XBMC.buildMovieWall(self.joinMovieWall);			// Show the Movie Wall
	};
	
	// Displays a list of recently added movies
	self.recentAddMovies = function(){
		self.subpageRecentMovies();
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
		self.subpageMovies();
		self.XBMC.getMovies(self.joinMovies, order, method); 	// Sort and repopulate main Movie Array
	};
	
	// Searching (by title only)
	self.searchMovie = function(search_string){
		self.subpageMovies();
		CF.setJoin("d"+self.joinMoviesGenre, 0);				// Hide Movie Genre subpage
		self.XBMC.getSearchedMovieArray(search_string, self.joinMovies);
	};
	
	// Alphabar Search options is available for Movie Titles only 
	self.alphasrchMovies = function(sliderval) {					// data passed is assigned as string_search
		self.subpageMovies();
		CF.setJoin("d"+self.joinMoviesGenre, 0);				// Hide Movie Genre subpage
		self.XBMC.alphabarMovies(sliderval, self.joinMovies);
	};
	
	self.showUnwatchedMovies = function(){
		self.subpageMovie();
		self.XBMC.getUnwatchedMovies(self.joinMovies);
	};
	
	self.showAllMovies = function(){
		self.subpageMovie();
		self.XBMC.getAllMovies(self.joinMovies);
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
			self.subpageMovieGenreDetails();
			self.XBMC.getMoviesGenreDetails(t["[genre]"], self.joinMoviesGenreDetails);				
		});
	};
	
	// ************************	Flipping between subpages ****************************************************************************
	
	// show Movies subpage
	self.subpageMovies = function() {
		CF.setJoins([
				{ join:"d"+self.joinMovies, value:1 },   				// Show Movies subpage
				{ join:"d"+self.joinMovieWall, value:0 },       		// Hide Movie Wall subpage        
				{ join:"d"+self.joinRecentMovies, value:0 },            // Hide Recent Movies subpage   
				{ join:"d"+self.joinMoviesGenreDetails, value:0 },      // Hide Movies Genre subpage       
		]);
	};
	
	// show Movie Wall subpage
	self.subpageMovieWall = function() {
		CF.setJoins([
				{ join:"d"+self.joinMovies, value:0 },   				// Hide Movies subpage
				{ join:"d"+self.joinMovieWall, value:1 },       		// Show Movie Wall subpage        
				{ join:"d"+self.joinRecentMovies, value:0 },            // Hide Recent Movies subpage   
				{ join:"d"+self.joinMoviesGenreDetails, value:0 },      // Hide Movies Genre subpage       
		]);
	};
	
	// show Recent Movies subpage
	self.subpageRecentMovies = function() {
		CF.setJoins([
				{ join:"d"+self.joinMovies, value:0 },   				// Hide Movies subpage
				{ join:"d"+self.joinMovieWall, value:0 },       		// Hide Movie Wall subpage        
				{ join:"d"+self.joinRecentMovies, value:1 },            // Show Recent Movies subpage   
				{ join:"d"+self.joinMoviesGenreDetails, value:0 },      // Hide Movies Genre subpage       
		]);
	};
	
	// show Movies subpage
	self.subpageMovieGenreDetails = function() {
		CF.setJoins([
				{ join:"d"+self.joinMovies, value:0 },   				// Hide Movies subpage
				{ join:"d"+self.joinMovieWall, value:0 },       		// Hide Movie Wall subpage        
				{ join:"d"+self.joinRecentMovies, value:0 },            // Hide Recent Movies subpage   
				{ join:"d"+self.joinMoviesGenreDetails, value:1 },      // Show Movies Genre subpage       
		]);
	};
	
	//================================================================================================================================
	/* MUSIC																														*/
	//================================================================================================================================
	
	// ************************	All Artists -> Albums -> Songs -> Song Details *******************************************************
	
	// Displays a list of Albums when Artist item is selected
	self.selectMusicArtist = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.subpageArtistAlbums();
			self.XBMC.getMusicAlbum(t["[id]"], t["[fanart]"], self.joinArtistAlbums);
		});
	};

	// Displays a list of Songs when Album item is selected
	self.selectMusicAlbum = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.subpageArtistAlbumSongs();
			self.XBMC.getMusicSong(t["[id]"], t["[artist]"], t["[albumtitle]"], t["[fanart]"], self.joinArtistAlbumSongs);
		});
	};
	
	// Displays a list of Songs when Recent Album item is selected
	self.selectRecentAlbum = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.subpageRecentAlbumSongs();
			self.XBMC.getMusicSong(t["[id]"], t["[artist]"], t["[albumtitle]"], t["[fanart]"], self.joinRecentAlbumSongs);
		});
	};
	
	// Displays details of the Songs and automatically plays the Song when Song item is selected on the Song Page
	self.selectMusicSong = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinMusicDetails, 1);			// Show Song Details subpage
			
			self.XBMC.getMusicDetails(t["[id]"],t["[file]"], self.joinMusicDetails);
			self.XBMC.playSong(t["file"]);						// Plays the song
			 setTimeout(function(){self.XBMC.addAudioPlaylist(t["file"]);}, 250); 				//Adds the song into playlist
		});
	};
	
	// Displays details of the Songs and automatically adds the item to the Audio Playlist when Song item is selected
	self.addSongPlaylist = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinMusicDetails, 1);			// Show Song Details subpage
			
			self.XBMC.getMusicDetails(t["[id]"],t["[file]"], self.joinMusicDetails);
			setTimeout(function(){self.XBMC.addAudioPlaylist(t["file"]);}, 250); 				//Adds the song into playlist by pessing the "Playlist" icon.
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
			self.subpageAlbumSongs();
			self.XBMC.getMusicSong(t["[id]"], t["[artist]"], t["[albumtitle]"], t["[fanart]"], self.joinAlbumSongs);
		});
	};
	
	// Displays details of the Songs and automatically plays the Song when Song item is selected on the Song Page
	self.selectAlbumSong = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.setJoin("d"+self.joinMusicDetails, 1);			// Show Song Details subpage
			
			self.XBMC.getMusicDetails(t["[id]"],t["[file]"], self.joinMusicDetails);
			self.XBMC.playSong(t["file"]);						// Plays the song
			setTimeout(function(){self.XBMC.addAudioPlaylist(t["file"]);}, 250); 				//Adds the song into playlist
		});
	};
	
	// ************************	All Songs -> Song Details ***********************************************************************
	
	
	// ************************	This is for Main Page : Recent Albums -> Songs **************************************************
	
	// Displays a list of Songs when Album item is selected
	self.selectRecentAlbumMainPage = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			
			CF.setJoin("d"+self.joinRecentAlbumsMain, 0);		// Show Recent Albums list on the Main Page
			CF.setJoin("d"+self.joinRecentAlbumSongsMain, 1);		// Hide Recent Songs list on the Main Page
			
			// Get Music Song list
			self.XBMC.getMusicSong(t["[id]"], t["[artist]"], t["[albumtitle]"], "", self.joinRecentAlbumSongsMain);
			
		});
	};
	
	// Displays details of the Songs and automatically plays the Song when Song item is selected on the Main Page
	self.selectMusicSongMainPage = function(list, listIndex, join) {
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.XBMC.getMusicDetails(t["[id]"],t["[file]"], self.joinMusicDetails);
			self.XBMC.playSong(t["file"]);						// Plays the song
			setTimeout(function(){self.XBMC.addAudioPlaylist(t["file"]);}, 250); 				//Adds the song into playlist
		});
	};
	
	// This is Album <-> Songs subpage flipping on the Main Menu page.
	self.showRecentAlbums = function() {
		CF.setJoin("d"+self.joinRecentAlbumsMain, 1);		// Show Recent Albums list on the Main Page
		CF.setJoin("d"+self.joinRecentAlbumSongsMain, 0);		// Hide Recent Songs list on the Main Page
	};
	
	// ************************	Sorting & Searching ****************************************************************************
	
	// Sorting options is only available for Artists.
	self.sortArtist = function(order, method) {
		self.subpageAllArtists();
		self.XBMC.getMusicArtist(self.joinAllArtists, order, method);
	};
	
	// Sorting options is only available for Artists.
	self.sortAlbum = function(order, method) {
		self.subpageAllAlbums();
		self.XBMC.getAllAlbums(self.joinAllAlbums, order, method);
	};
	
	// Sorting options is only available for Artists.
	self.sortSong = function(order, method) {
		self.subpageAllSongs();
		self.XBMC.getAllSongs(self.joinAllSongs, order, method);
	};
	
	// Searching options is available for Artist (by Artist name only)
	self.ArtistSearch = function(search_string) {
		self.subpageAllArtists();
		self.XBMC.searchArtist(search_string, self.joinAllArtists);
	};
	
	// Searching options is available for Artist (by Artist name only)
	self.AlbumSearch = function(search_string) {
		self.subpageAllAlbums();
		self.XBMC.searchAlbum(search_string, self.joinAllAlbums);
	};
	
	// Searching options is available for Artist (by Artist name only)
	self.SongSearch = function(search_string) {
		self.subpageAllSongs();
		self.XBMC.searchSong(search_string, self.joinAllSongs);
	};
	
	// Alphabar Search options is available for Artist, Albums and Songs 
	self.alphasrchArtists = function(sliderval) {					// data passed is assigned as string_search
		self.subpageAllArtists();
		self.XBMC.alphabarArtists(sliderval, self.joinAllArtists);
	};
	
	self.alphasrchAlbums = function(sliderval) {					// data passed is assigned as string_search
		self.subpageAllAlbums();
		self.XBMC.alphabarAlbums(sliderval, self.joinAllAlbums);
	};
	
	self.alphasrchSongs = function(sliderval) {					// data passed is assigned as string_search
		self.subpageAllSongs();
		self.XBMC.alphabarSongs(sliderval, self.joinAllSongs);
	};
	
	// ************************	Flipping between subpages ****************************************************************************
	
	self.subpageAllArtists = function() {
		CF.setJoins([
				{ join:"d"+self.joinAllArtists, value:1 },   				// Show All Artists subpage
				{ join:"d"+self.joinArtistAlbums, value:0 },       			// Hide All Artists -> Albums subpage        
				{ join:"d"+self.joinArtistAlbumSongs, value:0 },            // Hide All Artists -> Albums -> Songs subpage   
				{ join:"d"+self.joinRecentAlbums, value:0 },      			// Hide Recent Album subpage
				{ join:"d"+self.joinRecentAlbumSongs, value:0 },   			// Hide Recent Album -> Songs subpage
				{ join:"d"+self.joinRecentSongs, value:0 },       			// Hide Recent Song subpage        
				{ join:"d"+self.joinMusicDetails, value:0 },            	// Hide Song Details subpage   
				{ join:"d"+self.joinAllAlbums, value:0 },      				// Hide All Albums subpage       				
				{ join:"d"+self.joinAlbumSongs, value:0 },   				// Hide All Albums -> Songs subpage
				{ join:"d"+self.joinAllSongs, value:0 }	       				// Hide All Songs subpage        
		]);
	};
	
	self.subpageArtistAlbums = function() {
		CF.setJoins([
				{ join:"d"+self.joinAllArtists, value:0 },   				// Hide All Artists subpage
				{ join:"d"+self.joinArtistAlbums, value:1 },       			// Show All Artists -> Albums subpage        
				{ join:"d"+self.joinArtistAlbumSongs, value:0 },            // Hide All Artists -> Albums -> Songs subpage   
				{ join:"d"+self.joinRecentAlbums, value:0 },      			// Hide Recent Album subpage
				{ join:"d"+self.joinRecentAlbumSongs, value:0 },   			// Hide Recent Album -> Songs subpage
				{ join:"d"+self.joinRecentSongs, value:0 },       			// Hide Recent Song subpage        
				{ join:"d"+self.joinMusicDetails, value:0 },            	// Hide Song Details subpage   
				{ join:"d"+self.joinAllAlbums, value:0 },      				// Hide All Albums subpage       				
				{ join:"d"+self.joinAlbumSongs, value:0 },   				// Hide All Albums -> Songs subpage
				{ join:"d"+self.joinAllSongs, value:0 }	       				// Hide All Songs subpage        
		]);
	};
	
	self.subpageArtistAlbumSongs = function() {
		CF.setJoins([
				{ join:"d"+self.joinAllArtists, value:0 },   				// Hide All Artists subpage
				{ join:"d"+self.joinArtistAlbums, value:0 },       			// Hide All Artists -> Albums subpage        
				{ join:"d"+self.joinArtistAlbumSongs, value:1 },            // Show All Artists -> Albums -> Songs subpage   
				{ join:"d"+self.joinRecentAlbums, value:0 },      			// Hide Recent Album subpage
				{ join:"d"+self.joinRecentAlbumSongs, value:0 },   			// Hide Recent Album -> Songs subpage
				{ join:"d"+self.joinRecentSongs, value:0 },       			// Hide Recent Song subpage        
				{ join:"d"+self.joinMusicDetails, value:0 },            	// Hide Song Details subpage   
				{ join:"d"+self.joinAllAlbums, value:0 },      				// Hide All Albums subpage       				
				{ join:"d"+self.joinAlbumSongs, value:0 },   				// Hide All Albums -> Songs subpage
				{ join:"d"+self.joinAllSongs, value:0 }	       				// Hide All Songs subpage        
		]);
	};
	
	self.subpageRecentAlbums = function(){
		CF.setJoins([
				{ join:"d"+self.joinAllArtists, value:0 },   				// Hide All Artists subpage
				{ join:"d"+self.joinArtistAlbums, value:0 },       			// Hide All Artists -> Albums subpage        
				{ join:"d"+self.joinArtistAlbumSongs, value:0 },            // Hide All Artists -> Albums -> Songs subpage   
				{ join:"d"+self.joinRecentAlbums, value:1 },      			// Show Recent Album subpage
				{ join:"d"+self.joinRecentAlbumSongs, value:0 },   			// Hide Recent Album -> Songs subpage
				{ join:"d"+self.joinRecentSongs, value:0 },       			// Hide Recent Song subpage        
				{ join:"d"+self.joinMusicDetails, value:0 },            	// Hide Song Details subpage   
				{ join:"d"+self.joinAllAlbums, value:0 },      				// Hide All Albums subpage       				
				{ join:"d"+self.joinAlbumSongs, value:0 },   				// Hide All Albums -> Songs subpage
				{ join:"d"+self.joinAllSongs, value:0 }	       				// Hide All Songs subpage        
		]);
	};
	
	self.subpageRecentAlbumSongs = function(){
		CF.setJoins([
				{ join:"d"+self.joinAllArtists, value:0 },   				// Hide All Artists subpage
				{ join:"d"+self.joinArtistAlbums, value:0 },       			// Hide All Artists -> Albums subpage        
				{ join:"d"+self.joinArtistAlbumSongs, value:0 },            // Hide All Artists -> Albums -> Songs subpage   
				{ join:"d"+self.joinRecentAlbums, value:0 },      			// Hide Recent Album subpage
				{ join:"d"+self.joinRecentAlbumSongs, value:1 },   			// Show Recent Album -> Songs subpage
				{ join:"d"+self.joinRecentSongs, value:0 },       			// Hide Recent Song subpage        
				{ join:"d"+self.joinMusicDetails, value:0 },            	// Hide Song Details subpage   
				{ join:"d"+self.joinAllAlbums, value:0 },      				// Hide All Albums subpage       				
				{ join:"d"+self.joinAlbumSongs, value:0 },   				// Hide All Albums -> Songs subpage
				{ join:"d"+self.joinAllSongs, value:0 }	       				// Hide All Songs subpage        
		]);
	};
	
	self.subpageRecentSongs = function(){
		CF.setJoins([
				{ join:"d"+self.joinAllArtists, value:0 },   				// Hide All Artists subpage
				{ join:"d"+self.joinArtistAlbums, value:0 },       			// Hide All Artists -> Albums subpage        
				{ join:"d"+self.joinArtistAlbumSongs, value:0 },            // Hide All Artists -> Albums -> Songs subpage   
				{ join:"d"+self.joinRecentAlbums, value:0 },      			// Hide Recent Album subpage
				{ join:"d"+self.joinRecentAlbumSongs, value:0 },   			// Hide Recent Album -> Songs subpage
				{ join:"d"+self.joinRecentSongs, value:1 },       			// Show Recent Song subpage        
				{ join:"d"+self.joinMusicDetails, value:0 },            	// Hide Song Details subpage   
				{ join:"d"+self.joinAllAlbums, value:0 },      				// Hide All Albums subpage       				
				{ join:"d"+self.joinAlbumSongs, value:0 },   				// Hide All Albums -> Songs subpage
				{ join:"d"+self.joinAllSongs, value:0 }	       				// Hide All Songs subpage        
		]);
	};
	
	self.subpageAllAlbums = function() {
		CF.setJoins([
				{ join:"d"+self.joinAllArtists, value:0 },   				// Hide All Artists subpage
				{ join:"d"+self.joinArtistAlbums, value:0 },       			// Hide All Artists -> Albums subpage        
				{ join:"d"+self.joinArtistAlbumSongs, value:0 },            // Hide All Artists -> Albums -> Songs subpage   
				{ join:"d"+self.joinRecentAlbums, value:0 },      			// Hide Recent Album subpage
				{ join:"d"+self.joinRecentAlbumSongs, value:0 },   			// Hide Recent Album -> Songs subpage
				{ join:"d"+self.joinRecentSongs, value:0 },       			// Hide Recent Song subpage        
				{ join:"d"+self.joinMusicDetails, value:0 },            	// Hide Song Details subpage   
				{ join:"d"+self.joinAllAlbums, value:1 },      				// Show All Albums subpage       				
				{ join:"d"+self.joinAlbumSongs, value:0 },   				// Hide All Albums -> Songs subpage
				{ join:"d"+self.joinAllSongs, value:0 }	       				// Hide All Songs subpage        
		]);
	};
	
	self.subpageAlbumSongs = function() {
	CF.setJoins([
				{ join:"d"+self.joinAllArtists, value:0 },   				// Hide All Artists subpage
				{ join:"d"+self.joinArtistAlbums, value:0 },       			// Hide All Artists -> Albums subpage        
				{ join:"d"+self.joinArtistAlbumSongs, value:0 },            // Hide All Artists -> Albums -> Songs subpage   
				{ join:"d"+self.joinRecentAlbums, value:0 },      			// Hide Recent Album subpage
				{ join:"d"+self.joinRecentAlbumSongs, value:0 },   			// Hide Recent Album -> Songs subpage
				{ join:"d"+self.joinRecentSongs, value:0 },       			// Hide Recent Song subpage        
				{ join:"d"+self.joinMusicDetails, value:0 },            	// Hide Song Details subpage   
				{ join:"d"+self.joinAllAlbums, value:0 },      				// Hide All Albums subpage       				
				{ join:"d"+self.joinAlbumSongs, value:1 },   				// Show All Albums -> Songs subpage
				{ join:"d"+self.joinAllSongs, value:0 }	       				// Hide All Songs subpage        
		]);
	};
	
	self.subpageAllSongs = function() {
		CF.setJoins([
				{ join:"d"+self.joinAllArtists, value:0 },   				// Hide All Artists subpage
				{ join:"d"+self.joinArtistAlbums, value:0 },       			// Hide All Artists -> Albums subpage        
				{ join:"d"+self.joinArtistAlbumSongs, value:0 },            // Hide All Artists -> Albums -> Songs subpage   
				{ join:"d"+self.joinRecentAlbums, value:0 },      			// Hide Recent Album subpage
				{ join:"d"+self.joinRecentAlbumSongs, value:0 },   			// Hide Recent Album -> Songs subpage
				{ join:"d"+self.joinRecentSongs, value:0 },       			// Hide Recent Song subpage        
				{ join:"d"+self.joinMusicDetails, value:0 },            	// Hide Song Details subpage   
				{ join:"d"+self.joinAllAlbums, value:0 },      				// Hide All Albums subpage       				
				{ join:"d"+self.joinAlbumSongs, value:0 },   				// Hide All Albums -> Songs subpage
				{ join:"d"+self.joinAllSongs, value:1 }	       				// Show All Songs subpage        
		]);
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
	
	self.deleteVideoPlaylistItem = function(list, listIndex, join) {			// Plays the file in Video playlist
		CF.getJoin("l4401"+":"+listIndex+":"+join, function(j,v,t) {
			CF.listRemove("l4401", listIndex, 1);
			self.XBMC.deleteVideoItem(listIndex);
			self.getPlaylistVideo();
		});
	};
	
	self.deleteAudioPlaylistItem = function(list, listIndex, join) {			// Plays the file in Video playlist
		CF.getJoin("l4401"+":"+listIndex+":"+join, function(j,v,t) {
			CF.listRemove("l4401", listIndex, 1);
			self.XBMC.deleteAudioItem(listIndex);
			self.getPlaylistAudio();
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
	
	self.getSources = function(media) {										// Get list of sources for Video
		self.XBMC.getDirectory(self.joinFileList, media);	
	};
	
	self.selectDirectory = function(list, listIndex, join) {			// Get list of directory for sources for Video
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.XBMC.getSubDirectory(t["[file]"], self.joinFileList);
		});
	};
	
	self.playDirectoryFile = function(list, listIndex, join) {				// Play the list of files from the directory by pressing down for more than 1s.
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.XBMC.playFile(t["[file]"]);
		});
	};
		
	//================================================================================================================================
	/* ALL STARTUP COMMANDS																														*/
	//================================================================================================================================
	
	//self.playStatusGet = function() {											// Get the current state of muting for volume
		//self.XBMC.playPause(self.playStatus);
	//};
	
	//================================================================================================================================
	/* VOLUME CONTROL COMMANDS																														*/
	//================================================================================================================================
	
	self.volGet = function() {											// Get the current state of muting for volume
		self.XBMC.volGet(self.setMuteState);
	};

	self.volMute = function() {											// Mutes the volume
		self.XBMC.volMute(self.setMuteState);
	};

	self.setMuteState = function() {									// Sets the feedback of the volume.
		if(self.XBMC.currentMute == true) {								// this means volume level = 0, means muted state
			CF.setJoin("d"+self.joinVolMute, 1);
			CF.setJoin("a4007", 0);
		}else{
			CF.setJoin("d"+self.joinVolMute, 0);
			self.XBMC.volGet(self.XBMC.logReplyData);  // just get the volume level, don't need callback function
		}
	};
	
	//================================================================================================================================
	/* XBMC INSTANCES COMMANDS																														*/
	//================================================================================================================================
	
	self.removeInstance = function(list, listIndex, join) {			// Remove instance from list by index
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			CF.listRemove("l25", listIndex, 1);
			CF.getJoins(["s4480", "s4481", "s4482", "s4483", "s4484"], function(joins) {
				self.XBMC.removeSelectedInstance(joins.s4480.value);
			});
		});
	};
	
	self.displayInstance = function(list, listIndex, join) {			// Edit the settings of the selected instance 
		CF.getJoin(list+":"+listIndex+":"+join, function(j,v,t) {
			self.menuMainDetails();
			self.XBMC.displayInstanceSettings(t["[instSystem]"], t["[instUsername]"], t["[instPassword]"], t["[instURL]"], t["[instPort]"], t["[type]"], listIndex);
		});
	};
	
	self.updateInstance = function() {			// Edit the settings of the selected instance 
		//CF.getJoin("d66", function(j,v,t) {
			//self.XBMC.updateCurrentInstance(t["[currentSystem]"]);
		//});
		self.XBMC.updateCurrentInstance();
	};
	
	// Select new instance to connect - get the values of all the IP Settings, switch and connect to the new system.
	self.setIPSettings = function() {						
		CF.getJoins(["s4480", "s4481", "s4482", "s4483", "s4484"], function(joins) {
			
			// s4480 = System Name, s4481 = Host Name / IP Add, s4482 = port, s4483 = username, s4484 = password
			self.XBMC.sysname = joins.s4480.value;
			self.XBMC.url = joins.s4481.value;
			self.XBMC.port = joins.s4482.value;
			self.XBMC.username = joins.s4483.value;
			self.XBMC.password = joins.s4484.value;
			
			// Label the starting instance
			CF.setJoin("s4488", joins.s4480.value);
			
			// Set global tokens to remember last selected instances if app is minimised or exit. 
			CF.setToken(CF.GlobalTokensJoin, "[inputSystem]", joins.s4480.value);
			CF.setToken(CF.GlobalTokensJoin, "[inputURL]", joins.s4481.value);
			CF.setToken(CF.GlobalTokensJoin, "[inputPort]", joins.s4482.value);
			CF.setToken(CF.GlobalTokensJoin, "[inputUsername]", joins.s4483.value);
			CF.setToken(CF.GlobalTokensJoin, "[inputPassword]", joins.s4484.value);
			
			// Run the setup
			self.setup();
		});
	};
	
	self.XBMC = new XBMC_Controller(params);

	return self;
}

//================================================================================================================================
// Main Startup Function goes here
//================================================================================================================================

var XBMCMacMini;
var XBMCInstance;
var newSysName;
var newURL;
var newPort;
var newUsername;
var newPassword;
var GUI = {};

CF.userMain = function() {
	
	// On startup, check for global tokens via CF.getJoin(CF.GlobalTokensJoin) and get the values for all the paramaters. Default values for tokens are set via Global Token Manager.
	CF.getJoin(CF.GlobalTokensJoin, function(join, values, tokens) {
	
		//Read the tokens, if accidentally deleted the settings of the tokens then use default values
		var newSysName = tokens["[inputSystem]"] || "XBMC Global Token";
		var newURL = tokens["[inputURL]"] || "192.168.168.201";
		var newPort = tokens["[inputPort]"] || "8080";
		var newUsername = tokens["[inputUsername]"];
		var newPassword = tokens["[inputPassword]"];
		
		CF.setJoin("s4488", newSysName);
		
		//Assign system settings i.e. XBMCMacMini = new XBMC_GUI({username: "xbmc", password: "xbmc", url: "192.168.0.100", port: 8080}); 
		XBMCMacMini = new XBMC_GUI({sysname: newSysName, username: newUsername, password: newPassword, url: newURL, port: newPort});
		//XBMCInstance = new XBMC_GUI({sysname: newSysName, username: newUsername, password: newPassword, url: newURL, port: newPort});
		
		// Run the setup
		XBMCMacMini.setup();
		//XBMCInstance.setup();
	
	});
};