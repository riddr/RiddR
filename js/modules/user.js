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
		// define subscription object
		subscription : {},

		// define OAuth object
		OAuth : {},

		// grant access to the Chrome identity API's
		APIgrant : function ( handler )
		{
			chrome.permissions.request( { permissions: ['identity'] }, handler )
		},

		revokeToken : function (  )
		{
			chrome.identity.removeCachedAuthToken ( { token: this.OAuth.token }, () => 
			{
				this.OAuth = {}
			} ); 
		},

		reauthToken : function ()
		{
			this.OAuth = {}

			return this.getToken();
		},

		// grant access to user data 
		getToken : async function ()
		{
			if( this.OAuth.token == undefined || this.OAuth.expires_on <= ( Date.timestamp() ) )
				await _fetchOAuthToken ( !this.OAuth.token ? true : false )

			return this.OAuth.token
		},

		updateToken : function ( INTERACTIVE )
		{
			_fetchOAuthToken ( INTERACTIVE )
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
 * OAUTH SPECIFIC PRIVATE METHODS
 *
 * Fetch OAUTH Token
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _fetchOAuthToken = function ( INTERACTIVE )
	{
		// define OAuth Request URL
		oAuthURL = RiddR.urlFromObject
		(
			{
				'base' 			: 'https://accounts.google.com/o/oauth2/auth',
				'response_type' : 'token',
				'client_id'		: '632094124816-rj8vc90oejiv4o0ar13nmu6tpdell9bd.apps.googleusercontent.com',
				'scope'			: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
				'redirect_uri'	: chrome.identity.getRedirectURL("oauth2")
			}
		)

		return new Promise( async ( resolve, reject ) => 
		{
			try 
			{
				// launch browser web authentication 
				chrome.identity.launchWebAuthFlow( { 'url': oAuthURL, 'interactive': INTERACTIVE }, function ( response ) 
				{
					if ( chrome.runtime.lastError )
					{
						if ( chrome.runtime.lastError.message == 'User interaction required.' )
							RiddR.user.reauthToken();
						else
							reject( chrome.runtime.lastError )
					}

					if ( response ) 
					{
						// extract token data from response 
						token = RiddR.getURLParms( response )

						// set the OAuth object
						RiddR.user.OAuth = 
						{
							token 		: token.access_token,
							expires_on 	: parseInt( token.expires_in ) + Date.timestamp()
						}

						// save user object with the new token
						RiddR.storage.set( { 'user' : RiddR.user } );

						resolve( token );
					}
				})
			} 
			catch ( error )
			{
				reject( error )
			}
		})
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Backdrop public accessible methods 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	RiddR.on('load', _onLoad );
	RiddR.on('install', _install );

	chrome.identity.onSignInChanged.addListener( (data) => { console.log(data) } )

}).apply(RiddR);