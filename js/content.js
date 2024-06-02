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
	console.log(this);

	let port = chrome.runtime.connect({name: "RiddR"});
	port.postMessage({ action: "sendMessageToContent", data: "Hello from content script!" });
	port.onMessage.addListener(function(msg) {
	  if (msg.action === "messageFromBackground") {
	    console.log("Message from background:", msg.data);
	  }
	 });

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Initialize content script ( load options, shortcuts etc. ) and register Chrome API listeners
 * ---------------------------------------------------------------------------------------------------------------------
*/ 
	// register storage update event & avoid unsynced  content script options 
	//chrome.storage.onChanged.addListener( _load_options );

	// register keyboard event listeners 
	//API.addEventListener( 'keydown', _key_handler, true );
	//API.addEventListener( 'keyup', _key_handler );

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Return public variables and methods
 * ---------------------------------------------------------------------------------------------------------------------
*/  

	return {}

})(this);