/*
 * RiddR TTS controler 
 *
 * Load all TTS voices and handle all TTS engine requests
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

(function () 
{
	this.TTS = 
	{
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Define basic public TTS variables
 * ---------------------------------------------------------------------------------------------------------------------
*/	
		embed   : {},
		engines : {},
		engine 	: null,
		state 	: 'end',
		path	: '/js/TTS/',
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Define TTS Engine event callbacks 
 * ---------------------------------------------------------------------------------------------------------------------
*/		
		events : 
		{
			onSpeak : function( utterance, options, TTS_response ) 
			{
				if( _probe_TTS(options) ) // probe selected TTS engine
					RiddR.TTS.engine.speak( utterance, options, TTS_response );
			},

			onStop	: function()
			{
				if(_valid_TTS_request('stop'))
					RiddR.TTS.engine.stop();
			},

			onPause	: function()
			{
				if(_valid_TTS_request('pause'))
					RiddR.TTS.engine.pause();
			},

			onResume : function()
			{
				if(_valid_TTS_request('resume'))
					RiddR.TTS.engine.resume();
			}
		},

		// send interrupt event and reset Chrome TTS API   @To-Do: file a bug to Google regards this
		onLoad : function()
		{
			chrome.tts.stop();			
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Validate TTS event request
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _valid_TTS_request = function ( action )
	{
		if( RiddR.TTS.engine == null || RiddR.loaded === false ) // prevent sending requests before extension is loaded
			return false;
		else
		{
			switch( action ) // validate action per request type in order to avoid TTS engine errors
			{
				case 'stop':
					if( RiddR.TTS.state == 'resume' || RiddR.TTS.state == 'pause' || RiddR.TTS.state == 'start' )
						return true;
				break;

				case 'pause':
					if( RiddR.TTS.state == 'start' || RiddR.TTS.state == 'resume' )
						return true;
				break;

				case 'resume':
					if( RiddR.TTS.state == 'pause' )
						return true;
				break;
			}

			return false;
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Probe TTS engine and validate the current request
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _probe_TTS = function ( options )
	{

		if( RiddR.TTS.engine == null || RiddR.TTS.engine.name != options.voiceName ) // check if new TTS engine is called
		{
			if(RiddR.TTS.embed[options.voiceName] !== undefined) // check if the requested TTS engine is loaded
			{	
				// gracefully stop old TTS engine if playing
				RiddR.TTS.events.onStop();

				// set current TTS engine
				RiddR.TTS.engine = RiddR.TTS.embed[options.voiceName]; 
			}
			else
				return false;
		}

		return true;
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Validate TTS event request
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _load_TTS_engine = function ( voice, callback )
	{
		RiddR.load(RiddR.TTS.path+voice.voiceName+'.js', callback , voice );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register all avaliable TTS engines and load their parameter values 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _register_TTS_engine = function ( engine, embed = false )
	{
		// define TTS engine selection key based on ID or it's NAME 
		o_key = engine.extensionId || engine.voiceName;

		// assign embed parameters if defined
		if( embed && RiddR.TTS.embed[engine.voiceName].parameters )
		{
			engine = Object.assign( engine, RiddR.TTS.embed[engine.voiceName].parameters )
		}
		else if ( RiddR.data.TTS_parameters[o_key] ) // otherwise try to assign predefined parameters
			engine = Object.assign( engine, RiddR.data.TTS_parameters[o_key] );
		else
			engine = Object.assign ( engine,  RiddR.data.TTS_parameters.defaults )

		// register the TTS engine
		RiddR.TTS.engines[engine.voiceName] = engine;
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Define default TTS engine listeners before TTS engines are loaded
 * ---------------------------------------------------------------------------------------------------------------------
*/
	chrome.ttsEngine.onSpeak.addListener(this.TTS.events.onSpeak);
	chrome.ttsEngine.onStop.addListener(this.TTS.events.onStop);
	chrome.ttsEngine.onPause.addListener(this.TTS.events.onPause);
	chrome.ttsEngine.onResume.addListener(this.TTS.events.onResume);

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Load all built in TTS engines and register all installed TTS engines
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	chrome.tts.getVoices( function( voices )
	{
		for( voice_id in voices )
		{
			if(voices[voice_id].extensionId == chrome.runtime.id )
			{
				_load_TTS_engine(voices[voice_id], function ( engine )
				{
					_register_TTS_engine( engine, true );
				});
			}
			else
				_register_TTS_engine( voices[voice_id] );
		}
	});

}).apply(RiddR);