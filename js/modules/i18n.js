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
 * Module private varialbes
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.locale = chrome.i18n.getUILanguage(); // get UI locale

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Shortcut to Chrome's chrome.i18n internationalization API
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.__ = function( message_name , replace = [] )
	{
		if ( message = chrome.i18n.getMessage( message_name, replace ) )
			return message;
		else
		{
			// log missing locale messages
			RiddR.log('Undefined message name: ' + message_name + ' in ' + RiddR.locale + ' locale!','warn');
			return false;
		}
	}	

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Localize all DOM i18n elements
 * ---------------------------------------------------------------------------------------------------------------------
*/
	this.localize = function()
	{
		elements = document.querySelectorAll('[i18n]')

		for( index in elements )
		{
			if( elements.hasOwnProperty( index ) ) // avoid objects from prototype chain
			{
				if( message = RiddR.__( elements[index].getAttribute('i18n') )) // check if the i18n message exists
				{
					_update( message, elements[index] );
				}
			}
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Update DOM element with localized content
 * ---------------------------------------------------------------------------------------------------------------------
*/
	_update = function( message, element )
	{
		if( element.innerHTML == '' ) // update just the title if element content is empty eg. <i i18n='enquene'></i>
			element.title = message;
		else
		{
			// determine element type and update corresponding attribute / content
			switch(element.tagName) 
			{	
				case 'INPUT':
					element.value = message;
				break;

				case 'IMG':
					element.src = message;
				break;

				default:
					element.innerHTML = message;
				break;
			}

			if(element.title != '') // check if element title needs to updated too 
				element.title = message;
		}
	}

}).apply(RiddR);