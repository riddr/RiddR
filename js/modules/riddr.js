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
		_TTS_state = 'end',
		_max_length = 32768; // define maximum utterance length https://developer.chrome.com/apps/tts#method-speak

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * RiddR SYNTHESIZER CONTROL METHODS 
 *
 * main read method 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.read = function ( utterance, callback  = null )
	{
		// determine the selected TTS engine based on client connection state 
		engine_name =  ( RiddR.is_online ) ? RiddR.storage.get('TTS_engine') : RiddR.storage.get('offline_engine');

		// get the parameters of the selected TTS engine
		_engine = RiddR.validate_TTS(engine_name);

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

		// temporary fix for Chrome pause bug // @To-Do: file bug to Google regards this
		if(_TTS_state == 'pause' )
			RiddR.stop();

		// determine utterance language
		RiddR.detect_lang( utterance, function ( lang )
		{
			//prepare utterance for reading
			_prepare_utterance( utterance, lang, function ( utterance ) 
			{
				// update language if needed
				options.lang = lang.read;

				// To-Do: determine action
				chrome.tts.speak
				( 
					utterance,
					options
				);
			});

			// send loading event to the callback for remote TTS engines
			if( _engine.remote && _TTS_state != 'start' && _TTS_state != 'enqueued' )
			{
				_TTS_handler( { type : 'loading' }, callback );
			}
			else if( RiddR.storage.get('enqueue') ) // send event that new utterance was added into the queue
				_TTS_handler( { type : 'enqueued' }, callback );

		}, options.lang );
	}

	// Pauses speech synthesis if it was reading
	this.pause = function ( callback )
	{
		_media_control( 'pause', callback );
	}

	// Resume speaking if the reading was paused 
	this.resume = function ( callback )
	{
		_media_control( 'resume', callback );
	}

	// Stop any current reading and flush the queue of any pending utterances  
	this.stop = function ()
	{
		chrome.tts.stop();
	}

	// Check if RiddR is currently reading something 
	this.is_reading = function ( callback )
	{
		chrome.tts.isSpeaking ( callback ); 
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PRIVATE TTS HANDLING & MEDIA CONTROL METHODS
 *
 * Validate options parameter
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _validate_parameter = function ( current_value, parameters )
	{
		if( parameters && current_value > parameters.max )
			return parameters.default;

		if ( parameters && current_value < parameters.min )
			return parameters.default;

		return  current_value;
	}

	// Trigger onStateUpdate event trough all RiddR pages
	var _trigger = function ( state )
	{
		RiddR.IO.trigger( 'onTTSupdate', state );
	}

	// handle TTS events and errors 
	var _TTS_handler = function ( event, callback )
	{
		// trigger TTS update event if no callback is provided
		if( event && !callback )
			_trigger( event );

		// execute callback 
		if( callback && event )
			callback(event);

		// update local reading state 
		if(event.type != 'word' && event.type != 'sentence' && event.type != 'marker' )
			_TTS_state = event.type;

		// @To-Do: implement better error handling 
		if (chrome.runtime.lastError) 
			RiddR.log( chrome.runtime.lastError.message, 'error' );
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

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PRIVATE UTTERANCE FORMING METHODS 
 *
 * form utterance, check it's length, language, transliterate it & translate it
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _prepare_utterance = function ( utterance, language, callback )
	{
		// transcribe the utterance 
		utterance = _transcribe ( utterance );

		// translate utterance if auto translate feature is enabled
		if( RiddR.storage.get('translate') && language.input != 'auto' &&  language.read.substr(0,2) != language.detected ) 
			RiddR.translate( utterance, language.detected, language.requested,  callback );
		else
			callback(utterance);
	}

	// transcribe userdefined words for better pronouncing 
	var _transcribe = function ( utterance )
	{
		for( key in RiddR.defaults.transcription )
			utterance = utterance.replace( RegExp(key,'ig'), RiddR.defaults.transcription[key]);

		return utterance;
	}

}).apply(RiddR);