/*
 * Internationalization 
 *
 * Localize RiddR UI to the native language of the user if there is supported locale 
 *
 * @package		RiddR
 * @category	Internationalization 
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

class i18n 
{

	locale 		= chrome.i18n.getUILanguage(); // get UI locale

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register various i18n methods
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	lang 		= this.#detect; // get UI locale
	translate 	= this.#translate; // translate text/utterance to specific language

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Register the i18n module magic handler that will allow us to make such references i18n.some-key
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	constructor ()
	{
		// return the proxied 
		return new Proxy( this, this.handler() );
	}

	// storage magic router 
	handler ()
	{ 
		return 	{
					get: ( TARGET, NAME, RECEIVER ) => 
					{
						return this[NAME] ?? chrome.i18n.getMessage(NAME)
					}
				}
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * i18n language detection and translation methods
 * 
 * Detect the language of the selected utterance and determine the reading language
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	async #detect ( UTTERANCE, LANG = 'auto' )
	{
		const result = await chrome.i18n.detectLanguage( UTTERANCE )

		// extract tje detected language
		const [detected] = result.languages;

		// return the language object 
		return {
					request: LANG,
					detected: detected.language,
					local: this.locale.startsWith( detected.language ) ? this.locale : detected.language,

					// determine the reading language
					get read(){ return ( this.request == 'auto' )? this.local : this.request }
		}
	}

	// translate utterance to specified language
	async #translate ( UTTERANCE, LANG )
	{
		return UTTERANCE;
	}
}

export default new i18n();
