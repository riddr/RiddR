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
		send : function ( message, callback, target = null ) 
		{
			if( target == 'content' ) // send message to the content script
			{
				chrome.tabs.query({active: true, currentWindow: true}, function( tabs ) 
				{
					chrome.tabs.sendMessage(tabs[0].id, message, callback);
				});	
			}
			else
				chrome.runtime.sendMessage( message, callback );
		},

		// get specific 
		get : function( selector, callback, target )
		{
			this.send( { action: 'get', selector: selector, target: target }, callback, target );
		},

		call : function( selector, data, callback, target )
		{
			this.send( { action: 'call', selector: selector, data: data, target: target }, callback, target );
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
	var _handler = function ( request, sender, callback )
	{
		// check request action and validate module 
		if( request.action !== undefined )
		{
			switch ( request.action )
			{
				case 'get' :
					return _response( _get( request ), callback );
				break;

				case 'call':
					return _response( _call( request ), callback );
				break;

				case 'trigger':
					_trigger( request.id, request.data );
				break;
			}
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Handle communication channel response 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _response = function ( result, callback )
	{
		if( result === true ) // keep the communication channel open 
			return result;
		else
			callback( result );
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

		if( request.target == undefined || _validate_target( request.target ) )
		{
			return selector.reduce( function ( object, property )
			{
				return object[property];
			}, RiddR );
		}
		else
			return true;
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Call some method from another RiddR instance and return it's result 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _call = function ( request )
	{
		if( callee = _get( request ) )
			if( typeof callee == 'function' ) // validate if the selected request is function
				return callee(request.data);

		//else
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
 * validate if the IO request is within the specified target 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _validate_target = function ( target )
	{
		if( location.protocol == 'chrome-extension:') // detect weither the is in extension page 
		{
			if( location.pathname == '/_generated_background_page.html' )
				return target == 'background';
			else
				return target == location.pathname.split('/').pop().split('.')[0];
		}
		else // or in content script
			return target == 'content';
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register chrome message event listener
 * ---------------------------------------------------------------------------------------------------------------------
*/
	chrome.runtime.onMessage.addListener( _handler );

}).apply( RiddR || {} );