/*
 * RiddR content script
 *
 * Handle requests sent to and from the current active tab in Chrome, used for text selection, shortcut detection, 
 * DOM manipulation etc..
 *
 * @package		RiddR
 * @category	Content
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR/blob/master/js/content.js
*/

var RiddR = ( function ( API ) 
{
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Private variables declaration
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	var _shortcuts = {};

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Get text selection in the current tab
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	var _get_selection = function ()
	{
		// get current text selection
		selection = API.getSelection();
		selection = selection.toString();

		// start reading the selection
		if( selection && selection != '' )
			RiddR.IO.call( 'read', { utterance: selection, options : {} }, null, 'background' );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Enable one click text selection mode in the current tab
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	var _select_mode = function ()
	{
		// enable selection UI
		document.body.classList.toggle('riddr-selector');

		document.addEventListener( 'click', handler = function( event ) 
		{
			// read the inner text of the selected element
			RiddR.IO.call( 'read', { utterance: event.srcElement.innerText, options : {} }, null, 'background' );

			// disable selection UI
			document.body.classList.toggle('riddr-selector');
			document.removeEventListener( 'click', handler ); // detach the event
		});
	}


/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Return public variables and methods
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	return {
				selector 		: _select_mode,
				getSelection 	: _get_selection
	}

})(this);