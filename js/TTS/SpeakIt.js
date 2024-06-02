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

import IO from '../modules/io.js';

class SpeakIt
{
	// set global variables
	name 			= 'SpeakIt'
	lang 			= 'en-US'
	urls 			= []
	channels 		= []
	options			= {}
	events			= {}
	retries 		= 0
	utterance 		= 
	{
		raw			: '',
		filtered 	: '',
		safe 		: []
	}
	max_length		= 200 // set sentence max length 
	response 		= null
	initialized 	= false
	api_url			= 'https://translate.google.com/translate_tts'
	parameters		= 
	{
		pich 	: null, // not supported 
		gender 	: null, // not supported 
		rate 	: { min: 0.5, max: 4, default: 1.2},
		volume 	: { min:   0, max: 1, default: 1.0},
		lang	: // list of supported languages
		[
			'af', 'sq', 'ar', 'hy', 'bs', 'bn', 'ca', 'zh', 'zh-CN', 'zh-TW', 'hr', 'cs', 'da', 'nl', 'en', 'en-US', 
			'en-GB', 'en-AU', 'eo', 'fi', 'fr', 'de', 'el', 'hi', 'hu', 'is', 'id', 'ja', 'km', 'ko', 'la', 'lv', 'it',
			'mk', 'no', 'pl', 'pt', 'ro', 'ru', 'sr', 'si', 'sk', 'es', 'sw', 'sv', 'ta', 'th', 'tr', 'uk', 'vi', 'cy'
		],
		default_lang : 'en-US',
	}

	constructor() { }

