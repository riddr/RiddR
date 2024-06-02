/*
 * RiddR TTS controler 
 *
 * Load all TTS voices and handle all TTS engine requests
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

import IO from '../modules/io.js';

// Import embed TTS engines and DATA
import SpeakIt from '../TTS/SpeakIt.js';
import DATA 	from '../data/TTS_parameters.js';

class TTS
{
	debug 	= false
	state 	= null
	engine 	= null
	handler = null
	engines = {}
	embed 	= { SpeakIt3 : SpeakIt };

	constructor()
	{
		// register chrome event listeners
		chrome.ttsEngine.onSpeak.addListener 	( this.onSpeak.bind(this) );
		chrome.ttsEngine.onStop.addListener 	( this.onStop.bind(this) );
		chrome.ttsEngine.onPause.addListener 	( this.onPause.bind(this) );
		chrome.ttsEngine.onResume.addListener 	( this.onResume.bind(this) );

		// initialize the TTS module
		this.#init();

		// registering various TTS event handlers
		IO.on( 'TTS_update', this.#TTS_update.bind(this) );
	}

	async onSpeak ( utterance, options, TTS_response ) 
	{
		setTimeout( async () => // delaying speak execution in case of canceled / interupt events
		{
			// register TTS_response handler for later references
			this.handler = TTS_response;

			if( this.#probe( options ) )
			{
				if( await this.#reader() ) // make sure that audio 
					this.engine.speak( utterance, options, TTS_response );
			}

		}, 10 );
	}

	async onStop ()
	{
		if(this.#valid('stop'))
			this.engine.stop();
	}

	onPause	()
	{
		if(this.#valid('pause'))
			this.engine.pause();
	}

	onResume ()
	{
		if(this.#valid('resume'))
			this.engine.resume();
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PRIVATE TTS METHODS
 * 
 * Initialize TTS module
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	async #init ()
	{
		// send interrupt event and reset Chrome TTS API  @To-Do: file a bug to Google regards this
		chrome.tts.stop();

		// load TTS engines & their data
		await this.#load();
	}

	// Load all built-in TTS engines and register all installed TTS engines
	async #load ( recursion = false )
	{
		await 	chrome.tts.getVoices()
				.then(  voices => 
						{
							for( const voice_id in voices )
								this.#register( voices[voice_id] );
						})
	}

	// register TTS engine
	#register ( engine )
	{
		// put embed TTS engines on the top 
		if( engine.extensionId == chrome.runtime.id )
			this.engines = { ...{ [engine.voiceName] : this.#config( engine ) }, ...this.engines }
		else
			this.engines[engine.voiceName] = this.#config( engine );
	}

	// fetch and assign configuration data for each TTS engine 
	#config ( engine )
	{
		return { ...engine, ...( this.embed[engine.voiceName] ?? DATA[engine.extensionId] ?? DATA.defaults ) };
	}

	#valid ( action )
	{
		if( this.engine == null ) // prevent sending requests before extension is loaded
			return false;

		return true;
	}

	// load embed TTS engine 
	#probe ( options )
	{
		if( this.engine == null || this.engine.name != options.voiceName ) // check if new TTS engine is called
		{
			if(this.embed[options.voiceName] !== undefined) // check if the requested TTS engine is loaded
			{	
				//chrome.offscreen.closeDocument();

				// set current TTS engine
				this.engine = this.embed[options.voiceName]; 
			}
			else
				return false;
		}

		return true;
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * AUDIO Reader
 * 
 * Initialize offscreen document that is able to handle DOM & Audio events 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	async #reader ()
	{
		if( ! await this.#has_reader() )
		{
			await chrome.offscreen.createDocument(
			{
				url: '../views/reader.html',
				reasons: [ 'AUDIO_PLAYBACK', 'LOCAL_STORAGE' ],
				justification: 'Text to speech reproduction, LOCAL_STORAGE is needed for indefinete lifetime due to Audio.pause() feature',
			});
		}

		return true;
	}

	// check if offscrean document is opened
	async #has_reader ()
	{
		const contexts = await chrome.runtime.getContexts(
		{
			contextTypes: ['OFFSCREEN_DOCUMENT'] // no need for aditional filters as RiddR has only one offscreen document
		});

		return Boolean(contexts.length);
	}

	// handle events sent from the AUDIO reader and use the TTS_call back handler to send event updates to the TTS API
	async #TTS_update ( DATA )
	{
		let response;
		const { event, payload } = DATA;

		if( this.state != event ) // avoid duplicate updates
		{
			switch ( event )
			{
				case 'pause':
				case 'resume':
					// file a bug regards unsuported events ( pause, resume ) in ttsEngines
				break;

				case 'error':
					this.handler( { 'type': 'error', 'errorMessage': payload } );
				break;

				default:
					await this.handler( { 'type': event, 'charIndex': payload } );
			}
		}

		// trigger state actions
		this.#state_trigger( event );
	}

	// execute specific actions based on the STATE value
	#state_trigger ( STATE )
	{
		this.state = STATE;

		if( STATE == 'end' || STATE == 'error' )
			chrome.offscreen.closeDocument();
	}
}

// TTS module registration
	export default new TTS();