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
 * RiddR main reading method // don't forget chrome's max utterace length predefined from Chrome
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.read = function ( utterance, callback )
	{
		if( !utterance ) // sent interuption to the TTS engine
			chrome.tts.stop();
		else
		{
			//prepare utterance for reading
			utterance = RiddR.prepare( utterance );

			// set test options object
			options = 
			{
				voiceName 	: RiddR.storage.get('TTS_engine'),
				enqueue 	: RiddR.storage.get('enqueue'),
				lang 		: RiddR.storage.get('language'),
				rate 		: RiddR.storage.get('rate'),
				pitch 		: RiddR.storage.get('pitch'),
				volume 		: RiddR.storage.get('volume')
			}

			// connectivity failback to offline TTS engine
			if ( !RiddR.is_online )
				options.voiceName = RiddR.storage.get('offline_engine');

			// attach event captuing callback if needed
			if( callback !== undefined )
				options.onEvent = function ( event ){ _TTS_handler( event, callback ) };

			RiddR._lang( utterance, function ( lang )
			{
				// update language if needed
				options.lang = lang;

				// start reading
				chrome.tts.isSpeaking( function ( state )
				{
					if( state && options.enqueue == false ) // interupt
						chrome.tts.stop();

					// To-Do: determine action
					chrome.tts.speak
					( 
						utterance,
						options
					);
				});
			}, options.lang );
		}

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


	var _TTS_handler = function ( event, callback )
	{
		console.log(event);

		callback(event);

		if (chrome.runtime.lastError) 
			RiddR.log( chrome.runtime.lastError.message, 'error' );
	}

}).apply(RiddR);