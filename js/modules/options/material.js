/*
 * RiddR Material UI Module
 *
 * Provides functionality for transforming UI elements with Material Design-inspired interactions,
 * including navigation sliders, custom range inputs, dropdown menus, disabled element feedback,
 * and sticky headers.
 *
 * @package		RiddR
 * @category	Options
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/options/material.js
*/

import UI from './UI.js';


class Material
{
	transform()
	{
		// set navigation listeners
		$(document).on("click", "nav ul li",function()
		{
			// move the navigation bar and update it's width
			$(".slider").css({'width': $(this).outerWidth(), 'left': $(this).position().left });
			// move the tab content
			$("content section:eq(0)").css({'margin-left':'calc(-'+$("nav ul li").index(this)*100+'%)'});
		});

		// set range element UI listeners
		$(document).on("input mousedown click", "[type=range], .range > label", function( event )
		{
			// determine if the label or the range itself was clicked
			let range = $(this).is('label')? $(this).next() : $(this);

			if(range.is(":active") )
			{
				// calucate thumb position based on element position
				let offset =  ((range.outerWidth()-30) / (range.attr('max') - range.attr('min')) * (range.val()-range.attr('min')));

				// update thumb value and move the thumb to the coresporending position
				range.next()
					.attr('slider-value',range.val())
					.css( "left", offset+'px' );
			};
		});

		// Set selectbox UI listeners
		$(document).on('mousedown','select', function( event )
		{
			let select 	 = $(this);
			let dropdown = ( select.next().length == 0 ) ? $("<ul></ul>") : select.next();

			// generate custom dropdown menu if it not generated or updated 
			if( dropdown.text().length == 0 || select.attr('updated') ) // avoid unnecessary DOM requests
			{
				// clear out the dropdown menu
				dropdown.html('');

				select.find('option').each(function() 
				{
					dropdown.append('<li>'+$(this).attr('display')+'</li>');
				});

				if( select.parent().has('ul').length == 0 )
					select.parent().append(dropdown);
				else
					select.next().replaceWith(dropdown);
				
				// remove updated attribute once the dropdown menu is generated. 
				select.removeAttr('updated');

				// get newly generated menu
				dropdown = $(this).next();
			}

			// determine dropdown position
			let dtop    = select.offset().top,
			height  =  ( $(document).height() < dropdown[0].scrollHeight )? $(document).height() - dtop - 25 : dropdown[0].scrollHeight;

			if( height < 200 && height < dropdown[0].scrollHeight ) // update the dropdown size and posotion if it's to small 
			{
				dtop = 75;
				height = $(document).height() - 100;
				dropdown.css({'top' : select.offset().top}); // set primary position to improve element transition
			}

			// update the dropdown menu position
			dropdown.css(
			{
				'top'       : dtop,
				'min-width' : $(this).width(),
				'height'    : height,
				'z-index'   : 999
			}).attr('active', '');

			// prevent native dropdown menu from showing 
			this.blur();
			$(window).focus();
			event.preventDefault();

			// create additional event listener for closing the dropdown
			$(document).on('mousedown', function( event )
			{
				// compare if the clicked element was some from the dropdown menu
				if( $(event.target).parent()[0] == select.next()[0] )
				{
					// remove previous selections in options element and update the selected element
					$(select).find("[selected]").prop('selected',false); 
					$(select).find('option').filter(function()
					{
						return $(this).attr('display') === $(event.target).text()
					}).prop('selected',true);

					// remove previous selections from the custom dropwown menu
					$(select).next().find('[selected]').removeAttr('selected');
					$(event.target).attr('selected','');

					// trigger on change event 
					$(select).trigger("change");
				}

				// remove active atribut, desdtroy the event listener and force height
				$(this).unbind( event );
				dropdown.css({'height':0, 'z-index': '-1', 'top': select.offset().top});
				$('[active]').removeAttr('active');
			});

			return false;
		});

		// show information for disabled option elements 
		$(document).on('mousedown','.material', function()
		{
			if( $(this).has(":disabled").length > 0 )
			{
				let message = $(this).data('message') || 'TTS engine dosen\'t support this feature.';
				setTimeout(function(){ UI.snackbar.show(message) },10);
			}

		});

		// Set scroll listeners for the sticky headers              
		$('section').on('scroll', function()
		{
			let sticky = $('.sticky');

			// set stick tipping point
			if(sticky.not('[stick-from]').length != 0)
				sticky.attr('stick-from', sticky.position().top );

			if($(this).scrollTop() >= sticky.attr('stick-from'))
				sticky.addClass('stick');
			else
				sticky.removeClass('stick');
		});
	}
}

export default new Material();