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
	// define public methods and variables
	var TTS = this.TTS.embed.SpeakIt  = 
	{ 
		// set global variables
		name 			: 'SpeakIt',
		lang 			: 'en-US',
		urls 			: [],
		channels 		: [],
		options			: {},
		events			: {},
		retries 		: 0,
		utterance 		: 
		{
			raw			: '',
			filtered 	: '',
			safe 		: []
		},
		current			: 
		{
			utterance 	: 0,
			channel 	: 0,
			charindex   : 0,
			retry		: 0
		},
		max_length		: 100, // set sentence max length 
		response 		: null,
		initialized 	: false,
		api_url			: 'https://translate.google.com/translate_tts',
		parameters	:
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
		},
		
 		//
		speak : function( utterance, options, TTS_response )
		{
			// pass input data into global variables
			TTS.options 		= options;
			TTS.response	 	= TTS_response;
			TTS.utterance.raw 	= utterance;

			if(_validate_input())
			{
				// initialize engine enviroment
				_init();

				// split the utterance into multiple sentences
				_split_utterance();

				// generate TTS API urls for each sentence 
				_generate_urls();

				// start playing audo
				_speak();
			}
		},

		stop : function()
		{
			_flush();
			_state('end')
		},

		pause : function()
		{
			_state('pause');
			TTS.channels[TTS.current.channel].pause();
		},

		resume : function()
		{
			_state('resume');
			TTS.channels[TTS.current.channel].play();
		},

		volume : function( volume )
		{
			TTS.channels[TTS.current.channel].volume = volume;
		}
	}

/*
 * =====================================================================================================================
 * COMMON PRIVATE METHODS
 *
 * Set current TTS engine state and return corsponding TTS response to Chrome
 * =====================================================================================================================
*/
	var _state = function ( state , gSTATE = true )
	{
		if( RiddR.TTS.state != state )	// avoid sending double events
			switch ( state )
			{
				case 'start':
					TTS.response({'type': 'start', 'charIndex': 0});
				break;

				case 'end':
					TTS.response({'type': 'end', 'charIndex': TTS.utterance.raw.length});
				break;
			}

		// pass the state into global state
		if(gSTATE)
			RiddR.TTS.state = state;
	}

	// validate current state
	var _is = function ( state )
	{
		if( RiddR.TTS.state == state )
			return true;

		return false;
	}

	// initialize TTS engine 
	var _init = function ()
	{
		// clean up
		_flush();

		if( !TTS.initialized )
		{
			// register all possible audio events and their callbacks
			_register_events();

			// mark that TTS engine was initialized
			TTS.initialized = true;
		}
	}

	// validate input options
	var _validate_input = function ()
	{
		// predefine error;
		error = null;

		// choose default language
		TTS.options.lang = TTS.options.lang || TTS.parameters.default_lang; // switch back to default language if the lang is not set

		if(TTS.parameters.lang.indexOf(TTS.options.lang) == -1)
			error = 'The requested language: "'+ TTS.options.lang +'" is not supported yet!';

		// @To-DO: validate other input settings.

		if( error !== null )
		{
			// debug
			RiddR.log(error, 'error');

			TTS.response({'type': 'error', 'errorMessage': error });		
			return false;
		}

		return true;
	}

	// Remove all object connections and mark object for removal on next run on garbage collector
	var _clear_memory = function ()
	{
		TTS.channels[TTS.current.channel] = undefined;
		delete TTS.channels[TTS.current.channel];	
	}

	// remove all previous settings in order to avoid utternace colision
	var _flush = function ()
	{
		// stop all active channels if any
		for( chID in TTS.channels )
			TTS.channels[chID].pause();

		// empty all temporary variables
		TTS.channels = [];
		TTS.current.charindex = TTS.current.channel = 0;
	}