	async speak ( utterance, options, TTS_response )
	{
			// pass input data into global variables
			this.options 		= options;
			this.response	 	= TTS_response;
			this.utterance.raw 	= utterance

			if( this.#valid_input() )
			{
				this.#split_utterance();

				this.#generate_urls();

				IO.dispatch
				( 
					'audio', 
					{ 
						action 	: 'speak',
						data 	: 
						{ 
							urls : this.urls, 
							options: this.options,
							utterance: this.utterance
						}
					}, 
					'reader' 
				);
			}
	}

	async stop ()
	{
		IO.dispatch ( 'audio',  { action : 'stop' }, 'reader' );

	}

	async pause ()
	{
		IO.dispatch ( 'audio',  { action : 'pause' }, 'reader' );
	}

	async resume ()
	{
		IO.dispatch ( 'audio',  { action : 'resume' }, 'reader' );
	}

	async volume ( volume )
	{
		IO.dispatch ( 'audio',  { action : 'volume', data: { volume: volune } }, 'reader' );
	}



	// validate input options
	#valid_input ()
	{
		// predefine error;
		let error = null;

		// choose default language
		this.options.lang = this.options.lang || this.parameters.default_lang; // switch back to default language if the lang is not set

		if(this.parameters.lang.indexOf(this.options.lang) == -1)
			error = 'The requested language: "'+ this.options.lang +'" is not supported yet!';

		// @To-DO: validate other input settings.

		if( error !== null )
		{
			this.response({'type': 'error', 'errorMessage': error });		
			return false;
		}

		return true;
	}

/*
 * =====================================================================================================================
 * UTTERANCE FORMATING METHODS
 *
 * Split the utterance in sentences so Google TTS API can process them
 * =====================================================================================================================
*/
	#split_utterance ()
	{
		let tmp_s = '',
			sentence, sentences;
		let safe_utterance = this.utterance.safe = []; // reset previous utterances

		// split the text on specific places and then join it in sentences limited to max length
		sentences = this.#length_join( this.utterance.raw.match(/\n|([^\r\n.;:,!?]+([.;:,!?]+|$))/gim) ); // improved split

		for( let s_id in sentences )
		{
			sentence = this.#process_element( sentences[s_id] ); // process and filter each sentence
			safe_utterance.push.apply( safe_utterance, sentence );
		}

		// re-join the elements again and set global variable
		this.utterance.safe = this.#length_join( safe_utterance );
	}

	// Join elements in strings limited to max width
	#length_join ( elements )
	{
		let tmp_element = '',
			safe_elements = [];

		for( let element_id in elements)
		{
			// set next element id
			let nxt_id = ( Number(element_id)+1 );

			// preset temporary element on beginning of new loop
			tmp_element = ( tmp_element == ''? elements[element_id] : tmp_element );

			// merge current element with the next element
			let nxt_el = tmp_element+' '+elements[nxt_id];

			if( nxt_el.length < this.max_length && nxt_id < elements.length )
				tmp_element = nxt_el;
			else
			{
				safe_elements.push( tmp_element );
				tmp_element = ''; // reset the temporary element variable
			}
		}

		return safe_elements;
	}

	// Split the utterance in sentences so Google TTS API can process them
	#process_element ( element )
	{	
		if( element.length >= this.max_length ) // do extra check for non breakable elements
		{
			return this.#length_join( element.split(/\s+/) ); // if so break on space and then join them
		}
		else
			return [ element.replace(/(^,)|(,$)/g, "") ]; // avoid commas in beginning and end on each uterance chunk to avoid weird pauses
	}

/*
 * =====================================================================================================================
 * URL MANAGEMENT  
 *  
 * Generate Google Translate TTS URL's
 * =====================================================================================================================
*/
	#generate_urls ()
	{
		// reset variables to avoid utterance colision
		this.urls = [];

		for( let ut_id in this.utterance.safe )
		{
			let parms = 
			{
				ie: 'UTF-8',
				total: this.utterance.safe.length,
				idx: ut_id,
				textlen: this.utterance.safe[ut_id].length,
				prev: 'input',
				tl: this.options.lang,
				client: 't',
				q: encodeURIComponent(this.utterance.safe[ut_id]),
				tk: this.#tk( this.utterance.safe[ut_id] )
 			}

			// build query URL
			this.#build_query( parms );
		}
	}

 	// Build query URL from array
	#build_query ( parms )
	{
		let url_parms = [];

		for( let parm_key in parms )
			url_parms.push( parm_key+'='+parms[parm_key] );

		this.urls.push( this.api_url+'?'+url_parms.join('&') );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Generate Google TK TTS authorization key
 * ---------------------------------------------------------------------------------------------------------------------
*/
	#b(a, b) 
	{
		for (var d = 0; d < b.length - 2; d += 3) {
		var c = b.charAt(d + 2),
		c = "a" <= c ? c.charCodeAt(0) - 87 : Number(c),
		c = "+" == b.charAt(d + 1) ? a >>> c : a << c;
		a = "+" == b.charAt(d) ? a + c & 4294967295 : a ^ c
		}
		return a
	}

	#tk(a) 
	{
		for (var e = '412555.1738101145'.split("."), h = Number(e[0]) || 0, g = [], d = 0, f = 0; f < a.length; f++) 
		{
			var c = a.charCodeAt(f);
			128 > c ? g[d++] = c : (2048 > c ? g[d++] = c >> 6 | 192 : (55296 == (c & 64512) && f + 1 < a.length && 56320 == (a.charCodeAt(f + 1) & 64512) ? (c = 65536 + ((c & 1023) << 10) + (a.charCodeAt(++f) & 1023), g[d++] = c >> 18 | 240, g[d++] = c >> 12 & 63 | 128) : g[d++] = c >> 12 | 224, g[d++] = c >> 6 & 63 | 128), g[d++] = c & 63 | 128)
		}

		a = h;
		for (d = 0; d < g.length; d++) a += g[d], a = this.#b(a, "+-a^+6");
		a = this.#b(a, "+-3^+b+-f");
		a ^= Number(e[1]) || 0;
		0 > a && (a = (a & 2147483647) + 2147483648);
		a %= 1E6;
		return a.toString() + "." + (a ^ h)
	}
}

	export default new SpeakIt();