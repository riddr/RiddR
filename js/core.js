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
	var data 				= {},
		is_online			= navigator.onLine,
		modules 		 	= ['utils','i18n', 'io', 'storage'], // default modules
		background_modules  = ['data/TTS_parameters', 'TTS', 'riddr', 'UI', 'user', 'backdrop']
		defaults 			= 
		{
			debug 			: true,
			TTS_engine 		: 'SpeakIt',
			offline_engine	: 'native',
			failover_engine : 'SpeakIt',
			enqueue 		: false,
			volume			: 1,
			rate 			: 1,
			pitch 			: 1,
			auto_test 		: true,
			language 		: 'en-US',
			translate		: false,
			shortcuts 		: {},
			user 			: {},
			platform		: {},
			transcribe 		: true,
			auto_selection 	: false,
			auto_read 		: true,
			donations		: true,
			snackbar		: true,
			SSML			: true,
			transcription  	: { 0 : { "RiddR"	: "reader"} },
			error_repoting 	: true   // report JavaScript runtime errors to remote server
		};

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register DOM load
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	API.onload = function()
	{
		// load saved options
		RiddR.storage.load( function ()
		{
			RiddR.loaded = true; // failback flag synchronous legacy code

			// dispatch event 
			RiddR.dispatch( new Event('load') );
		});
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Simple event listening and trigering methods
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _add_event = function( type, callback )
	{
		// check if the event queue for specifc type was created
		RiddR.events[ type ] = RiddR.events[ type ] || [];

		// add event into the queue
		RiddR.events[ type ].push(callback);
	};

	// trigger specific event
	var _dispatch_event = function( event )
	{
		console.log(  )

		if( RiddR.events[event.type] !== undefined ) 
			RiddR.events[event.type].forEach( callback => { callback( event ); } );
	}

	// remove specific event listener
	var _remove_event = function ( event, callback )
	{
		for( eventID in RiddR.events[event] )
			if ( RiddR.events[event][eventID] === callback )
				RiddR.events[event].splice( eventID, 1 );
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
	var load = function( file, callback = undefined , data = undefined)
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

		// register callback event listerer if needed 
		if( typeof callback == 'function' )
			element.onload = ( !data )? callback : function() { callback(data); }; // return custom data 

		// load requested file into the DOM
		document.body.appendChild(element);
	}
	
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Dinamicly loar required modules for the current view
 * ---------------------------------------------------------------------------------------------------------------------
*/
	if( chrome.extension.getBackgroundPage() === API ) // detect if the call is from background
		modules = modules.concat(background_modules); // register background modules

	for ( module in modules ) // load default modules
	{
		// get raw module
		module = modules[module].split('/');

		// determine module directory 
		module = ( module.length > 1)
		? 
			{dir: module[0] , name: module[1]} 
		:
			{dir: 'modules' , name: module[0]};

		load('/js/'+module.dir+'/'+module.name+'.js');
	}

	// load views specific modules and 3-rd party libraries
	_load_rte();

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Return public variables and methods
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	return {
				data		: data,
				load 		: load, 
				defaults 	: defaults,
				is_online	: is_online,

				// define event listening objects 
				events		: [],
				on 			: _add_event,
				dispatch 	: _dispatch_event,
				removeEvent : _remove_event
	}


})(this);