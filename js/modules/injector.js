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
import IO from '../modules/io.js';

class Injector
{
	constructor ()
	{
		// load the content script when popup window is opened
		IO.on( 'default_action', this.#load.bind(this) );
		IO.on( 'utterance', this.test.bind(this) );

		// lodad content script when tab is updated ( used only when proper access is given by the user)
		chrome.tabs.onUpdated.addListener( this.#load.bind(this) );
	}

	test ( utterance )
	{
		IO.emit( 'wazap', 'global' );	
	}

	// get current tab ID 
	async #current_tab ()
	{
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		return tab.id; 
	}

	// handle popup 
	async #load ( TAB, ACTION = null )
	{
		console.log(ACTION);

		// execute the content script injection on specific status updates or when invoked from the user
		if( ACTION === null || ACTION.status === 'loading'  )
		{
			let tab = typeof TAB === 'number' ? TAB : await this.#current_tab();

			chrome.scripting.executeScript(
			{
				target 	: { tabId: tab },
				func	: () => { return window['RiddR']; } // get info if RddR object exists 
			}).then( async ( result ) => 
			{ 	
				// if RiddR is not present then load the content script
				if( result[0].result === null )
					await this.#inject( [ 'js/content.js', 'css/content.css' ], tab );

			}).catch( (error) => { console.log(error) } );
		}	
	}

	async #inject ( SCRIPTS, TAB, LOAD = [] )
	{
		SCRIPTS.map( function ( script )
		{
			LOAD.push( new Promise ( ( resolve, reject ) => 
			{
				// determine DOM injector
				let injector = ( script.includes('.css') )? chrome.scripting.insertCSS : chrome.scripting.executeScript

				injector( { target: { tabId: TAB, allFrames: true }, files: [ script ] }, () => { resolve(true) } )
			}))
		})


		// define 
		return Promise.all(LOAD)
	}
}

export default new Injector();