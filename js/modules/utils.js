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
	 	return RiddR.TTS.engines[TTS_engine] || RiddR.TTS.engines[RiddR.defaults.failover_engine];
	}

	// truncate some string on specific length 
	String.prototype.truncate = function ( length )
	{
		return ( this.length > length ) ? this.substr( 0, length-1 ) + '&hellip;' : this;
	};


/*
 * ---------------------------------------------------------------------------------------------------------------------
 * DEEP OBJECT MERGE
 * 
 * Validate if a given item is an object
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	this.isObject = function ( item ) 
	{
		return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
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