/*
 * IO  
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

		port 		= null;
		context 	= null;
		listeners 	= [];
		queue 		= [];

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Define 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
		constructor()
		{
			// determine the context mode 
			this.context = this.#context();

			// dynamicaly register background message handlers  
			if( this.context === 'background' )
				chrome.runtime.onConnect.addListener( this.connect.bind(this) );
			else // open communication channel
				this.connect();
		}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 *  Public IO methods
 * 
 *  Initialize the extension by dispatcing the on.load event
 * ---------------------------------------------------------------------------------------------------------------------
*/	
		init( )
		{
			this.dispatch( 'load', [], this.context );
		}

		// register multimodal event listener
		on ( event, callback )
		{
			// create empty event opject if not allreayd registered 
			this.listeners[event] = this.listeners[event] || []

			// push the event and its callback to the event object
			this.listeners[event].push( callback )
		}

		// dispatch event to specific target
		dispatch ( event, args, target )
		{
			// set message 
			let message = 
			{ 
				event: event, 
				data: args ?? [], 
				target: target, 
				sender: this.context 
			};

			// send message to the other extension modules
			if( target != null )
			{
				if( target != this.context )
				{
					if( this.port !== null ) 
						this.port.postMessage( message ); 	// send the message directly
					else
						this.queue.push(message); 			// or add it to the queue for delayed delivery
				}
				else // trigger local event listeners
					this.handler( message );
			}
		}

		// syntax sugar for shorthad event emitting
		// eg. IO.emit('event'), ...('event', 'target'), ...('event', { object }, 'target' )
		emit( EVENT, DATA, TARGET )
		{
			console.log(EVENT);

			this.dispatch
			( 
				EVENT, 
				typeof DATA !== 'object' ? {} : DATA, 
				typeof DATA === 'string' ? DATA : TARGET ?? 'global'
			);
		}

		// message handler 
		handler( request, sender )
		{
			// execute local registered event listeners
			if( ( request.target == this.context || request.target == 'global' ) && this.listeners[request.event] )
					this.listeners[request.event].forEach( callback => callback( request.data ?? [] ) );
		}

		// open communuication channels between the extension contexts 
		connect ( PORT = null )
		{
			// attach to an existing or create new communication channel			
			this.port = ( PORT === null ) ? chrome.runtime.connect( {name: "RiddR"} ) : PORT;

			// register message handker
			this.port.onMessage.addListener( this.handler.bind(this) );;

			// register channel disconection 
			this.port.onDisconnect.addListener( () => { this.port = null } );

			// process queued messages
			this.queued();
		}


		// process delayed/queued messages
		queued ()
		{
			// send queued messages once the channel is established
			this.queue.forEach( ( message ) => { 
													this.port.postMessage( message ) 
												});

			// reset the queue as the messages has been sent
			this.queue = [];
		}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 *  Provider IO helpers
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
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 *  Provider IO helpers
 * 
 *  determine the contenxt in which the IO module is located
 * ---------------------------------------------------------------------------------------------------------------------
*/
	if( typeof ServiceWorkerGlobalScope === 'function' )
		self.IO = new IO() // instantiate and pass it to the serviceworker for using it as facade
	else
		// alternatevley the IO module is loaded in non-ES module context
		window.IO = new IO();
}