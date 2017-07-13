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
		RiddR[command]();
	}

	// handle RiddR TTS state updates
	var _TTS_handler = function ( state )
	{
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Chrome API's and event listeners registration
 *
 * Catch RiddR's default commands
 * ---------------------------------------------------------------------------------------------------------------------
*/ 
	chrome.commands.onCommand.addListener( _com_handler );

	// handle TTS state update
	window.addEventListener('onTTSupdate', function( event )
	{
		_TTS_handler( event.detail );
	});

}).apply(RiddR);