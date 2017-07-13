/*
 * Backdrop
 *
 * RiddR main background controll module 
 * ( Wondering why backdrop ? It seemd cool and U wanted to avoid confusion with Chrome's background logic ) 
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

	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Backdrop private methods 
 * ---------------------------------------------------------------------------------------------------------------------
*/	


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

	// handle first startups  
	chrome.runtime.onStartup.addListener( _startup_handler );

	// handle new installations, updates and chrome updates 
	chrome.runtime.onInstalled.addListener( _install_handler )

	// register uninstall URL, used for surveys etc.. 
	chrome.runtime.setUninstallURL( 'https://riddr.com/:(' );

	// register RiddR context menu event listener
	chrome.contextMenus.onClicked.addListener( _context_handler );

	// handle TTS state update
	window.addEventListener('onTTSupdate', function( event )
	{
		_TTS_handler( event.detail );
	});

}).apply(RiddR);