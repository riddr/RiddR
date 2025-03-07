/*
 * RiddR Options controller
 *
 * Initializes and manages the RiddR options page, coordinating UI components,
 * loading configuration data, and updating DOM elements accordingly.
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/tree/master/js/options.js
*/

import IO  		from './facades/io.js'
import CONFIG	from './facades/config.js'

import TTS 		from './modules/TTS.js'
import UI 		from './modules/options/UI.js'
import LIST		from './modules/options/list.js'


class Options
{
	constructor ()
	{
		// make sure that all modules are properly loaded
		IO.on('config_ready', async () => 
		{
			// register UI event listeners
			UI.events.then( events => events.register() );

			// initialize material design transformer
			UI.material.then( material => material.transform() );

			// load user defined shortcuts
			UI.shortcuts.then( shortcuts => shortcuts.load() );

			// lod transcriptions list
			UI.transcript.then( transcript => transcript.list() );

			// on DOM load then load the config data
			UI.DOM.then( DOM => this.#load () );

			// hide the loader
			$('.preloader').fadeOut();
		});
	}

	// load saved options data and update the HTML element values/data
	async #load ()
	{
		for( const o_key in CONFIG )
		{
			let option = $('#'+o_key);

			if ( option.length == 1 )
			{
				switch ( option.prop('nodeName') )
				{
					case "INPUT":
						switch(option.attr('type'))
						{
							case "checkbox":
								option.prop('checked', CONFIG[o_key]);
							break;

							default: 
								option.val(CONFIG[o_key]);
						}
					break;

					case "SELECT":
						UI.DOM.updateList( o_key, LIST.HTML( o_key, CONFIG[o_key] ) );
					break;
				}
			}
		}
	}


}

new Options();