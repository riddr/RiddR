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

class UTILS
{
	tab ( URL ) 
	{
		chrome.tabs.create( { 'url': URL } );
	}
}

export default new UTILS();