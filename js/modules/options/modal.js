/*
 * RiddR Modal UI Module
 *
 *  Manages the display and hiding of modal dialogs with animated transitions,
 * including content positioning and event handling for user interactions.
 *
 * @package		RiddR
 * @category	Options
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/options/modal.js
*/

class Modal
{
	show ( content , callback )
	{
		let modal = $('.modal'), 
			modal_content_holder = $('.modal > div');

		if(modal.css('opacity') > 0 ) // check if modal is opened
			this.hide_modal( callback );
		else // show modal 
		{
			modal_content_holder.html(content);
			let modal_content = $('.modal > div > div');

			let y = $(window).height()/2 - modal_content.outerHeight()/2;
			let x = $(window).width()/2 - modal_content.outerWidth()/2;

			// animate the modal        
			modal.css({'opacity':'1', 'z-index': 999999 })
			modal_content_holder.css(
			{
				'width': modal_content.outerWidth(), 'height': modal_content.outerHeight(), 
				'top' : y, 'left' : x 
			});

			// prevent onclick action just for the content within the modal
			modal_content_holder.on('click', function( event ) 
			{
				if( event.target.id != "close" ) 
					event.stopPropagation();
			});

			// hide modal if some elswere is clickedr
			$(document).on('click', '.modal, .modal_close',function( event )
			{
				this.hide( callback );
			}.bind(this) );
		}
	}


	hide ( callback )
	{
		let modal = $('.modal'), 
			modal_content_holder = $('.modal > div');

		if(modal.css('opacity') > 0 ) // check if modal is opened
		{
			modal_content_holder.css(
			{
				'width': 0, 'height': 0, 
				'top' : '50%', 'left' : '100%'
			});

			// set elements to their original position after the animation is done 
			setTimeout( function()
			{
				modal.css({'opacity':'', 'z-index': -999 });
				modal_content_holder.css({'width': 0, 'height': 0, 'top' : '50%', 'left' : '0%'});

			}, parseFloat(modal_content_holder.css('transition-duration'))*1000 ) // get animation duration from 


			// remove event listeners
			modal.off('click');
			modal_content_holder.off('click');

			// execute the callback
			if(typeof callback === 'function')
				callback();
		}
	}
}

export default new Modal();