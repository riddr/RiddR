/*
 * RiddR Ititialization module
 *
 * Handle actions when RiddR is installed or updated
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

import UTILS from './utils.js';

class INIT
{
	constructor () 
	{
		//IO.on( 'install',  	this.#install );
		//IO.on( 'update',  	this.#update );

		// handle new installations, updates and chrome updates 
		chrome.runtime.onInstalled.addListener( this.handler.bind( this ) );

		// register uninstall URL, used for surveys etc.. 
		//chrome.runtime.setUninstallURL( 'https://riddr.com/this-is-sad' );
	}

	// context menu handler
	handler ( DATA )
	{	
		IO.emit( DATA.reason, DATA, 'background' );
	}

	#install ( DATA )
	{
		UTILS.tab('https://riddr.com/welcome') // show welcome page to the user
	}


	async #update ( DATA )
	{
		// update the current version 
		CONFIG.version = await chrome.runtime.getManifest().version;

		if( CONFIG.version !== DATA.previousVersion )
		{
			if( CONFIG.update_notify ) // show welcome page
				UTILS.tab('https://riddr.com/changelog/v' + CONFIG.version )

			// update logic
		}
	}
}

export default new INIT();