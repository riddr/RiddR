/*
 * RiddR
 *
 * RiddR's main text to speech synthesizer module
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
 * Define private variables
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _engine,
		_max_length = 32768; // define maximum utterance length https://developer.chrome.com/apps/tts#method-speak

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * RiddR main reading method // don't forget chrome's max utterace length predefined from Chrome
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.read = function ( utterance, callback  = null )
	{
		// determine the selected TTS engine based on client connection state 
		engine_name =  ( RiddR.is_online ) ? RiddR.storage.get('TTS_engine') : RiddR.storage.get('offline_engine');

		// get the parameters of the selected TTS engine
		_engine = RiddR.validate_TTS(engine_name);

		//prepare utterance for reading
		utterance = _prepare_utterance( utterance );

		// set test options object
		options = 
		{
			voiceName 	: _engine.voiceName,
			enqueue 	: RiddR.storage.get('enqueue'),
			lang 		: RiddR.storage.get('language'),
			volume 		: RiddR.storage.get('volume'),
			rate 		: _validate_parameter ( RiddR.storage.get('rate'),  _engine.rate),
			pitch 		: _validate_parameter ( RiddR.storage.get('pitch'), _engine.pitch),
		}

		// attach event capturing callback if needed
		if( callback !== null )
			options.onEvent = function ( event ){ _TTS_handler( event, callback ) };

		// determine utterance language
		RiddR._lang( utterance, function ( lang )
		{
			// update language if needed
			options.lang = lang;

			// To-Do: determine action
			chrome.tts.speak
			( 
				utterance,
				options
			);

			// send loading event to the callback for remote TTS engines
			if( engine.remote )
				_TTS_handler( { type : 'loading' }, callback );
				
		}, options.lang );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Pauses speech synthesis if it was reading
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.pause = function ( callback )
	{
		_media_control( 'pause', callback );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Resume speaking if the reading was paused 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.resume = function ( callback )
	{
		_media_control( 'resume', callback );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Stop any current reading and flush the queue of any pending utterances  
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.stop = function ()
	{
		chrome.tts.stop();
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

	// handle TTS events and errors 
	var _TTS_handler = function ( event, callback )
	{
		if( callback )
			callback(event);

		if (chrome.runtime.lastError) 
			RiddR.log( chrome.runtime.lastError.message, 'error' );
	}

	// form utterance, check it's length, language, transliteration & translation
	var _prepare_utterance = function ( utterance )
	{
		// transcription 
		utterance = _transcribe ( utterance );

		return utterance;
	}

	// 
	var _transcribe = function ( utterance )
	{
		for( key in RiddR.defaults.transcription )
			utterance = utterance.replace( RegExp(key,'ig'), RiddR.defaults.transcription[key]);

		return utterance;
	}

	// validate options parameter 
	var _validate_parameter = function ( current_value, parameters )
	{
		if( parameters && current_value > parameters.max )
			return parameters.default;

		if ( parameters && current_value < parameters.min )
			return parameters.default;

		return  current_value;
	}

	// media controll for sending failback pause / resume events 
	var _media_control = function ( action, callback )
	{
		RiddR.is_reading( function( reading ) // check if TTS engine is reading
		{
			if ( reading )
			{
				chrome.tts[action]();

				// failback send pause event @To-Do: file a bug regards unsuported events ( pause, resume ) in ttsEngines
				if( _engine && _engine.eventTypes.indexOf(action) == -1 )
					_TTS_handler( { type : action }, callback );
				else if ( callback ) // avoid empty calls 
					callback();
			}
		});
	}


}).apply(RiddR);