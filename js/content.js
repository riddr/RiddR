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
		selection = document.querySelectorAll( selector );

		if ( selection.length == 1 ) // return single element 
			return selection[0];
		else
			return selection;
	}

	// load RiddR options
	var _load_options = function ( callback )
	{
		RiddR.IO.get( 'defaults', function( options )
		{
			RiddR.options = options;

			if( typeof callback === 'function' )
				callback();

		}, 'background' );
	}

	// extract text from various HTML elements and objects
	var _extract_text = function ( text )
	{
		switch( typeof text )
		{
			case 'string':
				return text;
			break;

			case 'object':

				if( text.tagName ) // single HTML element detected
					return text.innerText;
				else
				{
					if( text instanceof Array ) // handle array input
						return text.join('');

					if( text instanceof NodeList) // extract text from multiple HTML elements / NodeList
						return Object.keys(text).map( function (index){ 
																		return text[index].innerText; 
																	}).join('');
				}
			break;
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Get text selection in the current tab
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	var _get_selection = function ()
	{
		// get user selection
		selection = _get_user_selection();

		// get auto article / paragraph / page / RiddR read selection
		if( ( !selection || selection == '') && RiddR.options.auto_selection )
			selection = _get_auto_selection()

		// start reading the selection
		if( selection && selection != '' )
			_read( selection );
	}

	// get basic browser basic text selection
	var _get_user_selection = function ()
	{
		// get current browser selection
		selection = API.getSelection().toString();

		if( selection != '' ) 
			return selection;
		// handle google docs user text selection
		else if( API.location.href.startsWith('https://docs.google.com/document/d/') ) 
			return _extract_text( $(".kix-selection-overlay ~ .kix-lineview-content") );

		//@To-Do: drive PDF DOC preview 
		// a-b-Xa-La ( whole page ) // paragraphs a-b-Xa-La-mf-Ic // a-b-s-r-pc ( selection )
	}

	var _get_auto_selection = function ()
	{
		// try to find article / p elements

		// try to find RiddR content selection tag

				// gDocs
		// div.kix-zoomdocumentplugin-outer - for whole document

		return document.body.innerText;
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
			_read( event.srcElement.innerText );

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
	API.onload = function()
	{
		_load_options( _auto_read );
	};

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