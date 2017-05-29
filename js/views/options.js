/*
 * RiddR
 *
 * TTS Engine named RiddR build in into the same named extension, based on unofficial Google API's 
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

(function () 
{
	var UI;

	// extend RiddR object
	this.TTS = {};

	// extendd RiddR global options object 
	this.options = new Proxy
	(
		{
			environment 	: 0,
			TTS_engines 	: {},
			avaliable_keys 	: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' // list of avaliable shortcut keys
		},
		{   // define magic method for catching all requests to the global options object
			get: function(target, property)
			{
				// deny access to "_private" properties from outside of the current scope
				if( property[0] === '_' )
					return function(){RiddR.log('Can\'t access private property','warn')};

				if(target[property] === undefined)
					return eval(property); // To-Do: find safer alternative
				else
					return target[property];
			}
		}
	);

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PUBLIC INITIALIZATION OPTIONS METHODS
 * 
 * start loading options enviroment
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var onLoad = function ()
	{
		// load TTS voices 
		_get_TTS_voices.apply( _async() );

		// load chrome defined commands / shortcuts 
		_get_chrome_commands.apply( _async() );
	}

	// render options UI when options enviroment has been loaded 
	var onLoadComplete = function()
	{
		// check if all async functions were completed  
		if(  RiddR.options.environment == 0  )
		{
			// initialize options UI
			UI = RiddR.options.UI;

			// generate UI interface by passing validated TTS engine
			UI.generate( RiddR.validate_TTS( RiddR.storage.get('TTS_engine') ) );

			// load saved options 
			_load_options();

			// render UI interface
			UI.render();
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PUBLIC OPTIONS METHODS
 * 
 * save specific change in the options
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var save = function ()
	{
		// form input data 
		input = _get_save_data( arguments );

		RiddR.storage.set( input.data, function ()
		{
			// update UI if nesecery after options are properly saved
			if( _update_UI( input.action ) )
			{
				// automaticly speak the test utterance on save if auto test is enabled
				if(RiddR.storage.get('auto_test'))
					test_speech( $('#utterance').val(), UI.reading );

			}

			// show snack bar
			UI.snackbar('Options were successfuly saved!', 1500);
		});
	}

	// Read / stop reading the test sentence, used for testing TTS options 
	var test_speech = function ( utterance, callback = undefined )
	{
		RiddR.read( utterance, {}, callback );
	}

	// generate new shortcut 
	var newShortcut = function ()
	{
		// get new shortcut key
		key = RiddR.options.registerShortcut();
		  
		shortcut = { ['Alt+Shift+' + key] : {
												TTS_engine 	: 'SpeakIt',
												language 	: 'auto',
												translate 	: false,
												volume		: 1,
												rate 		: 1,
												pitch 		: 1,
											} 
		};

		// add new shortcut into the storage
		RiddR.storage.set( { shortcuts : shortcut } );

		return shortcut;
	}

	// register shortcut key, so the same key won't be used multiple times
	var registerShortcut = function ( key )
	{
		// generate random shortcut key if not provided 
		key = key || RiddR.options.avaliable_keys[Math.floor(Math.random() * RiddR.options.avaliable_keys.length)]

		RiddR.options.avaliable_keys = RiddR.options.avaliable_keys.split(key).join('');

		return key; // return the key
	}

	// remove shortcut by shortcut key 
	var removeShortcut = function ( key )
	{
		_remove_item ( RiddR.defaults.shortcuts, key );
	}

	// generate new transcription item 
	var newTranscript = function ( transcript = { from : '', to : '' } )
	{
		// set transcript
		transcript.id = Object.keys( RiddR.defaults.transcription).length;

		// push the new transcript into RiddR storage
		RiddR.storage.set( { transcription : { [transcript.id] : { [transcript.from] : transcript.to } } } );

		return transcript;
	}

	// remove transcript by transcript key
	var removeTranscript = function ( key )
	{
		_remove_item ( RiddR.defaults.transcription, key );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PRIVATE COMMON OPTIONS METHODS
 *
 * Basic error handler, for displaying errors and debug info in options screen
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _TTS_handler = function () // @To-Do: create RiddR runtime error handler
	{	
		if (chrome.runtime.lastError) 
			RiddR.log( chrome.runtime.lastError.message, 'error' );
	}

	// register and confim on completion initialization methods that are loading asynchronous data, mainly Chrome API's
	var _async = function ()
	{
		if ( arguments.callee.caller.name != ''  && arguments[0] != true )
			RiddR.options.environment +=1;
		else
		{
			RiddR.options.environment -=1;
			onLoadComplete();
		}
	}

	// validate and put saving data in proper format 
	var _get_save_data = function ( data )
	{
		// define save action
		action = { id : data[0] };

		// detect keyboard save action 
		if( action.id.indexOf('+') != -1 && action.id.indexOf('-') != -1 )
		{
			action = {
					 	id : 'shortcuts', 
					 	key :  action.id.split('-')[0],
					 	type : action.id.split('-')[1]
					 };

			data = _form_shortcut_data( data );
		}

		return { action : action, data : data };
	}

	// update options UI on change
	var _update_UI = function ( action , update = true )
	{
		switch ( action.id )
		{
			case 'language':
			case 'TTS_engine':
				_on_TTS_update();
			break;

			case 'shortcuts':
				update = _on_shortcut_update(action);
			break;

		}

		return update;
	}

	// remove nested item from RiddR storage object 
	var _remove_item = function ( object, id )
	{
		delete object[id];

		// update objects storage
		RiddR.storage.set( object );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PRIVATE OPTIONS METHODS
 *
 * get all avaliable TTS engines / voices and store them in global object with their supported parameters
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _get_TTS_voices = function () 
	{
			RiddR.IO.get('TTS.engines', function( engines ) // get registered TTS engines
			{
				// push TTS engine into RiddR global object
				RiddR.TTS.engines = engines;

				_async(); // mark async action as complete 
			});
	}

	// get predefined shortcuts / commands 
	var _get_chrome_commands = function ()
	{
		chrome.commands.getAll( function ( commands )
		{
			RiddR.options.commands = commands;

			_async() // mark async action as complete
		});
	}

	// load saved options and update corresponding UI elements
	var _load_options = function()
	{
		for( o_key in RiddR.defaults )
		{
			option = $('#'+o_key);

			if ( option !== undefined && option.length == 1 )
			{
				switch ( option.prop('nodeName') )
				{
					case "INPUT":
						switch(option.attr('type'))
						{
							case "checkbox":
								option.prop('checked', RiddR.defaults[o_key]);
							break;

							default: 
								option.val(RiddR.defaults[o_key]);
						}
					break;

					case "SELECT":
						option.find('option[value="'+RiddR.defaults[o_key]+'"]').prop('selected', true);
					break;
				}
			}
		}
	}

	// update option UI on main TTS engine change @To-Do: avoid excessive UI / DOM update requests 
	var _on_TTS_update = function() 
	{
		// TO-DO: CHECK FOR CONNECTION STATUS IF REMOTE 
		language = RiddR.storage.get('language');
		engine = RiddR.validate_TTS( RiddR.storage.get('TTS_engine') );

		// put languages in more idexable format 
		engine.lang = ( ( typeof engine.lang == 'string' )? [engine.lang] : engine.lang ) || ['auto'];

		// check if the selected language is supported, otherwise revert to the default or first language
		if( engine.lang.indexOf(language) == -1 )
		{
			default_lang = ( engine.default_lang != undefined )? engine.default_lang : engine.lang[0];
			RiddR.storage.set( {'language': default_lang } );
		}

		// update TTS UI 
		UI.updateTTSParameters( engine );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * KEYBOARD SHORTCUTS RELATED METHODS
 *
 * set keyboard shortcut data in valid saving format
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _form_shortcut_data = function ( data )
	{
		value 	 = data[1];
		selector = data[0].split('-');

		return { "shortcuts" : { [selector[0]] : { [selector[1]] : value }  } };
	}

	// post save shortcut update action @To-Do: create unified script for langauge support check and avoid constant UI updates 
	var _on_shortcut_update = function ( data )
	{
		if( data.type == 'TTS_engine' )
		{
			shortcut 	= RiddR.storage.get('shortcuts')[data.key];
			engine 		= RiddR.TTS.engines[shortcut.TTS_engine];

			UI.updateLanguageBox( data.key+'-language', engine.lang, shortcut.language );
		}

		return false;
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Load options UI after the global options object is fully loaded
 * ---------------------------------------------------------------------------------------------------------------------
*/
	RiddR.load('/js/views/options_ui.js');

}).apply(RiddR);