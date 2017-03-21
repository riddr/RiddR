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
		// update an item in the storage object
		set : function ()
		{
			// get input attributes 
			data = ( typeof arguments[0] === 'object' )? arguments[0] : { [arguments[0]] : arguments[1] };
			callback = ( typeof arguments[arguments.length-1] === 'function' )? arguments[arguments.length-1] : undefined;

			chrome.storage.sync.set( data, callback );
		},

		// sync RiddR saved options
		load : function ( callback )
		{
			chrome.storage.sync.get( RiddR.defaults, function ( options )
			{
				RiddR.defaults = options; // update RiddR global defaults object

				if( typeof callback === 'function' )
					callback();
			});
		}
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