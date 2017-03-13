/*
 * Internationalization 
 *
 * Localize RiddR UI to the native language of the user if there is supported locale 
 *
 * @package		RiddR
 * @category	Internationalization 
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

(function () 
{
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Shortcut to Chrome's chrome.i18n internationalization API
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.__ = function( message , replace = [] )
	{
		return chrome.i18n.getMessage( message, replace );
	}	

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Localize all DOM i18n elements
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.localize = function()
	{
	}

}).apply(RiddR);