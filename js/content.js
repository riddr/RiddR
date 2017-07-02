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

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * General content script methods
 * 
 * Simple DOM selection mechanism in order to avoid using full Jquery library 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var $ = function ( selector ) 
	{
		return document.querySelectorAll( selector );
	}

	// load RiddR options
	var _load_options = function ()
	{
		RiddR.IO.get( 'defaults', function( options )
		{
			RiddR.options = options;
		}, 'background' );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Get text selection in the current tab
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	var _get_selection = function ()
	{
		// gDocs
		// div.kix-selection-overlay : div.kix-zoomdocumentplugin-outer

		// try to find article / p elements

		// drive PDF DOC preview
		// a-b-Xa-La ( whole page ) // paragraphs a-b-Xa-La-mf-Ic // a-b-s-r-pc ( selection )

		// all 
		// document.all[0].innerText


		// start reading the selection
		if( selection && selection != '' )
			RiddR.IO.call( 'read', { utterance: selection, options : {} }, null, 'background' );
	}

	// get basic browser basic text selection
	var _get_browser_selection = function ()
	{
		// get current text selection
		selection = API.getSelection();

		return selection.toString();
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
 * Initialize content script ( load options, shortcuts etc. ) and register Chrome API listeners
 * ---------------------------------------------------------------------------------------------------------------------
*/ 
	API.onload = _load_options; // load RiddR options

	// register storage update event & avoid unsynced  content script options 
	chrome.storage.onChanged.addListener( _load_options );

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Return public variables and methods
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	return {
				options 		: {},
				selector 		: _select_mode,
				getSelection 	: _get_selection
	}

})(this);