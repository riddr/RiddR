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
		// 
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

		// instantiate the storage controller
		constructor ()
		{
			// sync storage data
			this.sync();

			// register data syncing event listener
			chrome.storage.onChanged.addListener( this.sync.bind(this) )

			// return the proxied 
			return new Proxy( this, this.handler() );
		}

		// storage magic router
		handler ()
		{ 
			return 	{
						get: ( TARGET, NAME, RECEIVER ) => 
						{
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
						}
					}
		}

		// synchronize stored data from chrome storagee
		sync ()
		{
			this.provider.get().then( DATA => 
			{
				this.#cache = { ... this.#defaults, ... this.#cache, ... DATA };
			})
		}

	}

	// instantiate and pass it to the serviceworker for using it as facade
	self.CONFIG = new CONFIG() 
}