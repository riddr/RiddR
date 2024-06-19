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
import IO from '../facades/io.js';

class Injector
{
	// handle popup 
	load = async ( TAB, ACTION = null, MODE = null ) =>
	{
		// execute the content script injection on specific status updates or when invoked from the user
		if( ACTION === null || ACTION.status === 'loading'  )
		{
			let tab = typeof TAB === 'number' ? TAB : await this.current_tab();

			await chrome.scripting.executeScript(
			{
				target 	: { tabId: tab },
				func	: () => { return window['RiddR']; }, // see if IO tab has been
			}).then( async ( result ) => 
			{
				// if RiddR is not present then load the content script
				if( result[0].result === null )
					await this.inject( [ 'js/modules/io.js', 'js/content.js', 'css/content.css' ], tab );

				// open up communication channel if the injection was trigered by user action eg. popup click
				if( MODE !== null )
				{
					await chrome.scripting.executeScript 	({	
																target 	: { tabId: tab },
																func	: () => { return window['IO']?.connect(); },
															})
					// then pass the opened channel ID
					.then( ( result ) => { IO.lastCH = result[0].result; } )
				}

			}).catch( (error) => { console.log(error) } );
		}	
	}

	// get current tab ID 
	async current_tab ()
	{
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		return tab.id; 
	}

	async inject ( SCRIPTS, TAB, LOAD = [] )
	{
		SCRIPTS.map( function ( script )
		{
			LOAD.push( new Promise ( ( resolve, reject ) => 
			{
				// determine DOM injector
				let injector = ( script.includes('.css') )? chrome.scripting.insertCSS : chrome.scripting.executeScript

				injector( { target: { tabId: TAB, allFrames: true }, files: [ script ] }, () => { resolve(true); } )
			}))
		})

		// define 
		return await Promise.all(LOAD)
	}
}

export default new Injector();