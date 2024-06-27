/*
 * RiddR Core
 *
 * Initialize core module and register all browser event handlers
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

import IO  		from './facades/io.js'
import CONFIG	from './facades/config.js'

import TTS 		from './modules/TTS.js'
import i18n 	from './modules/i18n.js'
import RiddR 	from './modules/riddr.js'
import Injector from './modules/injector.js'

// 
import INIT		from './modules/init.js'
import Context	from './modules/context.js'

class CORE 
{

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register browser API event listeners
 * ---------------------------------------------------------------------------------------------------------------------
*/
	constructor ()
	{
		// register browser command handler 
		chrome.commands.onCommand.addListener( this.#command );

		// reset TTS state when waking up the extension SW
		self.onactivate = TTS.reset()

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register RiddrR event handlers 
 * ---------------------------------------------------------------------------------------------------------------------
*/
		// load the content script when popup window is opened
		IO.on( 'default_action', this.#popup );

		// register event handler for handling the RiddR state e.g. read, pause, stop etc. 
		IO.on( 'command', this.#command	)

		// trigger the selector mode 
		IO.on( 'selector', () => IO.emit('selector', 'content' ) );

	// trigger initialization event
		IO.init();
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register RiddrR event handlers 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	// context menu handler 
	#context = ( DATA ) => { RiddR.read( { utterance: DATA.selectionText } ); }

	// browser command handler
	#command = ( DATA ) => 
	{
		// extract the command from the action
		let COMMAND = DATA?.action ?? DATA;

		// determine the action based on the RiddR state
		( RiddR.is( COMMAND ) ) ? RiddR.resume() : RiddR[COMMAND]( DATA ) 
	}

	// popup handler
	#popup = async () => 
	{
		// inject content script if not injected
		await Injector.load( null, null, 'popup' );

		// trigger text selection mode (if user has text selected)
		IO.emit( 'fetch', 'content' );

		// update the popup state
		IO.emit( 'state', { type: RiddR.state, }, 'popup' );
	}
}

new CORE();