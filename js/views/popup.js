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
	var _ui_events = [ 'start', 'end', 'loading', 'pause', 'resume', 'interrupted' ];
	
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
		}
 	}

 	// update popup UI state 
	var _update_UI_state = function ( new_state )
	{
		if( _ui_events.indexOf( new_state ) !== -1 ) // general UI updates
		{
			ui_elem = $("#controls");

			// get current state
			state = ui_elem.className.split(' ');

			// register new UI state
			state.push(new_state);

			// remove unnecessary states
			if( state.length > 2 )
				state.shift();

			ui_elem.className = state.join(' ')
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Pirvate UI specific Pop-UP methods  
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _init_UI = function ()
	{
		// register UI event listeners
		_register_event_listeners();
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

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register TTS update listener 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	window.addEventListener('onTTSupdate', function( event )
	{
		_update_UI_state( event.detail.type );
	});


}).apply(RiddR);