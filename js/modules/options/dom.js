/*
 * RiddR Options DOM Utility Class
 *
 * Provides methods for manipulating DOM elements, such as enabling/disabling elements,
 * updating lists, removing items with animation, and scrolling elements.
 *
 * @package		RiddR
 * @category	Options
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/options/dom.js
*/

// load dependencies
import LIST	from './list.js'

class DOM
{
	
	// disable HTML element
	disableElement( ELEMENT, DISABLED = true )
	{
		ELEMENT.prop( 'disabled',  DISABLED );
	}

	// update select box list
	updateList ( ID, ELEMENTS )
	{
		// get list container / box
		let list = $("#" + ID.replace( /(:|\.|\[|\]|,|\+|=|@)/g, "\\$1" ));

		// ubdate box html and status
		list.html( ELEMENTS ).attr('updated', true);

		// update box status if it has single item
		list.prop('disabled', (list.children().length == 1) );
	}

	// remove list item
	removeListItem ( ITEM )
	{
		ITEM.closest('ul').animate({'height' : 0, opacity: 0, margin: 0, padding: 0}, 400, function()
		{
			$(this).remove();
		});
	}

	// scroll to bottom
	scrollToBottom ( ELEMENT )
	{
		ELEMENT.scrollTop( ELEMENT.prop("scrollHeight") );
	}
}

export default new DOM();