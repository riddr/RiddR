/*
 * RiddR Options Event module
 *
 * Register events and handlers for various UI intereactions in the RiddR options
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/options/error.js
*/

// load dependencies
import IO  		from '../../facades/io.js'
import CONFIG	from '../../facades/config.js'


import UTILS	from '../utils.js'
import UI	from './UI.js'
import LIST	from './list.js'

class Events
{
	constructor ()
	{
		IO.on('config_update', this.#auto_read )
	}

	#auto_read ( CHANGED )
	{
		let testable =  [ 'volume', 'rate', 'pitch', 'auto_test', 'TTS_engine', 'language' ];

		if( testable.includes( CHANGED.property ) && CONFIG.auto_test )
			UI.read.start( $("#utterance").val() );

		if ( CHANGED.property == 'TTS_engine' )
			UI.DOM.updateList( 'language', LIST.HTML( 'language', CONFIG.language ) );
	}

	register ()
	{
		// test TTS audio 
		$(document).on('click','#test_box i', function()
		{
			let action = $(this).data('action');

			switch(action)
			{
				case 'read':
					UI.read.start( $("#utterance").val() );
				break;

				case 'stop':
					UI.read.stop();
				break;	

				case 'error':
					UI.error.show( chrome.runtime.lastError.message );
				break;
			}
		});

		$(document).on('change', "input[type=checkbox]", function()
		{
			CONFIG[ $(this).attr('id') ] = this.checked
		})

		$(document).on('change', "input[type=range]", function()
		{
			CONFIG[ $(this).attr('id') ] = parseFloat($(this).val()) 
		})

		$(document).on('change', "select", function()
		{
			const ID = $(this).attr('id' )
			const handler  = $(this).attr('handler');

			if( handler ) // update by dedicated handler
			{
				let DATA = ID.split("-");

				UI[handler].update( DATA[0], DATA[1], $(this).val() )
			}
			else // basic configuration ipdate
				CONFIG[ ID ] = $(this).val()
		})

		// set listenr for shortcut removal    
		$(document).on('click', '.remove_shortcut', function()
		{
			// remove shortcut from stored objects 
			UI.shortcuts.remove( $(this).attr('key') );

			// remove shorctu from the UI
			UI.dom.removeListItem( $(this) );
		});

		// Set listeners for new transcription item     
		$(document).on('click', '.add, .button', function()
		{
			let action =  $(this).attr('action');

			switch ( action )
			{
				case 'shortcuts':
				case 'transcript':
					UI[action].add();
				break;
			}

			// scroll to bottom of the container
			UI.dom.scrollToBottom( $(this).parent() );
		});

		$(document).on('click', '.delete_transcript', function()
		{
			UI.transcript.remove ( $(this).closest('ul').attr('key') );

			// remove shorctu from the UI
			UI.dom.removeListItem( $(this) );
		});

		// Event listeners for on transcript change 
		$(document).on('change', '#transcriptions input', function( )
		{
			// get transcript container
			let _transcript = $(this).closest('ul');

			UI.transcript.update( _transcript.attr('key'), _transcript.find('input:first-child').val(), _transcript.find('input:last').val() );

			$(this).blur();
		});

		// handle read transcript requests 
		$(document).on('click', '.read_transcript', function()
		{
			let container = $(this).closest('ul');
			let transcript = CONFIG.transcription[ container.attr('key') ];

			// remove previous reading states 
			$(".reading").removeClass('reading'); 

			UI.read.start( Object.keys( transcript)[0] );
		});

		// open chrome global shortcuts window
		$(document).on('click', '#global-shortcuts-container .material', function()
		{
			UTILS.tab('chrome://extensions/shortcuts');
		});
	}
}

export default new Events();