/*
 * User
 *
 * RiddR main user authentication module 
 *
 * @package		RiddR
 * @category	user 
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR/blob/master/js/modules/user.js
*/

(function () 
{

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Backdrop public accessible methods 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	this.user = 
	{
		// grant access to the Chrome identity API's
		APIgrant : function ( handler )
		{
			chrome.permissions.request( { permissions: ['identity'] }, handler )
		},

		// grant access to user data 
		getToken : function ( interactive = true, callback )
		{
			// validate grant type ( interactive or not )
			if( typeof interactive === "function" ) 
			{
				callback = interactive;
				interactive = false;
			}

			chrome.identity.getAuthToken( { 'interactive': interactive }, callback )
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * USER INITIALIZATION PRIVATE METHODS
 *
 * Initialize user object
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _onLoad = function ()
	{
		// load stored user data from cache object if not defined 
		if( RiddR.user.UUID === undefined )
			RiddR.user = RiddR.merge( RiddR.user, RiddR.defaults.user);
	}

	// initialize user object
	var _install = function ()
	{
		// create user object
		RiddR.user = RiddR.merge
		({
			// set user UUID unique for each browser instance
			'UUID' : _generateUUID()

		}, RiddR.user );

		// save user object once initialized 
		RiddR.storage.set( { 'user' : RiddR.user } );
	}


/*
 * ---------------------------------------------------------------------------------------------------------------------
 * USER SPECIFIC PRIVATE METHODS
 *
 * Return random generated UUID
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _generateUUID = function ()
	{
		return (
					[1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, 
					c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
				)
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Backdrop public accessible methods 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	RiddR.on('load', _onLoad );
	RiddR.on('install', _install );

}).apply(RiddR);