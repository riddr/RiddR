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
import IO from './modules/io.js';

class PopUP
{
	constructor ()
	{	
		// register UI event listeners
		this.#register_event_listeners();

		// register state change listener
		IO.on( 'state', this.#stateUpdate.bind(this) );


		this.$("body").forEach( function(element) 
		{
			element.addEventListener('click' , function( event ) 
			{
				chrome.permissions.request( { origins: ['*://*/*'] } );
			});
		});

		// trigger event that the popup has been opened
		IO.emit( 'default_action' );
	}

	$ ( selector ) 
	{
		if( selector.indexOf('#') == 0 && selector.indexOf(' ') == -1 )
			return document.querySelector( selector );
		else
			return document.querySelectorAll( selector );
	}

	// register UI event listeners 
	#register_event_listeners ()
	{
		// add event listener to the controll buttons
		this.$("#container > div").forEach( function(element) 
		{
			element.addEventListener('click' , function( event ) 
			{
				this.#call_action( this.id );
			});
		});
	}

	// call user requested action
	#call_action ( action )
	{
		switch( action )
		{
			case 'stop':
			case 'pause':
			case 'resume':
			case 'replay':
				console.log('action');
				//RiddR.IO.call( action, null, null, 'background' );
			break;

			case 'sys-error':
				//RiddR.IO.call( "backdrop.reload", null, null, "background" );
				location.reload();
			break;

			case 'no-input':
				window.close();
				IO.emit( 'selector' );
			break;

			case 'error':
				this.$('#message > div')[0].classList.toggle('active');
			break;
		}
 	}


	// trigger corsponding action for the received event
 	#stateUpdate ( STATE )
 	{
 		switch( STATE.event )
 		{
 			case 'end':
 			case 'start':
 			case 'pause':
 			case 'resume':
 			case 'loading':
 			case 'interrupted':
 				this.#updateUI( STATE.event );
 			break;

 			case 'error':
 			case 'cancelled':
 				this.#updateUI( STATE.event );
 				this.#message( RiddR.__('popUpError'), event.errorMessage, 'error' );
 			break;

 			case 'idle':
 				this.#updateUI( STATE.event );
 				this.#message( RiddR.__('popUpSelector') );
 			break;
 		}
 	}


 	// update popup UI state 
	#updateUI ( new_state )
	{
		let ui_elem = this.$("#controls");

		// get current state
		let state = ui_elem.className.split(' ');

		// register new UI state
		state.push(new_state);

		// remove unnecessary states
		if( state.length > 2 )
			state.shift();

		// update 
		if( state[0] != state[1] )
			ui_elem.className = state.join(' ')
		else
			ui_elem.className = state[1];
	}


	// generate pop-up message box content
	#message ( message, extra_data = '', type = '',  icon = '' )
	{
		// add icon next to the message
		message += ( icon != '' )? `<span class="material-icons">${icon}</span>` : '';

		// add additional message information
		message += ( extra_data != '' )? `<div class='${type}'>${extra_data}</div>` : '';

		// update message box html
		this.$("#message").innerHTML = message;
	}

}

export default new PopUP();