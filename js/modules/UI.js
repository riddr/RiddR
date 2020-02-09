/*
 * UI
 *
 * RiddR chrome UI / browser actions controll module
 *
 * @package		RiddR
 * @category	UI 
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR/blob/master/js/modules/UI.js
*/

(function () 
{

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * UI public accessible methods 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	this.UI = 
	{
	};

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * UI EVENT HANDLERS 
 * 
 * Handle RiddR TTS state and modify browser UI accordingly 
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _TTS_handler = function ( state )
	{
		switch ( state.type )
		{
			case 'start':

				if ('mediaSession' in navigator)  // set media metadata if mediaSession API is supported
					_set_media_metadata();
			break;
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * UI private methods
 *
 * Set media session metadata ( those fancy looking OS & Browsr controls ) 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _set_media_metadata = function ()
	{
		chrome.tabs.query // fetch the data from the Tab which invoked RiddR and get it's title
		(
			{ active: true, currentWindow: true }, // select only active tab that it opened in the current window
			( TAB ) => 
			{
				navigator.mediaSession.metadata = new MediaMetadata
				({
					title: RiddR.__('nowReading'),
					artist: TAB[0].title,
					artwork: 
					[
						{ src: 'https://riddr.com/static/img/mediaicon-512.png', sizes: '512x512', 	type: 'image/png' },
						{ src: 'https://riddr.com/static/img/mediaicon-256.png', sizes: '256x256', 	type: 'image/png' },
						{ src: 'https://riddr.com/static/img/mediaicon-128.png', sizes: '128x128', 	type: 'image/png' },
						{ src: 'https://riddr.com/static/img/mediaicon-64.png',  sizes: '64x64', 	type: 'image/png' },
					]
				});
			}
		);
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * UI event listeners registration
 *
 * handle TTS state update
 * ---------------------------------------------------------------------------------------------------------------------
*/ 
	RiddR.on('onTTSupdate', function( event )
	{
		_TTS_handler( event.detail );
	});

}).apply(RiddR);