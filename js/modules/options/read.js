/*
 * RiddR Options reading wrapper
 *
 * Provides functionality to start and stop text-to-speech operations,
 * interfacing with background service worker trough and its TTS API integration
 *
 * @package		RiddR
 * @category	Options
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/options/read.js
*/

class Read
{

	start ( UTTERANCE )
	{
		IO.emit( 'command', { 
								action: 'read', 
								utterance: UTTERANCE, 				
								options : 	{ language: CONFIG.language },
								online : false
							}, 'background' );
	}

	stop ( UTTERANCE )
	{
		chrome.tts.stop();
	}
}

export default new Read();