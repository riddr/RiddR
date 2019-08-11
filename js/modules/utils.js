/*
 * RiddR Utilities 
 *
 * Initialize core module and create protected modular enviroment.
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

(function () 
{
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Write log, warn, ifno messages into console: https://developers.google.com/web/tools/chrome-devtools/console/console-write
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.log = function( message, type = 'log' )
	{
		if(RiddR.defaults.debug)
			console[type]( message );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Group / ungrup multiple console logs
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.group = function( name )
	{
		if( name == 'end' )
			console.groupEnd();
		else
			console.group(name);
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Handle all errors 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.error = function ( message, url,  line)
	{
		console.error(message+' in '+url+' on line '+line);
	}


	window.onerror = function( message, url, line ) 
	{ 
		if(url != '')
		{
			RiddR.error(message, url, line);
			return true;	
		} 
	};  


/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Define global GET method 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	this.get = 
	{
		// return media error 
		media_error : function( error_code, netowrk_state )
		{
			switch( error_code )
			{
				case 1:
					error = 'Fetching process interupted by user.';
				case 2: 
				case 4:
					switch ( netowrk_state )
					{
						case 0:
							error = 'Audio file has not yet been initialized.';
						case 1:
							error = 'Audio is active and has selected a resource, but is not using the network.';
						case 2:
							error = 'Browser is downloading data.';
						case 3:
							error = 'No valid audio source found.';
					}
				break;
				case 3:
					error = 'Error occurred when decoding.';
			}

			return error + ' ERROR_CODE: ' + error_code + ' NETWORK_STATE: ' + netowrk_state;
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Basic text filter
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.filter = function( text, newchars = null )
	{
		// set predefined badchars
		badchars = 
		{
			'\n': ' ', "  " : '', "。" : '.', '`' : "'", '‘' : "'", '’' : "'", '"' : "'"
		};

		// extend bad chars table if needed
		if(newchars !== null && typeof newchars === 'object')
			badchars = Object.assign(badchars,newchars);

		// replace bad chars
		for(var i in badchars)
			text = text.split(i).join(badchars[i]);		

		return text.trim();
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Find the key name in some object by it's index
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	this.key_by_value = function ( object, value )
	{
		for( key in object )
			if(object[key] == value ) 
				return key;
	}

	// validate seleted TTS engine & switch to failover TTS engine if needed
	this.validate_TTS = function ( TTS_engine )
	{
	 	return RiddR.TTS.engines[TTS_engine] || RiddR.TTS.engines[RiddR.defaults.failover_engine] || RiddR.TTS.engines[RiddR.defaults.offline_engine];
	}

	// truncate some string on specific length 
	String.prototype.truncate = function ( length )
	{
		return ( this.length > length ) ? this.substr( 0, length-1 ) + '&hellip;' : this;
	};

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * URL HANDLING HELPERS
 * 
 * Form URL from object or array
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	this.urlFromObject = function( URL )
	{
		return URL.base + '?' + Object.keys(URL).map( ( key ) => 
		{ 
			if( key != 'base')
				return key + '=' + encodeURIComponent( URL[key] ) 
		} ).join('&');
	}

	// get URI query parameters and return them as object
	this.getURLParms = function ( URI, PARMS = [] )
	{
		// handle hash URI's as query parameters 
		URI = URI.replace( '#','?' )

		// create URL object
		URI = new URL( URI )

		// get URL parameters 
		parameters = new URLSearchParams( URI.search )
		parameters = URI.searchParams; 

		// put paramaters into object 
		for ( pair of parameters.entries() )
			PARMS[pair[0]] = pair[1]

		return PARMS
	} 

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * TIME HANDLING HELPERS
 * 
 * Return UNIX timestamp in seconds
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	Date.timestamp = function() 
	{
		return Date.now()/1000|0 
	};
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * OBJECT HANDLING HELPERS
 * 
 * Validate if a given item is an object
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	this.isObject = function ( item ) 
	{
		return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
	}

	// check if given object is empty 
	this.isEmpty = function ( object )
	{
		return Object.keys( object ).length === 0 && object.constructor === Object;	
	}

	// Remove property from object 
	this.deleteObjectProperty = function ( selector, object )
	{	
		Object.keys(selector).forEach( function ( key ) 
		{
			if(!(key in object))
				return;

			if ( RiddR.isObject( selector[key] ) && !RiddR.isEmpty( selector[key] ) )
				RiddR.deleteObjectProperty( selector[key], object[key] );
			else
				delete object[key];
		});
	}

	// get parent object by removing the last nested child
	this.getParentObject = function ( object )
	{
		// deep clone the object 
		object = JSON.parse( JSON.stringify(object) );

		RiddR.deleteObjectProperty( object, object );

		return object;
	}

	// deep merge two objects 
	this.merge = function ( target, source ) 
	{
		if ( RiddR.isObject( target ) && RiddR.isObject( source ) ) 
		{
			Object.keys( source ).forEach
			(
				key => 
				{
					if ( RiddR.isObject( source[key] ) ) 
					{
						if ( !target[key] ) 
							Object.assign( target, { [key]: {} } );

						RiddR.merge( target[key], source[key] );
					}
					else
					{
						Object.assign( target, { [key]: source[key] } );
					}
				}
			);
		}

		return target;
	}

}).apply(RiddR);