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

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Background event handler methods 
 *
 * Handle RiddR defailt shortcuts / commands 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _com_handler = function ( command )
	{
		RiddR[command](); // send pause / stop action
	}

	// handle RiddR TTS state updates
	var _TTS_handler = function ( state )
	{
	}

	// handle initial startup of the extension 
	var _startup_handler = function ()
	{
	}

	// handle new installations, updates and chrome updates 
	var _install_handler = function ( details )
	{
		// on install: register context menu
		chrome.contextMenus.create(
			{
				id : 'RiddR',
				title: 'Read the selection!',
				contexts: [ 'selection' ]
			}
		);

		// set offline TTS engine
		_set_offline_TTS_engine();
	}

	// handle context menu user actions
	var _context_handler = function ( data )
	{
		RiddR.read( { utterance: data.selectionText, options: {} } );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Chrome API's and event listeners registration
 *
 * Catch RiddR's default commands
 * ---------------------------------------------------------------------------------------------------------------------
*/ 
	chrome.commands.onCommand.addListener( _com_handler );

	// register RiddR context menu event listener
	chrome.contextMenus.onClicked.addListener( _context_handler );

	// handle first startups  
	chrome.runtime.onStartup.addListener( _startup_handler );

	// handle new installations, updates and chrome updates 
	chrome.runtime.onInstalled.addListener( _install_handler )

	// register uninstall URL, used for surveys etc.. 
	chrome.runtime.setUninstallURL( 'https://riddr.com/:(' );

	// handle TTS state update
	window.addEventListener('onTTSupdate', function( event )
	{
		_TTS_handler( event.detail );
	});

}).apply(RiddR);