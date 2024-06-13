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

import IO  		from './facades/io.js';
import TTS 		from './modules/TTS.js'
import Injector from './modules/injector.js'

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * defune default public / private variables
 * ---------------------------------------------------------------------------------------------------------------------
*/

	var defaults 			= 
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
		update_notify	: true,
		transcription  	: { 0 : { "RiddR"	: "reader"} },
		error_repoting 	: true   // report JavaScript runtime errors to remote server
	};

IO.init();
