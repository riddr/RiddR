/*
 * RiddR Options Error module
 *
 * Handle various errors and notifications in the RiddR options page
 *
 * @package		RiddR
 * @category	Options
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/options/error.js
*/

// import UI router
import UI from './UI.js';

class Error
{
	// display error modal 
	show ( MESSAGE )
	{
		let template = `<div id="error">
						<i class="material-icons">warning</i>
						<h1>Oh snap!</h1>
						<h2>${MESSAGE}</h2>
						<p id="close" class="modal_close">Dismiss</p>
					</div>`;

		// show the error
		UI.modal.show( template );
	}
}

export default new Error();