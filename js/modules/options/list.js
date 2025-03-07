/*
 * RiddR Options List module
 *
 * Manages the generation of dropdown list options for the RiddR options page
 * supports: TTS engines and coresponding language 
 *
 * @package		RiddR
 * @category	Options
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/options/list.js
*/

import TTS 		from '../TTS.js'
import DATA 	from '../../data/languages.js'

class List
{
	// generates the HTML code for the list element
	HTML ( listID, SELECTED, FILTER = null )
	{
		// get list data by list type
		const data 	= this.byTYPE( listID, FILTER );

		// generate HTML options elements
		const options = Object.entries(data).map 	( 	
														([key, value]) => 
														`<option value="${key}" display="${value}" ${key === SELECTED ? ' selected' : '' }>${value}</option>` 
													);

		return options.join('');
	}

	// get list data by list type
	byTYPE ( TYPE, FILTER )
	{
		const TYPES = 
		{
			TTS_engine		: () => this.#pair( Object.keys(TTS.engines) ),
			failover_engine	: () => this.#pair( Object.keys(TTS.engines) ),
			language 		: () => this.#lang( FILTER ),
			offline_engine 	: () => this.#pair
										(
											Object.keys(TTS.engines).filter( key => !TTS.engines[key].remote )
										)
		}

		return TYPES[TYPE]?.() || {};
	}

	// create key/values pairs by key
	#pair ( KEYS )
	{
		return Object.fromEntries( KEYS.map( key => [ key, key ] ) )
	}

	// get language list 
	#lang ( TTS_engine = null )
	{
		const engine = TTS.engines[ TTS_engine || CONFIG.TTS_engine ];

		console.log( engine );

		let langs = engine.parameters?.lang  ||  [ engine.lang || 'auto' ]; 						// Fallback to auto lang detection

		// inject automatic language detection for TTS engines with support for multiple languages
			langs = langs.length > 1 ? [ 'auto', ... langs ] : langs;

		return Object.fromEntries
		(
			langs.map 	( 	lang => [
										lang, 	DATA.languages[lang]?.name  ||
												DATA.languages[ lang.substring(0,2)  ]?.name || 	// failback to IETF BCP 47 format
												lang 												// failback to lang code
									]
						)
		);
	}

}

export default new List();