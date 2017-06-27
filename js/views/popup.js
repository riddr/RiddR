/*
 * Pop-UP
 *
 * RiddR chrome pop-up view controller 
 *
 * @package		RiddR
 * @category	Pop-UP
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR/blob/master/js/views/popup.js
*/

(function () 
{

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Public accessible Pop-UP methods
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	this.popup = 
	{
		// initialize RiddR Pop-UP
		onLoad : function()
		{
			_init_UI();	

			// get selected text in the current opened tab
			RiddR.IO.call( "getSelection", null, null, "content" );	
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * General Pop-Up methids 
 * 
 * simple DOM selection mechanism in order to avoid using full Jquery library 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	$ = function ( selector ) 
	{
		if( selector.indexOf('#') == 0 && selector.indexOf(' ') == -1 )
			return document.querySelector( selector );
		else
			return document.querySelectorAll( selector );
	}

	// trigger corsponding action for the received event
 	var _trigger_event = function ( event )
 	{
 		switch( event.type )
 		{
 			case 'end':
 			case 'start':
 			case 'pause':
 			case 'resume':
 			case 'loading':
 			case 'interrupted':
 				_update_UI_state( event.type );
 			break;

 			case 'error':
 				_update_UI_state( event.type );
 				_message_box( '<b>Oops!?</b></br> Something went wrong.', event.errorMessage, 'error' );
 			break;

 			case 'idle':
 				_update_UI_state( event.type );
 				_message_box( '<b>Howdy!</b></br>Please select some text for me to read.' );
 			break;
 		}
 	}

	// call user requested action
	var _call_action = function ( action )
	{
		switch( action )
		{
			case 'stop':
			case 'pause':
			case 'resume':
			case 'replay':
				RiddR.IO.call( action, null, null, 'background' );
			break;

			case 'no-input':
				window.close();
				RiddR.IO.call( "selector", null, null, "content" );
			break;

			case 'error':
				$('#message > div')[0].classList.toggle('active');
			break;
		}
 	}

 	// update popup UI state 
	var _update_UI_state = function ( new_state )
	{
		ui_elem = $("#controls");

		// get current state
		state = ui_elem.className.split(' ');

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

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Pirvate UI specific Pop-UP methods  
 * 
 * initialize pop-up UI
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _init_UI = function ()
	{
		RiddR.IO.call('state', null, function( state )
		{
			// update initial UI state
			_trigger_event( { type : state } );		

			// register UI event listeners
			_register_event_listeners();

		}, 'background' );
	}

	// register UI event listeners 
	var _register_event_listeners = function ()
	{
		// add event listener to the controll buttons
		$("#container > div").forEach( function(element) 
		{
			element.addEventListener('click' , function( event ) 
			{
				_call_action( this.id );
			});
		});
	}

	// generate pop-up message box content
	var _message_box = function( message, extra_data = '', type = '',  icon = '' )
	{
		// add icon next to the message
		message += ( icon != '' )? `<span class="material-icons">${icon}</span>` : '';

		// add additional message information
		message += ( extra_data != '' )? `<div class='${type}'>${extra_data}</div>` : '';

		// update message box html
		$("#message").innerHTML = message;
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register TTS update listener 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	window.addEventListener('onTTSupdate', function( event )
	{
		_trigger_event( event.detail );
	});


}).apply(RiddR);