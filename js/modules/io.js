/*
 * IO  
 *
 * RiddR message manager used to enable comminication between RiddR internal modules and for external apps 
 *
 * @package		RiddR
 * @category	Messenger 
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

(function () 
{
	// define global storage object 
 	this.IO = 
	{
		// send message trough chrome runtime
		send : function ( message, callback ) 
		{
			chrome.runtime.sendMessage( message, callback );	
		},

		// get specific 
		get : function( selector, callback )
		{
			this.send( { action: 'get', selector: selector }, callback );
		},

		call : function( selector, data, callback )
		{
			this.send( { action: 'call', selector: selector, data: data }, callback );
		},

		trigger : function( event_id, data )
		{
			// trigger the event in the current instance / page
			_trigger( event_id, data );

			// triger the event in all other instances /pages
			this.send( { action: 'trigger', id: event_id, data: data } );
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Update global options object on change 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _handler = function ( request, sender, response )
	{
		// check request action and validate module 
		if( request.action !== undefined )
		{
			switch ( request.action )
			{
				case 'get' :
					response( _get( request ) );
				break;

				case 'call':
					response( _call(request) );
				break;

				case 'trigger':
					_trigger( request.id, request.data );
				break;
			}
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Get element / property from another RiddR instance 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _get = function ( request )
	{
		// split object selector into array
		selector = request.selector.split('.');

		if( selector.length > 1 && module != selector[0])
			return null;
		else
			return selector.reduce( function ( object, property )
			{
				return object[property];
			}, RiddR );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Call some method from another RiddR instance and return it's result 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _call = function ( request )
	{
		if( callee = _get( request ))
			return callee(request.data);
		else
			return '{ error: "Invalid method requested:' + request.selector + '"}';
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Trigger event listener trough all other RiddR instances
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _trigger = function ( event_id, data )
	{
		event = new CustomEvent(event_id, { detail: data } );
		window.dispatchEvent(event);
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register chrome message event listener
 * ---------------------------------------------------------------------------------------------------------------------
*/
	chrome.runtime.onMessage.addListener( _handler );

}).apply(RiddR);