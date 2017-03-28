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
		{},
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

		load();

		UI.load();
	}

	// load options 
	var load = function ()
	{
		//_get_TTS_voices();
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

		// attach event captuing callback if needed
		if( callback !== undefined )
			options.onEvent = callback;

		RiddR._lang( utterance, function( lang )
		{
			// update language if needed
			options.lang = lang;

			console.log(options);

			// start reading
			chrome.tts.isSpeaking( function( state )
			{
				if( state && options.enqueue == false ) // interupt
					chrome.tts.stop();

				// To-Do: determine action
				chrome.tts.speak
				( 
					utterance,
					options,
					TTS_handler
				);
			});
		}, options.lang );

	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PRIVATE OPTIONS METHODS
 *
 * Basic error handler, for displaying errors and debug info in options screen
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var TTS_handler = function()
	{	
		if (chrome.runtime.lastError) 
		{
			console.log('Error: ' + chrome.runtime.lastError.message);
		}
	}

	// get all avaliable TTS engines / voices  
	var _get_TTS_voices = function()
	{
		chrome.tts.getVoices(function ( voices )
		{
			console.log(voices);
		});
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Load options UI after the global options object is fully loaded
 * ---------------------------------------------------------------------------------------------------------------------
*/
	RiddR.load('/js/views/options_ui.js');

}).apply(RiddR);