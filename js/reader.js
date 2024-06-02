/*
 * Reader  
 *
 * RiddR main HTML audio reader
 * An offscreen document, responsible for playing the audio streams provided by the TTS engine  
 *
 * @package		RiddR
 * @category	Offscreen 
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR
*/

// Load dependencies 
import IO from './modules/io.js';
import Error from './modules/error.js';

class Reader
{
	// define public variables
	urls 		= []
	options 	= []
	channels 	= []
	utterance 	= []
	current		= 
	{
		channel 	: 0,
		charindex   : 0,
		retry		: 0
	}

	// initalize the TTS reeader
	constructor()
	{
		// emit message that the offscrean document is ready
		IO.dispatch( 'ready', [], 'global' );

		// register event listener for audio actions
		IO.on( 'audio', this.handler.bind(this) );
	}

	// action handler router, routes various actions eg. play, pause, stop etc.
	handler ( DATA )
	{
		this[DATA.action]?.bind(this)( DATA.data );
	}

/*
 * =====================================================================================================================
 * AUDIO CONTROLL
 * 
 * Basic audio handlers used for controlling the audio state 
 * =====================================================================================================================
*/ 
	speak ( DATA )
	{
		// cleanup the chanels 
		this.#flush();

		// assing passed data to the current context
		Object.assign( this, DATA );

		// start preloading the audio file
		this.#preload();
	}

	pause ()
	{
		this.channels[this.current.channel].pause();
		this.#emit('pause');
	}

	resume ()
	{
		this.channels[this.current.channel].play();
		this.#emit('resume');
	}

	stop ()
	{
		this.#emit( 'end', this.utterance.raw.length );
	}

	volume ( DATA )
	{
		this.channels[this.current.channel].volume = DATA.volume;
	}

/*
 * =====================================================================================================================
 * AUDIO CHANNEL CONTROLLS
 * 
 * Create new channel, register all event listeners and push it to the global channel list
 * =====================================================================================================================
*/ 
	#add_channel  ( channel ) 
	{
		// add event listeners
		for( let event_id in this.events)
			channel.addEventListener(event_id, this );	// register event hanlder in the current scope

		// define chanel options
		channel.defaultPlaybackRate = this.options.rate;
		channel.webkitPreservesPitch = false;
		channel.volume = this.options.volume;

		// push audio channel into the channels collection and return the ID of the pusshed element
		return this.channels.push(channel) - 1;
	};

	// update curent and start speaking the next audio channel
	#speak_next  ()
	{
		if( this.channels[this.current.channel] != undefined  )
			this.channels[this.current.channel].play();
	}

	// preload the next channel in order to avoid big pauses @To-Do: add dynamic preload rate based on the user network connectivity
	#preload ()
	{
		if( this.channels.length < this.urls.length) // check for utterance end
		{
			let chID = this.#add_channel(new Audio());

			this.channels[chID].src = this.urls[chID];
			this.channels[chID].load();
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * HTML MediaElements event handlers
 * ---------------------------------------------------------------------------------------------------------------------
*/
	// AUDIO API event and their handlers  
	events 		= 	
	{ 	
		// GENERAL / INFO EVENTS
		'canplay' 	: this.#auto_speak.bind(this),
		
		// PLAYBACK EVENTS 
		'play'		: this.#on_play.bind(this), 	// start after pause "resume"
		'playing'	: this.#playing.bind(this), 	// media is playing
		'ended'		: this.#on_end.bind(this),

		// ERROR EVENTS
		'error' 	: this.#error.bind(this), 
		'staled' 	: this.#error.bind(this), 
		'abort' 	: this.#error.bind(this)
	};

	// Main event handler - check for valid handler and call it
	handleEvent ( event )
	{ 
		if( typeof this.events[event.type] === 'function' )
			this.events[event.type]( event ); // call the event handler
	}

	// automaticaly start speaking when the first utterance is loaded
	#auto_speak  ( event )
	{
		if( this.current.channel == 0 )
		{
			this.channels[this.current.channel].play();
			this.#emit( 'start', 0 );
		}
	}

	// called when audio stats playing for first time or on resum after pause of buffering
	#on_play  ( event )
	{
		// determine if the event is called on first play or resume
		if( event.currentTarget.currentTime < 0.1 )
		{
			// preload next utterance if any
			this.#preload();

			// send TTS sentence event
			if( this.current.channel > 0 )
			{
				// update current charIndex
				this.current.charindex += this.utterance.safe[this.current.channel].length;

				this.#emit( 'sentence', this.current.charindex );
			}
		}
		else // on resume
		{

		}
	}

	// called when audio utterance is playing for first time, after pause or buffering
	#playing  ( event ) 
	{
		this.current.retry = 0;
	}

	// called when playback completes.
	#on_end  ( event )
	{
		// clear up some memmory 
		this.#cleanup();

		// move to the next channel
		this.current.channel += 1;

		// check if the utterance reached it's end
		if(this.current.channel >= this.urls.length) 
			this.#emit( 'end' , this.utterance.raw.length );
		else
			this.#speak_next();
	}

	// hanlde all error types, for more info see error types: https://dev.w3.org/html5/spec-preview/media-elements.html#error-codes
	#error  ( event )
	{
		if(this.current.retry < 2) // try to reload the current channel
			this.#reload_channel();
		else if( event.type == 'abort')
			this.#log( 'Can\'t find valid audio source. ERRCODE: 302/503' );
		else
			this.#log( Error.media(event.currentTarget.error.code, event.currentTarget.networkState ) )
	}

	// try to reload audio channel in case of error 
	#reload_channel  ()
	{
		console.log(this.current);
		console.log(this.channels);

		this.current.retry += 1; // increment the rety attempt

		setTimeout(function() // reload channel with delay
		{
			this.channels[this.current.channel].load();

		}.bind(this), 1000 +  ( (this.current.retry-1) * 2000 ));
	}


/*
 * ---------------------------------------------------------------------------------------------------------------------
 * HTML MediaElements event handlers
 * 
 * Remove all object connections and mark object for removal on next run on garbage collector
 * ---------------------------------------------------------------------------------------------------------------------
*/
	#cleanup ()
	{
		this.channels[this.current.channel] = undefined;
		delete this.channels[this.current.channel];	
	}

	// remove all previous settings in order to avoid utternace colision
	#flush ()
	{
		// stop all active channels if any
		for( let chID in this.channels )
			this.channels[chID].pause();

		// empty all temporary variables
		this.channels = [];
		this.current.charindex = this.current.channel = 0;
	}

	// emit TTS update event
	#emit( event, payload )
	{
		// dispatch TTS update event from the ofsceen document 
		IO.dispatch 
		(
			'TTS_update', 
			{
				event : event,
				payload : payload ?? {}
			}, 
			'background'  // target only the background script
		);
	}

	#log ( message )
	{
		this.#emit( 'error', message );
	}

}

export default new Reader();