/*
 * =====================================================================================================================
 * UTTERANCE FORMATING METHODS
 *
 * Split the utterance in sentences so Google TTS API can process them
 * =====================================================================================================================
*/
	var _split_utterance = function ()
	{
		tmp_s = '';
		TTS.utterance.safe = safe_utterance = []; // reset previous utterances

		// split the text on specific places and then join it in sentences limited to max length
		sentences = _length_join(TTS.utterance.raw.match(/\n|([^\r\n.;:,!?]+([.;:,!?]+|$))/gim)); // improved split

		for(var s_id in sentences)
		{
			sentence = _process_element(sentences[s_id]); // process and filter each sentence
			safe_utterance.push.apply(safe_utterance,sentence);
		}

		// re-join the elements again and set global variable
		TTS.utterance.safe = _length_join(safe_utterance);
	}

	// Join elements in strings limited to max width
	var _length_join = function (elements)
	{
		tmp_element = '',
		safe_elements = [];

		for(var element_id in elements)
		{
			// set next element id
			nxt_id = (Number(element_id)+1);

			// preset temporary element on beginning of new loop
			tmp_element = (tmp_element == ''? elements[element_id] : tmp_element);

			// merge current element with the next element
			nxt_el = tmp_element+' '+elements[nxt_id];

			if(nxt_el.length < TTS.max_length && nxt_id < elements.length)
				tmp_element = nxt_el;
			else
			{
				safe_elements.push(tmp_element);
				tmp_element = ''; // reset the temporary element variable
			}
		}

		return safe_elements;
	}

	// Split the utterance in sentences so Google TTS API can process them
	var _process_element = function ( element )
	{	
		//element = RiddR.filter( element ); // filter bad chars 

		if( element.length >= this.max_length ) // do extra check for non breakable elements
		{
			return this._length_join(element.split(/\s+/));
		}
		else
			return new Array(element); // all good here
	}

