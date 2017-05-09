/*
 * RiddR
 *
 * RiddR's main text to speech synthesizer  
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

(function () 
{


/*
 * ---------------------------------------------------------------------------------------------------------------------
 * RiddR main reading method 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.read = function ( utterance, handler )
	{

		// don't forget chrome's max utterace length predefined from Chrome

		// update RiddR global state 
		_trigger({state:'reading'});
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Pauses speech synthesis if it was reading
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.pause = function ()
	{
		chrome.tts.pause();

		// update RiddR global state 
		_trigger({state:'paused'});
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Resume speaking if the reading was paused 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.resume = function ()
	{
		chrome.tts.resume();

		// update RiddR global state 
		_trigger({state:'reading'});
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Stop any current reading and flush the queue of any pending utterances  
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.stop = function ()
	{
		chrome.tts.stop();

		// update RiddR global state 
		_trigger({state:'end'});
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Check if RiddR is currently reading something 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.is_reading = function ( callback )
	{
		chrome.tts.isSpeaking ( callback ); 
	}


/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PRIVATE METHODS
 *
 * Trigger onStateUpdate event trough all RiddR pages
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _trigger = function ( state )
	{
		RiddR.IO.trigger( 'onStateUpdate', state );
	}

}).apply(RiddR);