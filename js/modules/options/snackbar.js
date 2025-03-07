/*
 * RiddR Snackbar UI Module
 *
 * Displays temporary notification messages (snackbars) with customizable duration
 * and automatic or manual dismissal via click.
 *
 * @package		RiddR
 * @category	Options
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/options/snackbar.js
*/

class Snackbar
{
	show ( MESSAGE, DURATION = 3000 )
	{
		// update snackbar content
		$('.snackbar').html(MESSAGE);
		$('.snackbar').addClass('active');

		// hide shackbar after some time
		var snackTimeout = setTimeout(function()
		{
			$('.snackbar').removeClass('active');
		}, DURATION );

		// or on click on the document
		$(document).on('mousedown', function( event )
		{
			$('.snackbar').removeClass('active');
			$(this).unbind( event );
			clearTimeout(snackTimeout);
		})
	}
}

export default new Snackbar();