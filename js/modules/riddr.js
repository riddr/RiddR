/*
 * RiddR
 *
 * RiddR's main text to speech synthesizer module
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR/blob/master/js/modules/riddr.js
*/

(function () 
{
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Define private variables
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _engine,
		_idle_TTL = null,
		_TTS_state = 'idle',
		_max_length = 32768, // define maximum utterance length https://developer.chrome.com/apps/tts#method-speak
		_last_request = '';

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * RiddR SYNTHESIZER CONTROL METHODS 
 *
 * main read method 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.read = function ( data )
	{
		// determine the selected TTS engine based on client connection state 
		engine_name =  ( RiddR.is_online ) ? 
			data.options.TTS_engine || RiddR.storage.get('TTS_engine') :
			RiddR.storage.get('offline_engine');

		// get the parameters of the selected TTS engine
		_engine = RiddR.validate_TTS(engine_name);

		// set test options object
		options = 
		{
			voiceName 	: _engine.voiceName,
			enqueue 	: data.options.enqueue 						|| RiddR.storage.get('enqueue'),
			lang 		: data.options.language 					|| RiddR.storage.get('language'),
			volume 		: data.options.volume 						|| RiddR.storage.get('volume'),
			rate 		: _validate_parameter ( data.options.rate 	|| RiddR.storage.get('rate'),  _engine.rate),
			pitch 		: _validate_parameter ( data.options.pitch 	|| RiddR.storage.get('pitch'), _engine.pitch),
		}

		// attach event capturing callback if needed
		options.onEvent = ( data.callback )? function ( event ){ _TTS_handler( event, data.callback ) } : _TTS_handler;

		// temporary fix for Chrome pause bug in native TTS engines // @To-Do: file bug to Google regards this
		if( _TTS_state == 'pause' || _TTS_state == 'cancelled' )
			RiddR.stop();

		// determine utterance language
		RiddR.detect_lang( data.utterance, function ( lang )
		{
			//prepare utterance for reading
			_prepare_utterance( data.utterance, lang, function ( utterance ) 
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
				_TTS_handler( { type : 'loading' }, data.callback );
			}
			else if( RiddR.storage.get('enqueue') ) // send event that new utterance was added into the queue
				_TTS_handler( { type : 'enqueued' }, data.callback );

		}, options.lang );

		// log last reading request
		_last_request = data;
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

	// replay last readed utterance @To-Do: implement "replay on last request" not just the last utterance
	this.replay = function ()
	{
		RiddR.read( _last_request );
	}

	// Check if RiddR is currently reading something 
	this.is_reading = function ( callback )
	{
		chrome.tts.isSpeaking ( callback ); 
	}

	// return current reading state
	this.state = function ()
	{
		return _TTS_state;		
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
		// update local reading state by ignoring word and sentence due to chrome bug which is sending events after pause 
		if( state.type != 'word' && state.type != 'sentence' )
			_TTS_state = state.type;
		
		RiddR.IO.trigger( 'onTTSupdate', state );
	}

	// handle TTS events and errors 
	var _TTS_handler = function ( event, callback )
	{
		// trigger TTS update event if no callback is provided
		if( event )
			_trigger( event );

		// execute callback 
		if( callback && event )
			callback(event);

		// @To-Do: implement better error handling 
		if (chrome.runtime.lastError) 
			RiddR.log( chrome.runtime.lastError.message, 'error' );

		// automaticaly reset the reading state after some time of inactivity
		_reset_state( event );
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
				{
					_TTS_handler( { type : action }, callback );
				}
				else if ( callback ) // avoid empty calls 
					callback();
			}
		});
	}

	// reset reading state after some time of inactivity
	var _reset_state = function ( state )
	{
		idle_states = [ 'end', 'error', 'interrupted', 'cancelled' ];

		if( idle_states.indexOf(state.type) != -1 )
		{
			_idle_TTL = setTimeout( function ()
			{
				// avoid sending idle state after legit interuption
				if( idle_states.indexOf( _TTS_state ) != -1 ) 
				{
					_TTS_state = 'idle'; // set reading state to iddle 
					_trigger( {type : _TTS_state} );
				}

			}, 5000 );
		}
		else if( _idle_TTL )
			_idle_TTL = clearTimeout( _idle_TTL );
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
		if( RiddR.storage.get('transcribe') )
		{
			for( key in RiddR.defaults.transcription )
			{
				transcript_key = Object.keys( RiddR.defaults.transcription[key] )[0];

				utterance = utterance.replace( RegExp(transcript_key,'ig'), RiddR.defaults.transcription[key][transcript_key] );
			}
		}

		return utterance;
	}

}).apply(RiddR);