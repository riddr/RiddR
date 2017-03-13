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
		engines : {},
		engine 	: null,
		path	: '/js/TTS/',
		state 	: 'end',
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
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Validate TTS event request
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	function _valid_TTS_request( action )
	{
		if( RiddR.TTS.engine == null || RiddR.loaded === false ) // prevent sending requests before extension is loaded
			return false;
		else
		{
			switch( action ) // validate action per request type in order to avoid TTS engine errors
			{
				case 'stop':
					if( RiddR.TTS.state == 'speaking' || RiddR.TTS.state == 'pause' || RiddR.TTS.state == 'start' )
						return true;
				break;

				case 'pause':
					if( RiddR.TTS.state == 'speaking' || RiddR.TTS.state == 'start' )
						return true;
				break;

				case 'resume':
					if( RiddR.TTS.state == 'paused' )
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
	function _probe_TTS( options )
	{

		if( RiddR.TTS.engine == null || RiddR.TTS.engine.name != options.voiceName ) // check if new TTS engine is called
		{
			if(RiddR.TTS.engines[options.voiceName] !== undefined) // check if the requested TTS engine is loaded
			{	
				// gracefully stop old TTS engine if playing
				RiddR.TTS.events.onStop();

				// set current TTS engine
				RiddR.TTS.engine = RiddR.TTS.engines[options.voiceName]; 
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
	function _load_TTS_engine( voice )
	{
		RiddR.load(RiddR.TTS.path+voice.voiceName+'.js');
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
 * Load all built in TTS engines
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	chrome.tts.getVoices( function( voices )
	{
		for( voice_id in voices )
		{
			if(voices[voice_id].extensionId == chrome.runtime.id )
				_load_TTS_engine(voices[voice_id]);
		}
	});

}).apply(RiddR);