/*
 * RiddR Shortcuts Module
 *
 * Manages global and custom keyboard shortcuts, including loading, generating,
 * displaying, and updating shortcut configurations with UI integration
 *
 * @package		RiddR
 * @category	Options
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/options/shortcuts.js
*/

import i18n 	from '../i18n.js'
import CONFIG	from '../../facades/config.js'

import UI	from './UI.js'
import LIST	from './list.js'

class Shortcuts
{

	shortcuts = {};

	// list of avaliable shortcut keys
	keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' 
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * UI SHORTCUTS RELATED FUNCTIONS 
 * 
 * Generate global keyboard shortcuts / commands  
 * ---------------------------------------------------------------------------------------------------------------------
*/
	load ()
	{
		chrome.commands.getAll()
		.then( ( COMMANDS ) => 
		{
			this.globals( COMMANDS )

			this.custom( CONFIG.shortcuts )
		});
	}

	globals ( COMMANDS )
	{
		for( let id in COMMANDS )
		{
			let command = COMMANDS[id];

			// form shortcut html 
			let shortcut_html = `<div class="material"> 
								<label for="kb-read">`+i18n['SHORTCUTS_' + command.name ]+`</label> 
								<div class="keys" id="kb-read">`
									+ this.get_shortcut_keys( command.shortcut ) +
							`	</div>
							</div>`;

			// register global shortcut
			//RiddR.options.registerShortcut( command.shortcut.substr(-1) );

			// push shortcut html into shortcut container element 
			$("#global-shortcuts-container").append( shortcut_html );
		}
	}

	// generate user defined keyboard shortcuts 
	custom  ( COMMANDS )
	{
		for ( let sh_id in COMMANDS )
		{
			this.add({ [sh_id] : COMMANDS[sh_id] });

			// register custom shortcuts
			//RiddR.options.registerShortcut( sh_id.substr(-1) );
		}
	}

	// generate shortcut html from shortcut code in the following format: ( Alt+Shift+R )
	get_shortcut_keys ( code, html = '' )
	{
		// split keys based on their delimiter ( Chrome on MacOS returns global shortcuts without delimiter )
		let keys = ( code.includes('+') )? code.split('+') : code.split('')

		for ( let key_id in keys )
			html += `<span key="`+keys[key_id].toLowerCase()+`">` + this.os_key(keys[key_id]) + `</span>`;

		return html;
	}

	// convert key to it's specific OS representation
	os_key ( key )
	{
		// set code key ID and fetch platorm info
		let keyID = key.toLowerCase()
		let platform = CONFIG.platform

		// define key mapping
		let osKEYS = 	{ 
						mac : 	{ 'alt' : '⌥', 'shift' : '⇧', 'cmd' : '⌘', 'ctrl' : '⌃' }
					}

		// do the replacement 
		if( osKEYS[platform.os] && osKEYS[platform.os][keyID] !== undefined )
			return osKEYS[platform.os][keyID]
		else
			return key
	}

	// generate shortcut HTML
	get_shortcut_html ( shortcut )
	{
		// get shortcut key
		let _key = (Object.keys(shortcut)[0]);
		
		// extract shortuct options from the shortcut object
		shortcut = shortcut[_key];


		//if( RiddR.TTS.engines[shortcut.TTS_engine] != undefined ) // check if TTS engine exists ( eg. removed by 3rd party TTS extenson )
			return `<ul>
						<li><div class="keys" id="kb-read">`+this.get_shortcut_keys(_key)+`</div></li>
						<li>
							<div class="material select stripped">
								<select id="${_key}-TTS_engine" handler="shortcuts" >
								${LIST.HTML( 'TTS_engine', CONFIG.shortcuts[_key].TTS_engine )}
								</select>
							</div>						
						</li>
						<li>
							<div class="material select stripped">
								<select id="${_key}-language" handler="shortcuts" > 
									${LIST.HTML( 'language', CONFIG.shortcuts[_key].language,  CONFIG.shortcuts[_key].TTS_engine )}
								</select>
							</div>							
						</li>
						<li>
							<div class="material switch stripped">
								<input title="Coming soon..." disabled id="${_key}-translate" type="checkbox" `+ ( (shortcut.translate)? 'checked' : '' ) +` />
								<span></span>
							</div>						
						</li>
						<li>
							<i class="material-icons remove_shortcut" key="${_key}">delete</i>
						</li>
					</ul>`;
	}

	// add shortcut into shortcut container 
	add ( shortcut )
	{
		// grant access to content scripts for all URL's 
		chrome.permissions.contains(
		{
			origins: ['*://*/*']
		}, function ( granted )
		{
			if ( granted )
			{
				// get new shortcut from the options 
				shortcut = shortcut || this.new();

				// generate shortcut html
				let html = this.get_shortcut_html( shortcut );

				// add generated HTML into the shortcuts container
				$("#shortcuts").append(html);
			}
			else
				this.grant_shortuct_perms( this.add.bind(this), shortcut );
		}.bind(this) )
	}

	// grant permissions for custom shortcuts
	grant_shortuct_perms ( callback, data )
	{
		// grant access to content scripts for all URL's 
		chrome.permissions.request(
		{
			origins: ['*://*/*']
		}, function ( granted )
		{
			if ( granted )
				callback(data);
			else
				UI.error.show('Sorry, in order to use custom shortcuts RiddR needs some additional permissions.')
		})
	}




	// generate new shortcut 
	new ()
	{
		// get new shortcut key
		let key = this.registerShortcut();

		// determine shortcut base
		let base = ( CONFIG.platform.os == 'mac' )? 'Ctrl+Cmd+' : 'Alt+Shift+'
		  
		let shortcut = { [ base + key] : {
												TTS_engine 	: 'SpeakIt',
												language 	: 'auto',
												translate 	: false,
												volume		: 1,
												rate 		: 1,
												pitch 		: 1,
											} 
		};

		// add new shortcut into the storage
		CONFIG.shortcuts =  { ... CONFIG.shortcuts, ... shortcut };

		return shortcut;
	}

	// register shortcut key, so the same key won't be used multiple times
	registerShortcut ( key )
	{
		// determine bad shortcut keys platform specific
		let badKEYS = 	new RegExp(	{
									mac : '[QDF]'
								}
								[CONFIG.platform.os], 'g' )

		// remove OS specific bad shortcut keys
		if( badKEYS != '/(?:)/g' )
			this.keys = this.keys.replace( badKEYS ,'')

		// generate random shortcut key if not provided 
		key = key || this.keys[Math.floor(Math.random() * this.keys.length)]

		this.keys = this.keys.split(key).join('');

		return key; // return the key
	}

	// remove shortcut by shortcut key 
	remove ( key )
	{
		delete CONFIG.shortcuts[key]

		// force storage update
		CONFIG.shortcuts = CONFIG.shortcuts;
	}

	// update shortcut key config 
	update ( ID, PROP, VALUE )
	{
		CONFIG.shortcuts[ID] = { ... CONFIG.shortcuts[ID], [PROP]: VALUE };

		// trigger UI updates on
		if( PROP == 'TTS_engine' )
			UI.DOM.updateList( `${ID}-language`, LIST.HTML( 'language', CONFIG.shortcuts[ID].language, VALUE ) );
	}
}

export default new Shortcuts;