/*
 * =====================================================================================================================
 * URL MANAGEMENT  
 *  
 * Generate Google Translate TTS URL's
 * =====================================================================================================================
*/
	var _generate_urls = function ()
	{
		// reset variables to avoid utterance colision
		TTS.urls = [];

		for(ut_id in TTS.utterance.safe)
		{
			parms = 
			{
				ie: 'UTF-8',
				total: TTS.utterance.safe.length,
				idx: ut_id,
				textlen: TTS.utterance.safe[ut_id].length,
				prev: 'input',
				tl: TTS.options.lang,
				client: 't',
				q: encodeURIComponent(TTS.utterance.safe[ut_id]),
				tk: tk(TTS.utterance.safe[ut_id])
 			}

			// build query URL
			_build_query(parms);
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 *  Build query URL from array
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _build_query = function ( parms )
	{
		url_parms = [];

		for(parm_key in parms)
		{
			url_parms.push(parm_key+'='+parms[parm_key]);
		}

		TTS.urls.push(TTS.api_url+'?'+url_parms.join('&'));
	}

/*
 * =====================================================================================================================
 * EVENT LISTENERS 
 * 
 * define event type and _event_handlers
 * =====================================================================================================================
*/
	var _register_events = function ()
	{
		TTS.events = 	{ 	
							// GENERAL / INFO EVENTS
							'canplay' 	: _auto_speak,
							
							// PLAYBACK EVENTS 
							'play'		: _on_play, 	// start after pause "resume"
							'playing'	: _playing, 	// media is playing
							'ended'		: _on_end,

							// ERROR EVENTS
							'error' 	: _error, 
							'staled' 	: _error, 
							'abort' 	: _error
						};
	}

	// Main event handler - check for valid handler and call it
	TTS.handleEvent = function ( event )
	{ 
		if(typeof TTS.events[event.type] === 'function')
			TTS.events[event.type]( event ); // call the event handler
		else
			RiddR.log('The specified callback: "'+TTS.events[event.type]+'" for the event: "'+event.type+'" do not exist in the scope.', 'warn' );
	}


/*
 * ---------------------------------------------------------------------------------------------------------------------
 * TTS Specific event handlers 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	// called when audio utterance is playing for first time, after pause or buffering
	var _playing = function ( event ) 
	{
		TTS.current.retry = 0;
	}

	// hanlde all error types, for more info see error types: https://dev.w3.org/html5/spec-preview/media-elements.html#error-codes
	var _error = function ( event )
	{
		if(TTS.current.retry < 2) // try to reload the current channel
			_reload_channel();
		else if( event.type == 'abort')
			TTS.response({'type': 'error', 'errorMessage': 'Can\'t find valid audio source. ERRCODE: 302/503' });
		else
			TTS.response({'type': 'error', 'errorMessage': RiddR.get.media_error(event.currentTarget.error.code, event.currentTarget.networkState )});
	}

	// try to reload audio channel in case of error 
	var _reload_channel = function ()
	{
		TTS.current.retry += 1; // increment the rety attempt

		setTimeout(function() // reload channel with delay
		{
			TTS.channels[TTS.current.channel].load();

		}, 1000 +  ( (TTS.current.retry-1) * 2000 ));
	}

	// automaticaly start speaking when the first utterance is loaded
	var _auto_speak = function ( event )
	{
		if( TTS.current.channel == 0 )
		{
			_state('start');
			TTS.channels[TTS.current.channel].play();
		}
	}

	// called when audio stats playing for first time or on resum after pause of buffering
	var _on_play = function ( event )
	{	
		// determine if the event is called on first play or resume
		if( event.currentTarget.currentTime < 0.1 )
		{
			// preload next utterance if any
			_preload_utterance();

			// send TTS sentence event
			if( TTS.current.channel > 0 )
			{
				// update current charIndex
				TTS.current.charindex += TTS.utterance.safe[TTS.current.channel].length;
				TTS.response({'type': 'sentence', 'charIndex': TTS.current.charindex});
			}
		}
		else // on resume
		{

		}
	}

	// called when playback completes.
	var _on_end = function ( event )
	{
		// clear up some memmory 
		_clear_memory();

		// move to the next channel
		TTS.current.channel += 1;

		// check if the utterance reached it's end
		if(TTS.current.channel >= TTS.urls.length) 
			_state('end');
		else
			_speak_next();
	}

/*
 * =====================================================================================================================
 * AUDIO CONTROLL
 * 
 * Create new channel, register all event listeners and push it to the global channel list
 * =====================================================================================================================
*/ 
	var _add_channel = function ( channel ) 
	{
		// add event listeners
		for(event_id in TTS.events)
		{
			channel.addEventListener(event_id, TTS);	// register event hanlder in the current scope
		}

		channel.defaultPlaybackRate = TTS.options.rate || TTS.parameters.rate.default;
		channel.webkitPreservesPitch = false;
		channel.volume = TTS.options.volume || TTS.parameters.volume.default;

		// push audio channel into the channels collection and return the ID of the pusshed element
		return TTS.channels.push(channel) - 1;
	};

	// update curent and start speaking the next audio channel
	var _speak_next = function ()
	{
		if( TTS.channels[TTS.current.channel] == undefined  )
			TTS.response({'type': 'error', 'errorMessage': 'Failed to play next sentence!' });	
		else
			TTS.channels[TTS.current.channel].play();
	}

	// preload the next channel in order to avoid big pauses @To-Do: add dynamic preload rate based on the user network connectivity
	var _preload_utterance = function()
	{
		if( TTS.channels.length < TTS.utterance.safe.length) // check for utterance end
		{
			chID = _add_channel(new Audio());

			TTS.channels[chID].src = TTS.urls[chID];
			TTS.channels[chID].load();
		}
	}

	// start speaking
	var _speak = function (input)
	{
		// start loading utterances
		_preload_utterance();
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Generate Google TK TTS authorization key
 * ---------------------------------------------------------------------------------------------------------------------
*/
	function b(a, b) 
	{
		for (var d = 0; d < b.length - 2; d += 3) {
		var c = b.charAt(d + 2),
		c = "a" <= c ? c.charCodeAt(0) - 87 : Number(c),
		c = "+" == b.charAt(d + 1) ? a >>> c : a << c;
		a = "+" == b.charAt(d) ? a + c & 4294967295 : a ^ c
		}
		return a
	}

	function tk(a) 
	{
		for (var e = '412555.1738101145'.split("."), h = Number(e[0]) || 0, g = [], d = 0, f = 0; f < a.length; f++) 
		{
			var c = a.charCodeAt(f);
			128 > c ? g[d++] = c : (2048 > c ? g[d++] = c >> 6 | 192 : (55296 == (c & 64512) && f + 1 < a.length && 56320 == (a.charCodeAt(f + 1) & 64512) ? (c = 65536 + ((c & 1023) << 10) + (a.charCodeAt(++f) & 1023), g[d++] = c >> 18 | 240, g[d++] = c >> 12 & 63 | 128) : g[d++] = c >> 12 | 224, g[d++] = c >> 6 & 63 | 128), g[d++] = c & 63 | 128)
		}

		a = h;
		for (d = 0; d < g.length; d++) a += g[d], a = b(a, "+-a^+6");
		a = b(a, "+-3^+b+-f");
		a ^= Number(e[1]) || 0;
		0 > a && (a = (a & 2147483647) + 2147483648);
		a %= 1E6;
		return a.toString() + "." + (a ^ h)
	}

}).apply(RiddR);