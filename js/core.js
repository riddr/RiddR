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
	var loaded 				= false,
		modules 		 	= ['utils','i18n'], // default modules
		background_modules  = ['TTS']
		defaults 			= 
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
 * Load view modules and libraries
 * ---------------------------------------------------------------------------------------------------------------------
*/ 
	var _load_rte = function()
	{
		// select all required libraries runtime enviroment of the current view
		rte = document.querySelectorAll('[require]'); 

		for( index in rte )
		{
			if( rte.hasOwnProperty( index ) ) // avoid objects from prototype chain
			{
				libraries 	 = rte[index].getAttribute('libs').split('|') // extract required libraries 
				library_type = rte[index].getAttribute('type') ;
				library_path = rte[index].getAttribute('require') ;

				for( lib_index in libraries )
					load('/'+library_type+'/'+library_path+'/'+libraries[lib_index]+'.'+library_type);
			}
		}
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * RiddR loader
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var load = function( file )
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
 * Dinamicly loar required modules for the current view
 * ---------------------------------------------------------------------------------------------------------------------
*/
	if( background = chrome.extension.getBackgroundPage() === API ) // detect if the call is from background
		modules = modules.concat(background_modules); // register background modules

	for ( module in modules ) // load default modules
		load('/js/modules/'+modules[module]+'.js');

	// load views specific modules and 3-rd party libraries
	_load_rte();

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Return public variables and methods
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	return {
				load 		: load, 
				loaded 	 	: loaded,
				defaults 	: defaults,
				background 	: background
	}


})(this);