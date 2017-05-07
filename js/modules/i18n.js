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
 * Detect language from text input
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	this._lang = function ( text, callback, lang )
	{
		if ( lang !== undefined && lang !== 'auto' ) // skip language detection if the language is forced
			callback(lang);
		else
		{
			chrome.i18n.detectLanguage ( text, function( detected ) // @To-Do: make more advanced / en-US / universal locale detection
			// @To-Do: implement better language detection https://src.chromium.org/viewvc/chrome/trunk/src/third_party/cld/languages/internal/languages.cc
			// make some tests about language dialects eg. PORTUGUESE_P vs PORTUGUESE_B
			{
				lang =  ( RiddR.locale.substring(0,2) == detected.languages[0].language )? RiddR.locale : detected.languages[0].language;

				callback( lang );
			})
		}
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Get language from it's ISO code
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	this.lang_from_code = function ( code )
	{
		if ( RiddR.data.languages[code] != undefined )
			return Object.assign ( RiddR.data.languages[code], { code : code } );
		
		else if ( RiddR.data.languages[code.substr(0,2)] != undefined) // failback to official if dialect is not found 
			return Object.assign ( RiddR.data.languages[code.substr(0,2)], { code : code.substr(0,2) } );

		else
		{
			RiddR.log('Requested language code: ' + code + ' is not in RiddR language list.', 'warn');
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
	var _update = function( message, element )
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