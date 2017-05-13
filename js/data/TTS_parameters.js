/*
 * TTS_parameters   
 *
 * RiddR default settings and parameters for non embed / external TTS engines 
 *
 * @package		RiddR
 * @category	Customization 
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

(function () 
{
	this.data.TTS_parameters = 
	{
		// OS native TTS engine 
		defaults : 
		{
			pitch 	: { min:   0, max: 2,  default: 1.0},
			rate 	: { min: 0.1, max: 10, default: 1.0},
			volume 	: { min:   0, max: 1,  default: 1.0},
		},

		// all Google Chrome embed TTS engines
		neajdppkdcdipfabeoofebfddakdcjhd : 
		{
			pitch 	: { min:   0, max: 2, default: 1.0},
			rate 	: { min: 0.1, max: 2, default: 1.0},
			volume 	: { min:   0, max: 1, default: 1.0},
		}
	}	

}).apply(RiddR);