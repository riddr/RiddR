/*
 * RiddR content script
 *
 * Handle requests sent to and from the current active tab in Chrome, used for text selection, shortcut detection, 
 * DOM manipulation etc..
 *
 * @package		RiddR
 * @category	Content
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/content.js
*/

var RiddR = ( function ( API ) 
{
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Private content script variables
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	 let _keys = {};

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Public content script methods
 * 
 * execute pop-up initiated actions 
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	const _browser_action = () =>
	{
		// disable select mode when PoP up is opened again 
		if( API['handler'] )
			_disable_selector()

		// get text selection on pop-up initialization
		let selection = _get_selection();

		if( selection && selection != '' )
			_read( selection );
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * General content script methods
 * 
 * Simple DOM selection mechanism in order to avoid using full Jquery library 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	const $ = function ( selector ) 
	{
		// get the reqested elements from the DOM
		selection = document.querySelectorAll( selector );

		// check for single elements selection 
		selection = ( selection.length == 1 )? selection[0] : selection;

		// valdate selection 
		if( !selection || ( selection.length != undefined && selection.length == 0 ) )
			return false;
		else
			return selection;
	}

	// Alias to Chrome's chrome.i18n internationalization API
	const __ = chrome.i18n.getMessage;

	// extract text from various HTML elements and objects
	const _extract_text = function ( text )
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
																		return text[index].ariaLabel; 
																	}).join('');
				}
			break;
		}
	}

	// stop default event action and event propatagion
	const _stop = function( event )
	{
		// stop event propagation
		event.stopPropagation();
		event.stopImmediatePropagation();

		// prevent default browser actions
		event.preventDefault();
		return;
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Get text selection in the current tab
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	const _get_selection = () =>
	{
		// get user selection
		selection = _get_user_selection();

		// get auto article / paragraph / page / RiddR read selection
		if( ( !selection || selection == '') && CONFIG.auto_selection )
			return _get_auto_selection();

		return selection;
	}

	// get basic browser basic text selection
	const _get_user_selection = () =>
	{
		// get current browser selection
		selection = API.getSelection().toString();

		if( selection != '' ) 
			return selection;
		// handle google docs user text selection
		else if( API.location.href.startsWith('https://docs.google.com/document/d/') ) 
			return _extract_text( $("rect:not(clipPath rect)") );

		//@To-Do: drive PDF DOC preview 
		// a-b-Xa-La ( whole page ) // paragraphs a-b-Xa-La-mf-Ic // a-b-s-r-pc ( selection )
	}

	// auto select text from the opened page 
	const _get_auto_selection = function ()
	{
		// auto select whole document within Google Docs's
		if( API.location.href.startsWith('https://docs.google.com/document/d/') )
			return _extract_text( $(".kix-zoomdocumentplugin-outer") );
		else
		{
			// try to find article within the page
			if( article = $('article') )
				return _extract_text( article );

			// try to find paragraphs within the page 
			if( paragraph = $('p') )
				return _extract_text( paragraph );

			// else return all readable text from the opened page
			return document.body.innerText;
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Enable one click text selection mode in the current tab
 * ---------------------------------------------------------------------------------------------------------------------
*/  

	const _selector = () =>
	{
		// enable selection UI
		document.body.classList.toggle('riddr-selector');

		// show snackbar in the top window and avoid 
		if( window == top ) // && RiddR.options.snackbar  ) @To-DO
			document.body.insertAdjacentHTML('beforeend', '<div id="riddr_snackbar"><span>'+__('contentSnackbar')+'</span></div>');

		document.addEventListener( 'click', handler = function( event ) 
		{
			// read the inner text of the selected element
			_read( event.srcElement.innerText );

			// disable select mode 
			_disable_selector();

			// prevent default element action
			return _stop( event );
		}, { capture: true } );
	}

	// disable select mode 
	const _disable_selector = () =>
	{
		// disable selection UI
		document.body.classList.remove('riddr-selector');
		document.removeEventListener( 'click', handler, true ); // detach the event

		// remove snackbar 
		if( snackbar = $('#riddr_snackbar') )
			document.body.removeChild( snackbar );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Reading / TTS related content script methods
 * 
 * start reading specific text with speciic options
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	const _read = function ( utterance, options = {} )
	{
		IO.emit( 'command', { action: 'read', utterance: utterance, options : options, online: navigator.onLine }, 'background' );
	}

	// automaticaly start reading if RiddR auto read key is found in the current page 
	const _auto_read = function ()
	{
		// check whether auto read option is enabled 
		if ( CONFIG.auto_read )
		{
			// if RiddR tagged elements are found proceed with auto reading
			if( content = $('.RiddR') ) 
				_read( _extract_text( content ) );
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Keyboard shortcuts related content script methods
 * 
 * handle keydown / keyup user generated events 
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	const _key_handler = function ( event )
	{
		if( event.type == 'keyup' )
			if( event.key == 'Meta' ) // MacOS bug for not registering keyup events when meta key is clicked
				_keys = []
			else
				delete _keys[event.code];

		// avoid multy execution
		else if( !(event.code in _keys) && event.type == 'keydown' ) 
		{
			// exit from selector mode if Esc key is pressed and selector mode is enabled
			if( event.keyCode == 27 && API['handler'] )
				_disable_selector();

			// register the pressed key 
			_keys[event.code] = true;

			// extract shortcut code
			shortcut = _extract_shortcut( event );
			
			// check weither there is such registered shortcut
			if( CONFIG.shortcuts != undefined && ( shortcut = CONFIG.shortcuts[shortcut] ) )
			{
				// get selected text
				utterance = _get_selection();

				IO.emit( 'ping', 'background' );

				// start reading 
				_read( utterance, shortcut );

				return _stop( event );
			}
		}
	}

	// extract shortcut code from keypress event
	const _extract_shortcut = function ( event )
	{
		shortcut = '';

		// list of triggering keys and their coresponding readable code // true for getting the current value 
		_triggers = { 'altKey': 'Alt' , 'ctrlKey': 'Ctrl' , 'shiftKey': 'Shift', 'metaKey': 'Cmd', 'code': true };

		// form keyboard shortcut
		for( key in _triggers )
		{
			if ( event[key] && _triggers[key] !== true )
				shortcut += _triggers[key] + '+';
			else if( _triggers[key] == true && event[key] != undefined )
				shortcut += event[key].replace('Key','');
		}

		return shortcut;
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Initialize content script ( load options, shortcuts etc. ) and register Chrome API listeners
 * ---------------------------------------------------------------------------------------------------------------------
*/ 
	API.onload = _init = _auto_read;

	// register keyboard event listeners 
	API.addEventListener( 'keydown', _key_handler, true );
	API.addEventListener( 'keyup', _key_handler );


	IO.on( 'fetch', _browser_action );
	IO.on( 'selector', _selector );

	IO.on( 'state', (event) => console.log(event) );

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Return public variables and methods
 * ---------------------------------------------------------------------------------------------------------------------
*/  
	return {}

})(this);