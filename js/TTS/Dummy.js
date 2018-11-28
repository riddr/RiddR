/*
 * Dummy
 *
 * Simple dummy TTS Engine created to help developers build their own TTS engines on top of RiddR platform
 * For more information, please check TTS Engine Development wiki. 
 *
 * @package		RiddR
 * @category	TTS Engines 
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR/blob/master/js/TTS/Dummy.js
 * @wiki 		https://github.com/skechboy/RiddR/wiki/TTS-Engine-development
*/

(function () 
{
	// define public methods and TTS Engine default parameters
	var TTS = this.TTS.embed.Dummy  = 
	{ 
		name 		: 'Dummy',
		parameters	:
		{
			gender 	: null, // use null for not supported 
			pich 	: { min: 0, 	max: 2, 	default: 1.0 },
			rate 	: { min: 0.1, 	max: 10, 	default: 1.0 },
			volume 	: { min:   0, 	max: 1, 	default: 1.0 },
			lang	:
			[
				 // list of supported languages in ISO 3166-1 alpha-2 format https://datahub.io/core/language-codes/r/3.html
				'en', 'en-US', 'en-GB', 'en-AU', /* ... */ 'mk', 'it' 
			],
			default_lang : 'en-US' // TTS Engine default language 
		},
		
 		//
		speak : function( utterance, options, TTS_response )
		{
			TTS_response ({'type': 'start', 'charIndex': 0} );

			// start reading 
			console.log('Hello, World!'); // write's hello world in chrome's background runtime

			TTS_response( {'type': 'end', 'charIndex': utterance.length} );
		},

		stop : function()
		{
			// stop reading 
		},

		pause : function()
		{
			// pause logic 
		},

		resume : function()
		{
			// resume logic
		},

		volume : function( volume )
		{
			// volume set logic 
		}
	}

	// bellow you can define your private TTS methods, outside of the public TTS scope
	// eg var _some_pivate_method = function...


}).apply(RiddR);