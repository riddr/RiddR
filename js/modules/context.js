/*
 * RiddR Context Menu
 *
 * Register context menu and define it's handlers
 *
 * @package		RiddR
 * @category	Modules
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/context.js
*/

import IO 		from '../facades/io.js';
import CONFIG 	from '../facades/config.js';


import i18n 	from './i18n.js'
import RiddR 	from './riddr.js'

class Context
{
	constructor ()
	{
		// create the context menu on installation
		IO.on( 'install',  	this.#create );
		IO.on( 'update',  	this.#create );

		// register RiddR context menu event listener
		chrome.contextMenus.onClicked.addListener( this.#handler );
	}

	// context menu handler
	#handler ( DATA )
	{
 		RiddR.read( { utterance: DATA.selectionText } )
	}

	// register context menu on installation
	#create ()
	{
		chrome.contextMenus.create ( { id : i18n.name, title: i18n.title, contexts: [ 'selection' ] } )
	}
}

export default new Context();