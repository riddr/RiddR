/*
 * RiddR  
 *
 * RiddR main Text-To-Speech controller
 * responsible for controlling the browser TTS API's 
 *
 * @package		RiddR
 * @category	Modules 
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR
*/

import IO 		from '../facades/io.js';
import CONFIG 	from '../facades/config.js';

import TTS 		from '../modules/TTS.js';
import i18n 	from '../modules/i18n.js';

class RiddR 
{
	state 		= 'idle';
	idle 		= null;
	engine 		= null;
	request 	= null;
	reset_after = 5000;
	max_lenght 	= 32768; // define maximum utterance length https://developer.chrome.com/docs/extensions/reference/api/tts#method-speak


	read ( DATA )
	{
		// temporary fix for Chrome pause bug in native TTS engines // @To-Do: file bug to Google regards this
		if( this.state == 'pause' || this.state == 'cancelled' )
			this.stop()

		let options = 
		{
			voiceName 	: this.#engine( DATA?.options?.engine ).voiceName,
			enqueue 	: DATA?.options?.enqueue 				|| CONFIG.enqueue,
			lang 		: DATA?.options?.language 				|| CONFIG.language,
			volume 		: DATA?.options?.volume 				|| CONFIG.volume,
			rate 		: this.#validate ( DATA?.options?.rate 	|| CONFIG.rate,  this.engine.rate ),
			pitch 		: this.#validate ( DATA?.options?.pitch || CONFIG.pitch, this.engine.pitch ),

			// register the event handler
			onEvent 	: this.#stated.bind(this)
		}

		// detect the utterance language, prepare it for reading and then read it
		Promise.all(
		[
			chrome.tts.isSpeaking(),
			this.#prepare( DATA.utterance ),
			i18n.lang( DATA.utterance )
		])
		.then( ( RESULT ) => 
		{
			const [ reading, utterance, language ] = RESULT;

			// uptate the initial state
			this.#init( reading )

			chrome.tts.speak // read thy utterance
			( 
				utterance,
				{ ... options, lang: language.read }
			);

		})
		.catch( ( ERROR ) =>  this.#error( ERROR ) ); 

		// set last request
		this.request = DATA;
	}

	// self explaining Riddr TTS  methods 
	stop()	 { chrome.tts.stop(); }
	pause()	 { this.#TTS('pause') } 	// using custom TTS controll metod 
	resume() { this.#TTS('resume') }	// as Chrome is not returning pause and resume events 
	replay() { this.read( this.request ); }

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PRIVATE STATE HANDLING METHODS
 *
 * Set the initial state, determined by weither RiddR is reading or not
 * ---------------------------------------------------------------------------------------------------------------------
*/
	#init ( READING )
	{
		if( READING && CONFIG.enqueue ) // if the extension is reading trigger the enqueued event
			return this.#stated('enqueued');

		// trigger "loading" state for remote TTS engines
		return this.#stated('loading');
	}

	// state handler 
	// updates the module state & re-emits all TTS events globaly
	#stated ( EVENT )
	{
		// allow shorthand event triggering
		if( typeof EVENT === 'string' )
			EVENT = { type: EVENT };

		// ignore sentence and word events in the global state setting
		if ( EVENT.type != 'sentence' && EVENT.type != 'word' )
			this.state = EVENT.type;

		// emit the state change to all extension contexts 
		IO.emit('state', { type: EVENT.type, charIndex: EVENT.charIndex }, 'global' );

		// initate state reset counter
		this.#reset( EVENT.type )
	}

	// determine the network connection and then
	// fetch the coresponding TTS engine and it's parameters from the TTS module
	#engine ( ENGINE )
	{
		// default back to the last configured offline_engine
		let engine = CONFIG.offline_engine;

		// check if the client has internet conneciton prior than picking the right TTS engine
		if ( navigator.onLine ) 
			engine = ENGINE ?? CONFIG.TTS_engine; 

		// return the engine data or failback to the OS native engine 
		return this.engine = TTS.engines[ engine ] ?? 'native'
	}

	// validate the TTS engine parameters and make sure that a given vaulue is within its range
	#validate ( CURRENT, PARMS )
	{	
		if( PARMS && ( CURRENT > PARMS.max || CURRENT < PARMS.min ) )
			return PARMS.default;

		return  CURRENT;
	}

	// reset the TTS state 
	#reset ( state )
	{
		let 	idle_timer;
		const 	idle = new Set( [ 'end', 'error', 'interrupted', 'cancelled' ] );

		if( idle.has(state) )
		{
			idle_timer = setTimeout( function ()
			{
				// avoid sending idle state after legit interuption
				if( idle.has( this.state ) ) 
					this.#stated( 'idle' );

			}.bind(this), this.reset_after );
		}
		else if( idle_timer )
			idle_timer = clearTimeout( idle_timer );
	}

	// chrome TTS function wrapper used for sending events for not yet supported actions eg. pause / resume
	#TTS ( ACTION )
	{
		chrome.tts[ACTION]();
		this.#stated( ACTION );
	}

	// TTS error handler 
	#error ( MESSAGE )
	{
		IO.emit( 'state', { type: 'error', errorMessage: chrome.runtime.lastError?.message ?? MESSAGE  }, 'global' );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PRIVATE UTTERANCE FORMING METHODS 
 *
 * form utterance, check it's length, language, transliterate it & translate it
 * ---------------------------------------------------------------------------------------------------------------------
*/
	async #prepare ( UTTERANCE, LANGUAGE, callback )
	{
		// transcribe the utterance 
		UTTERANCE = this.#transcribe ( UTTERANCE );

		// check whether SSML markup is disabled
		if( !CONFIG.SSML ) 
			UTTERANCE = UTTERANCE.replace( /(<([^>]+)>)/ig , "");

		return UTTERANCE;
	}

	// transcribe userdefined words for better pronouncing 
	#transcribe ( UTTERANCE )
	{
		if( CONFIG.transcribe )
		{
			for( let key in CONFIG.transcription )
			{
				let transcript_key = Object.keys( CONFIG.transcription[key] )[0];

				UTTERANCE = UTTERANCE.replace( RegExp(transcript_key,'ig'), CONFIG.transcription[key][transcript_key] );
			}
		}

		return UTTERANCE;
	}
}

export default new RiddR();