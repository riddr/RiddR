/*
 * RiddR Transcription Module
 *
 * Manages transcription items, including listing, adding, updating, and removing
 * user-defined text transformations with UI integration.
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/options/transcript.js
*/

import UI from './UI.js';

import CONFIG	from '../../facades/config.js'

class Transcript
{
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * UI TRANSCRIPTION RELATED FUNCTIONS 
 * 
 * Generate user defined transcription items / transcripts  
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	list ()
	{
		for ( let key in CONFIG.transcription ) 
		{
			let transcript = CONFIG.transcription[key];

			if( transcript )
			{
				this.add
				(
					{
						id 		: key,
						from 	: Object.keys(transcript)[0],
						to 		: transcript[Object.keys(transcript)[0]]
					}
				);		
			}
		}
	}

	// generate  transcription item html
	html ( transcript )
	{
		return `<ul key="${transcript.id}">
					<li>
						<input type="text" value="${transcript.from}">
					</li>
					<li><i class="material-icons">chevron_right</i></li>
					<li>
						<input type="text" value="${transcript.to}">
					</li>
					<li>
						<i class="material-icons read_transcript">record_voice_over</i>
						<i class="material-icons  delete_transcript">delete</i>
					</li>
				</ul>`;
	}

	// add transcription item 
	add ( transcript )
	{
		// generate transcript data
		transcript = ( transcript )? transcript : this.new();

		let html = this.html(transcript);

		$("#transcriptions").append(html);
	}

	// generate new transcription item 
	new ( transcript = { from : '', to : '' } )
	{
		// set transcript
		transcript.id =  Number( Object.keys( CONFIG.transcription ).pop() ) + 1 || 0;

		// push the new transcript into RiddR storage
		CONFIG.transcription = 	{ 	... CONFIG.transcription, 
									... { [transcript.id] : { [transcript.from] : transcript.to } }
								}

		return transcript;
	}

	update( ID, FROM, TO )
	{
		CONFIG.transcription[ID] = { [FROM]: TO };
	}

	// remove transcript by transcript key
	remove = function ( key )
	{
		delete CONFIG.transcription[key]
	}
}

export default new Transcript();