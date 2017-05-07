/*
 * Storage  
 *
 * RiddR Storage manager used to store, retrieve, and track changes to user data using chrome.Storage API
 *
 * @package		RiddR
 * @category	Internationalization 
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

(function () 
{
	// define global storage object 
	this.storage = 
	{
		// set storage cache to avoid unnecessary chrome API hits 
		cache : RiddR.defaults,

		// set default storage area
		area : chrome.storage.sync,

		// synchronous get function returns value of 
		get : function ()
		{	
			switch( typeof arguments[0] )
			{
				case 'object':
					keys = {}
					
					for( key in arguments[0] )
						keys[arguments[0][key]] = RiddR.defaults[arguments[0][key]];

					return keys;
				break;

				case 'string':
					return RiddR.defaults[arguments[0]];
				break;

				default:
					RiddR.log('Storage get requires string or object input parameter')
			}
		},

		// update an item in the storage object
		set : function ()
		{
			// get input attributes 
			data = ( typeof arguments[0] === 'object' ) ? 
				// detect if the object that was sent is an argument list from parent caller 
				( arguments[0].callee === undefined ) ? arguments[0] :  { [arguments[0][0]] : arguments[0][1] } : 
				// catch plain arguments as well 
				{ [arguments[0]] : arguments[1] };

			callback = ( typeof arguments[arguments.length-1] === 'function' )? arguments[arguments.length-1] : undefined;
 
 			// update cached values
 			_update_cache( data );

			this.area.set( data, callback );
		},

		// sync RiddR saved options
		load : function ( callback )
		{
			this.area.get( RiddR.defaults, function ( options )
			{
				RiddR.defaults = options; // update RiddR global defaults object

				if( typeof callback === 'function' )
					callback();
			});
		},

		// remoe one or multiple items from the storage
		remove : function ( keys, callback )
		{
			this.area.remove( keys, callback );
		},

		// remove all items from the storage
		clear : function ( callbacl )
		{
			this.area.clear( callback );
		}
	}	

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Update cached variables
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _update_cache = function ( data )
	{
		for( key in data )
			RiddR.defaults[key] = data[key];
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Update global options object on change 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	chrome.storage.onChanged.addListener( function ( changes ) 
	{
		for( key in changes )
			RiddR.defaults[key] = changes[key].newValue;
	});

}).apply(RiddR);