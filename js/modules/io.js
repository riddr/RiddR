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

/*if( typeof IO !== 'function' )
{*/
	class IO 
	{

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Define 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
		constructor()
		{
			console.log('construct');

			this.listeners = []

			this.context = this.#context();

			// register message handler
			chrome.runtime.onMessage.addListener( this.handler.bind(this) );

			// register content script commumication
			chrome.runtime.onConnect.addListener( this.content.bind(this) );
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

			// execute local registered event listeners
			if( this.listeners[event] )
				this.listeners[event].forEach( callback => callback( args ) );

			// send message to the other extension modules
			if( target != null && target != this.context )
			{
				chrome.runtime.sendMessage( message );

				// send message to the content scripts
				if ( target == 'content' || target == 'global' )
					chrome.tabs.query({active: true, currentWindow: true}, function( tabs ) 
					{
						chrome.tabs.sendMessage(tabs[0].id, message );
					});	
			}
		}

		// syntax sugar for shorthad event emitting
		// eg. IO.emit('event'), ...('event', 'target'), ...('event', { object }, 'target' )
		emit( EVENT, DATA, TARGET )
		{
			this.dispatch
			( 
				EVENT, 
				typeof DATA !== 'object' ? {} : DATA, 
				typeof DATA === 'string' ? DATA : TARGET ?? 'global'
			);
		}

		// message handler 
		handler( request, sender, callback )
		{
			console.log( request );

			if( request.target == this.context || request.target == 'global' )
				this.dispatch( request.event, request.data || [] );
		}

		content ( port )
		{
			console.log(port);

			  port.onMessage.addListener(function(msg) 
			  {
			  	console.log(msg);

			    if (msg.action === "sendMessageToContent") {
			      port.postMessage({ action: "messageFromBackground", data: 'wazap mate' });
			    }
			  });
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

	export default new IO();


/*// IO intitialization
// determine in which context is the document loaded 
	if( typeof ServiceWorkerGlobalScope === 'function' )
		self.IO = new IO() // instantiate and pass it to the serviceworker for using it as facade
	else
	{
		// alternatevley the IO module is loaded in non-ES module context
		window.IO = new IO();
	}

}*/