/*
 *
 * RiddR configuration storage
 * used for state recordign of various extension data but mainly user options
 *
 * @package		RiddR
 * @category	Modules 
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

if( typeof CONFIG !== 'function' )
{
	class CONFIG 
	{
		// config storage container
		#cache = {};

		// set RiddR default options
		#defaults 			= 
		{
			debug 			: false,
			TTS_engine 		: 'SpeakIt',
			offline_engine	: 'native',
			failover_engine : 'SpeakIt',
			enqueue 		: false,
			volume			: 1,
			rate 			: 1.2,
			pitch 			: 1,
			auto_test 		: true,
			language 		: 'en-US',
			translate		: false,
			shortcuts 		: {},
			user 			: {},
			platform		: {},
			transcribe 		: true,
			auto_selection 	: false,
			auto_read 		: true,
			donations		: true,
			snackbar		: true,
			SSML			: true,
			update_notify	: true,
			transcription  	: { 0 : { "RiddR"	: "reader"} },
			error_repoting 	: true   // report JavaScript runtime errors to remote server
		};

		// define the storage provider
		// using sync in an effort to sync riddr user settings accross multiple browsers
		provider = chrome.storage.sync;
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register various i18n methods
 * 
 * Instantiate the storage controller
 * ---------------------------------------------------------------------------------------------------------------------
*/	
		constructor ()
		{
			// sync storage data
			this.#sync();

			// register data syncing event listener
			chrome.storage.onChanged.addListener( this.#sync.bind(this) )

			// return the proxied 
			return new Proxy( this, this.#handler );
		}

		// synchronize stored data from chrome storagee
		#sync ()
		{
			this.provider.get().then( DATA => 
			{
				this.#cache = { ... this.#defaults, ... this.#cache, ... DATA };

				// trigger a local event that the configuration storage has been loaded
				if( arguments.length === 0 )
					IO.emit( 'config_ready', IO.context );
			})
		}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * PROXY handler
 * 
 * Registers basic proxy traps which enables us neat object handling
 * ---------------------------------------------------------------------------------------------------------------------
*/	
		#handler =	
		{
			get: ( TARGET, NAME, RECEIVER ) => 
			{
				// return recursive proxy in case of nested objects
				if( typeof this.#cache[NAME] === 'object' )
					return new Proxy( this.#cache[NAME], this.#handler.nested )

				return this.#cache[NAME];
			},

			set: ( TARGET, NAME, VALUE, RECEIVER ) =>
			{
				this.#cache[NAME] = VALUE;

				return this.provider.set( this.#cache );
			},

			deleteProperty: ( TARGET, PROPERTY ) =>
			{
				delete this.#cache[ PROPERTY ];

				return this.provider.remove( PROPERTY );
			},

			ownKeys: ( TARGET ) =>
			{
				return Reflect.ownKeys( this.#defaults ); 
			},

			getOwnPropertyDescriptor: ( TARGET, NAME ) =>
			{
				return {
					configurable: true,
					enumerable: true,
				};
			},

			// OBJECT Proxy handler
			// used for updating changes in nested objects 
			nested: {
						set: ( TARGET, NAME, VALUE ) => 
						{ 
							Reflect.set( TARGET, NAME, VALUE );

							return this.provider.set( this.#cache );
						},

						deleteProperty: ( TARGET, PROPERTY ) =>
						{
							Reflect.deleteProperty( TARGET, PROPERTY );

							return this.provider.set( this.#cache );
						}
					}
		}
	}

	// instantiate and pass it to the serviceworker for using it as facade
	self.CONFIG = new CONFIG() 
}