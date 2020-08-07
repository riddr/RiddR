/*
 * Backdrop
 *
 * RiddR main background controll module 
 * ( Wondering why backdrop ? It seemd cool and I wanted to avoid confusion with Chrome's background logic ) 
 *
 * @package		RiddR
 * @category	background 
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR/blob/master/js/modules/backdrop.js
*/

(function () 
{
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Backdrop public accessible methods 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	this.backdrop = 
	{
		// reload RiddR core 
		reload : function()
		{
			location.reload();
		},

		// reload whole extension
		restart : function()
		{
			chrome.runtime.restart();
		}
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * BACKDROP PRIVATE METHODS
 *
 * Set offline TTS engine
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _set_offline_TTS_engine = function ()
	{
		// avoid gener discrimination :) 
		gender = ['male','female'][ Math.floor(Math.random()*2) ];

		// go trough all avaliable TTS engines
		for ( engine in RiddR.TTS.engines )
		{
			if( RiddR.TTS.engines[engine].remote != undefined && !RiddR.TTS.engines[engine].remote )
			{
				// get first found TTS engine or overrite it if some local TTS is avaliable 
				offlineTTS = ( RiddR.TTS.engines[engine].lang == RiddR.locale ? engine : engine );

				// find personalized TTS engine 
				if( RiddR.TTS.engines[engine].lang == RiddR.locale &&  RiddR.TTS.engines[engine].gender == gender )
				{
					offlineTTS = engine;
					break;
				}

			}
		}

		// set RiddR offline TTS engine
		RiddR.storage.set( {'offline_engine': offlineTTS } );
	}

	// get and set platform info
	var _set_platform_info = function ()
	{
		chrome.runtime.getPlatformInfo( ( info ) =>
		{
			RiddR.storage.set( {'platform': info } );
		});
	}

	// register RiddR context menu
	var _register_context_menu = function ()
	{
		chrome.contextMenus.create
		({
			id : 'RiddR',
			title: 'Read the selection!',
			contexts: [ 'selection' ]
		});
	}

	// inject content script on new tab creation if allowed from the user
	var _inject_content_script = async function ( tabID, RESULT )
	{
		if( RESULT.status == 'complete' && Object.keys(RiddR.defaults.shortcuts).length > 0 )
		{
			chrome.tabs.executeScript(
			{
				code: 'window["RiddR"]'

			}, function ( result ) 
			{
				if( result != undefined && chrome.runtime.lastError == undefined && result.includes( null ))
				{
					RiddR.injectScript( [ 'js/content.js', 'js/modules/io.js', 'css/content.css' ] ).then ( () =>
					{
 						// initialize content script 
						chrome.tabs.executeScript ( { code: "RiddR.init()", allFrames: true } )
					})
				}
			});
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * BACKGROUND EVENT HANDLER METHODS 
 *
 * Dispatch events uppon new installations, updates and chrome updates, startup
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _event_dispatcher = function ( details )
	{
		// register RiddR's context menu
		_register_context_menu();

		RiddR.dispatch( new Event(details.reason) );
	}

	// Handle RiddR default keyboard shortcuts and media session commands
	var _state_handler = function ( command )
	{
		// validate command 
		command = ( typeof command == 'object' && 'action' in command ) ? command.action : command;

		RiddR[command](); // send pause / stop action
	}

	// alias handler for initial startup of the extension 
	var _startup_handler = function ()
	{
		_event_dispatcher( {'reason' : 'startup'} );
	}

	// handle context menu user actions
	var _context_handler = function ( data )
	{
		RiddR.read( { utterance: data.selectionText, options: {} } );
	}

	// Update network connectivity status
	var _connectivity = function( event )
	{
		RiddR.is_online = ( event.type == 'online') ? true : false;
	}

	// handle new installations
	var _on_install = function()
	{
		// set offline TTS engine
		_set_offline_TTS_engine();

		// get platform info ( like OS, architecture etc. )
		_set_platform_info()
	}

	// handle post extension update
	var _on_update = function()
	{
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Chrome API's and event listeners registration
 *
 * Catch RiddR's default commands
 * ---------------------------------------------------------------------------------------------------------------------
*/ 
	chrome.commands.onCommand.addListener( _state_handler );

	// register RiddR context menu event listener
	chrome.contextMenus.onClicked.addListener( _context_handler );

	// handle first startups  
	chrome.runtime.onStartup.addListener( _startup_handler );

	// handle new installations, updates and chrome updates 
	chrome.runtime.onInstalled.addListener( _event_dispatcher );

	// register uninstall URL, used for surveys etc.. 
	chrome.runtime.setUninstallURL( 'https://riddr.com/:(' );

	// inject RiddR content script
	chrome.tabs.onUpdated.addListener( _inject_content_script );

	// handle connectivity status
	window.addEventListener('online',  _connectivity);
	window.addEventListener('offline', _connectivity);

	// register media session event listeners and handlers
	if ('mediaSession' in navigator) 
	{
		navigator.mediaSession.setActionHandler( 'play', 	_state_handler );
		navigator.mediaSession.setActionHandler( 'pause', 	_state_handler );
		navigator.mediaSession.setActionHandler( 'stop', 	_state_handler );
	}

	// define RiddR event listeners and handlers
	RiddR.on('install', _on_install );
	RiddR.on('update', _on_update );

}).apply(RiddR);