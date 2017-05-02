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

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Prepare the utterance for reading. Filter out bad characters and transcribe it if needed  
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.prepare = function ( utterance )
	{
		for( key in RiddR.defaults.transcription )
			utterance = utterance.replace( RegExp(key,'ig'), RiddR.defaults.transcription[key]);

		return utterance;
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Return last element of array by extending global array object 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	Array.prototype.last = function()
	{
		return this[this.length-1];
	}

}).apply(RiddR);