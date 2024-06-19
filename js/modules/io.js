/*
 *
 * RiddR message broker used to enable comminication between RiddR internal modules and for external apps 
 *
 * @package		RiddR
 * @category	Messenger 
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

if( typeof IO !== 'function' )
{
	class IO 
	{
		queue 		= []; // message queue
		listeners 	= []; // registered event listeners from IO.on method
		channels 	= []; // communication channels

		UUID 		= crypto.randomUUID(); // context channel ID
		lastCH 		= null; // active channel ID
		channel 	= null; // last used communication channel
		context 	= this.#context(); // context environment in which the IO script is executing
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Define 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
		constructor( DOM )
		{

			// dynamicaly register background message handlers  
			if( this.#in('background') )
				chrome.runtime.onConnect.addListener( this.connect.bind(this) );

			else if( !this.#in('content') ) // open communication channel by default in all other contexts 
				this.connect();

			// if DOM is present register event listener for channel disconnection on reloading window
			if( DOM )
			{
				window.onbeforeunload 	= this.disconnect.bind(this);
				window.onpageshow = this.reconnect.bind(this)

			}

		}

		// send 
		init( ) { this.emit( 'load', this.context ); }
/*
 * ---------------------------------------------------------------------------------------------------------------------
 *  Public IO methods
 * 
 *  Initialize the extension by dispatcing the on.load event
 * ---------------------------------------------------------------------------------------------------------------------
*/
		// register multimodal event listener
		on ( EVENT, CALLBACK )
		{
			// create empty event opject if not allreayd registered 
			this.listeners[EVENT] ??= []

			// push the event and its callback to the event object
			this.listeners[EVENT].push( CALLBACK )
		}

		// syntax sugar for shorthad event emitting
		// eg. IO.emit('event'), ...('event', 'target'), ...('event', { object }, 'target' )
		emit( EVENT, DATA, TARGET )
		{
			this.dispatch
			( 
				EVENT, 
				typeof DATA !== 'object' ? {} : DATA, 
				typeof DATA === 'string' ? DATA : TARGET ?? 'background'
			);
		}

		// dispatch message to specific target
		dispatch ( EVENT, ARGS, TARGET )
		{
			// set message 
			let message = 
			{ 
				event 	: EVENT, 
				data 	: ARGS ?? [], 
				target 	: TARGET, 
				sender 	: this.context,
				senderID: this.UUID
			};

			// send message to the other extension modules
			if( TARGET != null )
			{
				if( TARGET != this.context )
				{
					if( this.#ready( message ) )
						this.#send( message )
					else
						this.queue.push(message); 			// or add it to the queue for delayed delivery
				}
				else // trigger local event listeners
					this.handler( message );
			}
		}

		// determine the right receiver and send the message
		#send ( MESSAGE )
		{
			// check if targeted communication exists
			if( this.channels[MESSAGE.target] )
				this.channels[MESSAGE.target].postMessage( MESSAGE );
			
			// if content script is targeted, target the one in active tab
			else if( MESSAGE.target === 'content' && this.channels[this.lastCH] )
				this.channels[this.lastCH].postMessage( MESSAGE );

			// broadcast the message to all channels
			else if( MESSAGE.target === 'global' )
				for ( const channel in this.channels )
					this.channels[channel].postMessage( MESSAGE );

			// failback to the last open channel
			else
				this.channel.postMessage( MESSAGE );
		}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 *  Public IO methods
 * 
 *  Open communuication channels between the extension contexts 
 * ---------------------------------------------------------------------------------------------------------------------
*/
		connect ( CHANNEL = null, TEST = null )
		{
			if( !this.channels[this.UUID] )
			{
				// attach to an existing or create new communication channel			
				this.channel = CHANNEL || chrome.runtime.connect( {name: this.#getID() } );

				// keep trakc of the opened channels
				this.channels[this.channel.name] = this.channel;

				// register message handlers
				this.channel.onMessage.addListener( this.handler.bind(this) );;
				this.channel.onDisconnect.addListener( this.onDisconnect.bind(this) );

				// process queued messages
				this.queued();
			}

			return this.UUID;
		}

		// hange the UUID to allow re-connection
		reconnect ( EVENT )
		{
			if( EVENT.persisted )
				this.UUID = crypto.randomUUID();
		}

		// message handler 
		handler( REQUEST, SENDER )
		{
			// execute local registered event listeners
			if( ( REQUEST.target == this.context || REQUEST.target == 'global' ) && this.listeners[REQUEST.event] )
					this.listeners[REQUEST.event].forEach( callback => callback( REQUEST.data ?? [] ) );
		}

		// 
		onDisconnect ( CHANNEL )
		{ 
			this.channel = null;

			delete this.channels[CHANNEL.name];
		}

		// 
		disconnect ()
		{
			this.channel.disconnect();
		}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 *  IO private method helpers
 * 
 *  determine the contenxt in which the IO module is located
 * ---------------------------------------------------------------------------------------------------------------------
*/	
		#context ()
		{
			if( location.protocol == 'chrome-extension:') // detect weither the is in extension page 
			{
				if( typeof window ===  'undefined' )
						return 'background';

				return location.pathname.split('/').pop().split('.')[0];
			}
			
			return 'content';
		}

		// validation for the right execution context
		#in ( CONTEXT )
		{
			return this.context === CONTEXT;
		}

		// determine if the communication channel for particular message delivery is ready
		#ready ( MESSAGE )
		{
			if 	( 	// if the message target exists or the target is global
					this.channels[ MESSAGE.target ] || MESSAGE.target == 'global' ||

					// or sending communication channel is open
					MESSAGE.senderID == this.channel?.name || MESSAGE.sender == this.channel?.name 
				)
					return true;

			// validate if the target has channel ready
			if( MESSAGE.target === 'content' && ( this.lastCH && this.channels[this.lastCH] ) )
				return true;

			// altertnatevly push the message to the queue
			return false;
		}

		// get channel ID/name 
		#getID ()
		{
			if( this.context === 'content' )
				return this.UUID;

			return this.context;
		}

		// process delayed/queued messages
		queued ()
		{
			// send queued messages once the channel is established
			this.queue.forEach( ( message ) => { 
													this.#send( message ) 
												});

			// reset the queue as the messages has been sent
			this.queue = [];
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 *  IO modile instantiation
 * 
 *  Determine the contenxt in which the IO module is located and make the propper instantiation
 *  this allows the module to be run in service worker as ES modules via facades or IIFE modules
 * ---------------------------------------------------------------------------------------------------------------------
*/
	if( typeof ServiceWorkerGlobalScope === 'function' )
		self.IO = new IO() // instantiate and pass it to the serviceworker for using it as facade
	else
	{
		// alternatevley the IO module is loaded in non-ES module context
		window.IO = new IO( true );
	}
}