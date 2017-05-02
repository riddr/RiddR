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
			// split the selector 
			selector = selector.split('.');

			this.send( { action: 'get', selector: selector }, callback );
		},

		call : function( celector, input, callback )
		{
			
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
		if( request.action !== undefined && module == request.selector[0] )
		{
			switch ( request.action )
			{
				case 'get' :
					response( _get( request.selector ) );
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
		return request.reduce( function ( object, property )
		{
			return object[property];
		}, RiddR );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register chrome message event listener
 * ---------------------------------------------------------------------------------------------------------------------
*/
	chrome.runtime.onMessage.addListener( _handler );

}).apply(RiddR);