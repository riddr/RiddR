/*
 * Reader  
 *
 * RiddR default browser action a.k.a the pop-up controller
 *
 * @package		RiddR
 * @category	PopUP
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR
*/

// Load dependencies 
import IO   from './facades/io.js';
import i18n from './modules/i18n.js';

class PopUP
{
	constructor ()
	{	
		// register UI event listeners
		this.#register_event_listeners();

		// register state change listener
		IO.on( 'state', this.#stateUpdate.bind(this) );

		// trigger event that the popup has been opened
		IO.emit( 'default_action', 'background' );
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
				this.call_action( element.id );

			}.bind(this));
		}.bind(this) );
	}

	// call user requested action
	call_action ( action )
	{
		switch( action )
		{
			case 'stop':
			case 'pause':
			case 'resume':
			case 'replay':
				IO.emit('command', { action: action }, 'background' );
			break;

			case 'sys-error':
				IO.emit('reload', 'background' );
				location.reload();
			break;

			case 'no-input':
				IO.emit( 'selector', 'background' );
				window.close();
			break;

			case 'error':
				this.$('#message > div')[0].classList.toggle('active');
			break;
		}
 	}


	// trigger corsponding action for the received event
 	#stateUpdate ( STATE )
 	{
 		switch( STATE.type )
 		{
 			case 'end':
 			case 'start':
 			case 'pause':
 			case 'resume':
 			case 'loading':
 			case 'interrupted':
 				this.#updateUI( STATE.type );
 			break;

 			case 'error':
 			case 'cancelled':
 				this.#updateUI( STATE.type );
 				this.#message( i18n.popUpError, STATE.errorMessage, 'error' );
 			break;

 			case 'idle':
 				this.#updateUI( STATE.type );
 				this.#message( i18n.popUpSelector );
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