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
		{	// set default options
			TTS_engine 		: 'native',
			enqueue 		: true,
			volume			: 1,
			rate 			: 1,
			pitch 			: 1,
			auto_test 		: true,
			language 		: 'en-US',
			shortcuts 		: {},
			transcribe 		: true,
			transcription  	: { "riddr"	: "reader" }
		},
		{   // define magic method for catching all requests to the global options object
			get: function(target, property)
			{
				// deny access to _private properties from outside of the current scope
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
	var onLoad = function()
	{
		// initialize options UI
		UI = RiddR.options.UI;
		UI.load();
	}

	// load options 
	var load = function()
	{
		chrome.storage.sync.get(RiddR.options, function(items)
		{
			console.log(items);
		})
	}

	// save specific change in the options 
	var save = function( call )
	{

	}

	// Read / stop reading the test sentence, used for testing TTS options 
	var test_speech = function( utterance, callback = undefined )
	{
		//prepare utterance for reading
		utterance = RiddR.prepare( utterance );

		// set test options object
		options = 
		{
			voiceName 	: RiddR.options.TTS_engine,
			enqueue 	: RiddR.options.enqueue,
			lang 		: RiddR.options.language,
			rate 		: RiddR.options.rate,
			pitch 		: RiddR.options.pitch,
			volume 		: RiddR.options.volume
		}

		// attach event captuing callback if needed
		if( callback !== undefined )
			options.onEvent = callback;

		// start reading
		if(chrome.tts.isSpeaking())
			chrome.tts.stop();
		else
			chrome.tts.speak
			( 
				utterance,
				options,
				_TTS_error_handler
			);
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PRIVATE OPTIONS METHODS
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _TTS_error_handler = function()
	{
		if (chrome.runtime.lastError) 
		{
			console.log('Error: ' + chrome.runtime.lastError.message);
		}
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Load options UI after the global options object is fully loaded
 * ---------------------------------------------------------------------------------------------------------------------
*/
	RiddR.load('/js/views/options_ui.js');

}).apply(RiddR);