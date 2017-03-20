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
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Show snackbar notification
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _snackbar = function( message,  duration = 3000 )
	{
		// update snackbar content
		$('.snackbar').html(message);
		$('.snackbar').addClass('active');

		// hide shackbar after some time
		var snackTimeout = setTimeout(function()
		{
			$('.snackbar').removeClass('active');
		},duration);

		// or on click on the document
		$(document).on('mousedown', function( event )
		{
			$('.snackbar').removeClass('active');
			$(this).unbind( event );
			clearTimeout(snackTimeout);
		})
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Initalize UI elements event listerners 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _load_ui_event_listeners = function()
	{
		// test TTS audio 
		$(document).on('click','#test_btn', function()
		{
			RiddR.options.test_speech($("#utterance").val());
		});

		$('.modal > div').on('click', function(e) {
		    e.stopPropagation();
		});		

		$(document).on('click', '.keys', function()
		{
			$('.modal').css({'opacity':'1', 'z-index': 999999 })

			content = $('.modal > div > div');

			y = $(window).height()/2 - content.height()/2;
			left = $(window).width()/2 - content.width()/2;


			$('.modal > div').delay(1000).css({'width': content.width(), 'height': content.height(), 'top' : y, 'left' : left });

			$(document).on('click', function( event )
			{
				$('.modal > div').css({'width': 0, 'height': 0, 'top' : '50%', 'left' : '100%'});

				setTimeout(function(){
					$('.modal').css({'opacity':'', 'z-index': -999 });
					$('.modal > div').css({'width': 0, 'height': 0, 'top' : '50%', 'left' : '0%'});
				},500)

				$(this).unbind(event);
			});
		});
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Initialize material design listeners
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _materialize = function()
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
			range = $(this).is('label')? $(this).next() : $(this);

			if(range.is(":active"))
			{
				// calucate thumb position based on element position
				offset =  ((range.outerWidth()-30) / range.attr('max') * range.val());

				// update thumb value and move the thumb to the coresporending position
				range.next()
					.attr('slider-value',range.val())
					.css( "left", offset+'px' );
			};
		});

		// Set selectbox UI listeners
		$(document).on('mousedown','select', function( event )
		{	
			var select = $(this);
			var dropdown = $("<ul></ul>");

			// generate custom dropdown menu if it is not allready generated
			if( select.parent().has('ul').length == 0 )
			{
				select.find('option').each(function() {
					dropdown.append('<li>'+$(this).val()+'</li>');
				});

				select.parent().append(dropdown);
			}

			// get full dropdown element
			dropdown = $(this).next();

			// determine dropdown position
			dtop 	= select.offset().top,
			height 	= $(document).height() - dtop - 25;

			if(height < 200) // update the dropdown size and posotion if it's to small 
			{
				dtop = 75;
				height = $(document).height() - 100;
				dropdown.css({'top' : select.offset().top}); // set primary position to improve element transition
			}

			// update the dropdown menu position
			dropdown.css(
			{
				'top' 		: dtop,
				'min-width' : $(this).width(),
				'height'	: height
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
					$(select).find("[selected]").removeAttr('selected'); 
					$(select).find("option:contains('"+$(event.target).html()+"')").attr('selected','selected');

					// remove previous selections from the custom dropwown menu
					$(select).next().find('[selected]').removeAttr('selected');
					$(event.target).attr('selected','');
				}

				// remove active atribut, desdtroy the event listener and force height
				$(this).unbind( event );
				dropdown.css({'height':0, 'top': select.offset().top});
				$('[active]').removeAttr('active');
			});

			return false;
		});
	
		// Set listeners for new custom shortuct button		
		$(document).on('click', '#add_shortcut', function()
		{
			$("#shortcuts").append(RiddR.options.html.shortuct());

			// scroll to bottom of the container
			$("content section:nth-child(2)").scrollTop($("content section:nth-child(2)").prop("scrollHeight"));
		});

		// Set scroll listeners for the sticky headers				
		$('section').on('scroll', function()
		{
			sticky = $('.sticky');

			// set stick tipping point
			if(sticky.not('[stick-from]').length != 0)
				sticky.attr('stick-from', sticky.position().top );

			if($(this).scrollTop() >= sticky.attr('stick-from'))
				sticky.addClass('stick');
			else
				sticky.removeClass('stick');
		});
	}
/*
 * ---------------------------------------------------------------------------------------------------------------------
 * 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	RiddR.options.UI = 
	{
		load : function()
		{
			// initialize material design listeners
			_materialize();

			// initalize UI elements event listerners 
			_load_ui_event_listeners();

			// hide the preloader
			$('.preloader').fadeOut();
		},

		snackbar: _snackbar
	}

}).apply( RiddR );