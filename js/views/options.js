/*
 * RiddR
 *
 * TTS Engine named RiddR build in into the same named extension, based on unofficial Google API's 
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

(function () 
{
	var UI;

	// extendd RiddR global options object 
	this.options = new Proxy
	(
		{
			TTS_engines : {}
		},
		{   // define magic method for catching all requests to the global options object
			get: function(target, property)
			{
				// deny access to "_private" properties from outside of the current scope
				if( property[0] === '_' )
					return function(){RiddR.log('Can\'t access private property','warn')};

				if(target[property] === undefined)
					return eval(property); // To-Do: find safer alternative
				else
					return target[property];
			}
		}
	);

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PUBLIC OPTIONS METHODS
 * 
 * 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var onLoad = function ()
	{
		// initialize options UI
		UI = RiddR.options.UI;

		_get_TTS_voices( function()
		{
			UI.load();
		})
	}

	// save specific change in the options 
	var save = function ()
	{
		RiddR.storage.set( arguments, function ()
		{
			// automaticly speak the test utterance on save if auto test is enabled
			if(RiddR.storage.get('auto_test'))
				test_speech( $('#utterance').val(), UI.reading );
		});
	}

	// Read / stop reading the test sentence, used for testing TTS options 
	var test_speech = function ( utterance, callback = undefined )
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
				options.onEvent = callback;

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
						options,
						_TTS_handler
					);
				});
			}, options.lang );
		}
	}

	// on TTS change
	var TTS_change = function ()
	{

	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PRIVATE OPTIONS METHODS
 *
 * Basic error handler, for displaying errors and debug info in options screen
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _TTS_handler = function () // @To-Do: create RiddR runtime error handler
	{	
		if (chrome.runtime.lastError) 
			RiddR.log( chrome.runtime.lastError.message, 'error' );
	}

	// get all avaliable TTS engines / voices  and store them in global object
	var _get_TTS_voices = function ( callback )
	{
		chrome.tts.getVoices(function ( voices )
		{
			for( v_key in voices )
				RiddR.options.TTS_engines[voices[v_key].voiceName] = voices[v_key];

			callback();
		});
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Load options UI after the global options object is fully loaded
 * ---------------------------------------------------------------------------------------------------------------------
*/
	RiddR.load('/js/views/options_ui.js');

}).apply(RiddR);