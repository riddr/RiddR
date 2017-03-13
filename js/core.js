/*
 * RiddR Core
 *
 * Initialize core module and create protected modular enviroment.
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

var RiddR = ( function ( API ) 
{
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * defune default public / private variables
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var loaded 		= false,
		defaults 	= 
	{
		debug 			: true,
		error_repoting 	: true   // report JavaScript runtime errors to remote server
	};

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register DOM load
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	API.onload = function()
	{
		RiddR.loaded = true;

		// send signal to modules that the DOM is loaded
		for( module in RiddR)
			if( RiddR[module].onLoad !== undefined )
				RiddR[module].onLoad();
	}	

      chrome.commands.onCommand.addListener(function(command) {
        console.log('Command:', command);
      });

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Return public variables and methods
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	return {
				loaded 	: loaded,
				defaults : defaults
	}


})(this);