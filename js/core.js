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
		modules 	= ['utils','i18n'], // default modules
		defaults 	= 
	{
		debug 			: true,
		error_repoting 	: true   // report JavaScript runtime errors to remote server
	};

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * RiddR loader
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	load = function( file )
	{
		// determine filetype of the requested file
		type =  file.split('.').pop();

		switch ( type )
		{
			case "js":	

				element = document.createElement('script');
				element.src = file;
			
			break;

			case "css":
			
				element = document.createElement("link")
				element.setAttribute("rel", "stylesheet")
				element.setAttribute("type", "text/css")
				element.setAttribute("href", file)
			
			break;
		}

		// load requested file into the DOM
		document.body.appendChild(element);
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register DOM load
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	API.onload = function()
	{
		// localize the current view
		RiddR.localize();

		RiddR.loaded = true;

		// send signal to modules that the DOM is loaded
		for( module in RiddR)
			if( RiddR[module].onLoad !== undefined )
				RiddR[module].onLoad();
	}	
	
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Dinamicly loar required modules for the current view
 * ---------------------------------------------------------------------------------------------------------------------
*/
	for ( module in modules ) // load default modules
		load('/js/lib/'+modules[module]+'.js');
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Return public variables and methods
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	return {
				load 	 : load, 
				loaded 	 : loaded,
				defaults : defaults
	}


})(this);