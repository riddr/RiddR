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

import IO  		from './facades/io.js'
import TTS 		from './modules/TTS.js'

import Broker 	from './modules/broker.js'
import i18n 	from './modules/i18n.js'


IO.init();
