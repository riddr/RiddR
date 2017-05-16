/*
 * RiddR
 *
 * TTS Engine named RiddR build in into the same named extension, based on unofficial Google API's 
 *
 * @package     RiddR
 * @category    Core
 * @author      Trajche Petrov
 * @link        https://github.com/skechboy/RiddR
*/

(function () 
{
	var modal_event;
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
 * Show / hide modal   @To-Do: randomize animation entrance from left and right
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _modal = function( content , callback )
	{
		var modal = $('.modal'), 
			modal_content_holder = $('.modal > div');

		if(modal.css('opacity') > 0 ) // check if modal is opened
			_hide_modal( callback );
		else // show modal 
		{
			modal_content_holder.html(content);
			modal_content = $('.modal > div > div');

			y = $(window).height()/2 - modal_content.outerHeight()/2;
			x = $(window).width()/2 - modal_content.outerWidth()/2;

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
				event.stopPropagation();
			});

			// hide modal if some elswere is clickedr
			$(document).on('click', '.modal',function( event )
			{
				_hide_modal( callback );
			});
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Hide modal 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _hide_modal = function( callback )
	{
		var modal = $('.modal'), 
			modal_content_holder = $('.modal > div');

		modal_content_holder.css(
		{
			'width': 0, 'height': 0, 
			'top' : '50%', 'left' : '100%'
		});

		// set elements to their original position after the animation is done 
		setTimeout(function()
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
			RiddR.options.test_speech( $("#utterance").val(), RiddR.options.UI.reading );
		});

		$(document).on('change', "input[type=checkbox]", function()
		{
			RiddR.options.save( $(this).attr('id'),  this.checked );
		})

		$(document).on('change', "input[type=range]", function()
		{
			RiddR.options.save( $(this).attr('id'), parseFloat($(this).val()) );
		})

		$(document).on('change', "select", function()
		{
			RiddR.options.save( $(this).attr('id'), $(this).val() );
		})
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

			if(range.is(":active") )
			{
				// calucate thumb position based on element position
				offset =  ((range.outerWidth()-30) / (range.attr('max') - range.attr('min')) * (range.val()-range.attr('min')));

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
					dropdown.append('<li>'+$(this).attr('display')+'</li>');
				});

				select.parent().append(dropdown);
			}

			// get full dropdown element
			dropdown = $(this).next();

			// determine dropdown position
			dtop    = select.offset().top,
			height  = $(document).height() - dtop - 25;

			if(height < 200) // update the dropdown size and posotion if it's to small 
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
				setTimeout(function(){_snackbar('TTS engine dosen\'t support this feature.');},10);

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
 * UI HTML generation methods
 *
 * Generate TTS engine list
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _generate_tts_list = function (  selected, truncate = 25, html = '' )
	{
		for ( engine in RiddR.TTS.engines )
		{
			html += '<option display="'+engine+'" '+( ( engine == selected )? 'selected' : '' )+' value="'+engine+'">'+engine.truncate(truncate)+'</option>'            
		}

		return html;
	}

	// update TTS engine parametrs   @To-Do: make this function more roubst in order to handle keyboard shortcuts sliders
	var _update_tts_parameters = function( engine ) 
	{
		// update TTS sliders
		$('#rate, #pitch').each(function()
		{
			// hide parameter slider if it's not supported from TTS engine
			if( engine[this.id] == undefined || engine[this.id] == null )
				$(this).prop('disabled', true);
			else
			{
				$(this).prop('disabled', false);

				// update slider min and max positions
				$(this).attr({'min':engine[this.id].min, 'max':engine[this.id].max});
				
				// update slider value accodring TTS engine capabilities
				current = 
				( 
					RiddR.storage.get(this.id) > engine[this.id].max || 
					RiddR.storage.get(this.id) < engine[this.id].min 
				) 
					? engine[this.id].default 
					: RiddR.storage.get(this.id);
				
				$(this).next().attr('slider-value', current);
				$(this).val(current);
			}
		});

		// update language list depending on supported languages from the TTS engine
		_language_list( engine.lang, 'language' );

		// update translate checkbox
		_update_lang_translate();
	}

	// update language select list
	var _language_list = function ( languages , list_elem_id , list_html = '')
	{
		// form valid language array
		languages = (languages == undefined )?  ['auto'] : languages;
		languages = ( typeof languages == 'string' )? [languages] : languages;

		// check if automatic detection is avaliable for the selected TTS engine
		if(languages.length > 1 && languages.indexOf('auto') == -1)
			languages.unshift('auto');

		// form language list
		for( i in languages)
		{
			// get language from it's code
			if ( language = RiddR.lang_from_code ( languages[i] ) )
			{
				// determine if the language option should be preselected
				selected = (language.code == RiddR.storage.get('language'))? 'selected' : '';

				list_html += '<option display="'+language.name+'" '+selected+' value="'+language.code+'">'+language.name+'</option>';
			}
		}
	
		// update list content
		$('#'+list_elem_id).html( list_html );

		// disable / enable dropdown list
		$('#'+list_elem_id).prop('disabled', (languages.length == 1) );
	}

	// update the state of language translate button
	var _update_lang_translate = function ()
	{
		$("#translate").prop('disabled',  (RiddR.storage.get('language') == 'auto') );
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * UI SHORTCUTS RELATED FUNCTIONS 
 * 
 * Generate global keyboard shortcuts / commands  
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _render_global_commands = function ()
	{
		for( cmd_id in RiddR.options.commands )
		{
			command = RiddR.options.commands[cmd_id];

			// form shortcut html 
			shortcut_html = `<div class="material"> 
								<label for="kb-read">`+RiddR.__('shortcut_'+command.name)+`</label> 
								<div class="keys" id="kb-read">`
									+ _get_shortcut_keys( command.shortcut ) +
							`	</div>
							</div>`;

			// push shortcut html into shortcut container element 
			$("#global-shortcuts-container").append( shortcut_html );
		}
	}

	// generate shortcut html from shortcut code in the following format: ( Alt+Shift+R )
	var _get_shortcut_keys = function ( code, html = '' )
	{
		for ( key_id in keys = code.split('+') )
			html += `<span key="`+keys[key_id].toLowerCase()+`">` + keys[key_id] + `</span>`;

		return html;
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	RiddR.options.UI = 
	{
		generate : function( engine )
		{
			// generate list of avaliable TTS engines 
			$("#TTS_engine").html( _generate_tts_list() );

			// update TTS engine parameters
			_update_tts_parameters( engine );

			// generate global keyboard shortcuts / commands  
			_render_global_commands();
		},

		render : function()
		{
			// initialize material design listeners
			_materialize();

			// initalize UI elements event listerners 
			_load_ui_event_listeners();

			// hide the preloader
			$('.preloader').fadeOut();
		},

		reading : function ( event )
		{
			switch( event.type )
			{
				case 'start':
					$("#test_btn").html( RiddR.storage.get('enqueue') ? 'add <i id="test_btn" class="material-icons">stop</i>' :'stop');
				break;

				case 'end':
				case 'interrupted':
					$("#test_btn").html('volume_up');
				break;
			}
		},

		snackbar	: _snackbar,
		modal 		: _modal,
		hide_modal 	: _hide_modal,
		update_tts_parameters : _update_tts_parameters 
	}

}).apply( RiddR );