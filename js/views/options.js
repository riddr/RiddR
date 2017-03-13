/*
 * RiddR
 *
 * TTS Engine named RiddR build in into the same named extension, based on unofficial Google API's 
 *
 * @package		RiddR
 * @category	Core
 * @author		Trajche Petrov
 * @link		https://github.com/skechboy/RiddR
*/

(function () 
{
	// extendd RiddR global options object 
	this.options = 
	{
		// set default options
		TTS_engine 		: 'RiddR',
		enquene 		: true,
		volume			: 1,
		rate 			: 1,
		pitch 			: 1,
		auto_test 		: true,
		language 		: 'en-US',
		shortcuts 		: {},
		transcribe 		: true,
		transcription  	: { "riddr"	: "reader" },


		// register several global options functions
		onLoad : function()
		{
			_load_ui();
		},

		addShortcut: function()
		{
			return '<ul><li><div class="keys" id="kb-read"><span key="alt">Alt</span><span key="shift">Shift</span><span>R</span></div></li><li> <div class="material select stripped"> <select id="language"> <option>Autodetection</option> <option>England</option> <option>France</option> <option>Switzerland</option> <option>Macedonia</option> <option>Greece</option> <option>United States</option> <option>New Zeland</option> <option>Germany</option> </select> </div> </li> <li> <div class="material select stripped"> <select id="language"> <option>Autodetection</option> <option>England</option> <option>France</option> <option>Switzerland</option> <option>Macedonia</option> <option>Greece</option> <option>United States</option> <option>New Zeland</option> <option>Germany</option> </select> </div> </li> <li> <div class="material switch stripped"> <input id="auto-test" type="checkbox" checked="checked"/> <span></span> </div> </li> <li> <div class="material select stripped"> <select id="language"> <option>Autodetection</option> <option>England</option> <option>France</option> <option>Switzerland</option> <option>Macedonia</option> <option>Greece</option> <option>United States</option> <option>New Zeland</option> <option>Germany-ala-bala-mala-sala</option> </select> </div> </li><li></li></ul>'
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Save specific change in the options 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	_save = function()
	{
		console.log('Options saved');
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Save specific change in the options 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	_load = function()
	{
		chrome.storage.sync.get(RiddR.options, function(items)
		{
			console.log(items);
		})
	}


/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Dynamic element generator methods
 * generate forms, dropdown menus, language menus etc. 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	_html = 
	{
		kb_keys : 'QWERTYUIOPASDFGHJKLZXCVBNM',

		// generate keyboard shortcut html
		shortcut : function( keys )
		{
			tmp_html = '';
			html = '<div class="keys">{keys}</div>';

			// generate random key if nesecery
			keys = keys || ['Alt','Shift',this.kb_keys[Math.floor(Math.random() * this.kb_keys.length)]];

			for( id in keys )
			{
				tmp_html += '<span key="'+keys[id].toLowerCase()+'">'+keys[id]+'</span>';

				this.kb_keys = this.kb_keys.replace(keys[id], '');
			}

			return html.replace('{keys}',tmp_html);
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * SET UI EVENT LISTENERS
 *
 * Opions navigation
 * ---------------------------------------------------------------------------------------------------------------------
*/
	// load options UI when the DOM is loaded
	_load_ui = function()
	{	
		_load();

		// show content when it is loaded
		$('.preloader').hide();
	}

}).apply(RiddR);