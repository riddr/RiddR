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

		if(modal.css('opacity') > 0 ) // check if modal is opened
		{
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
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Display error message 
 * ---------------------------------------------------------------------------------------------------------------------
*/

	var _error = function( message )
	{
		template = `<div id="error">
						<h1>Upps!<br>Something went wrong.</h1>
						<h2>`+message+`<h2>
					</div>`;

		// show the error
		_modal(template);
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Initalize UI elements event listerners 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _load_ui_event_listeners = function()
	{
		// test TTS audio 
		$(document).on('click','#test_box i', function()
		{
			action = $(this).data('action');
			switch(action)
			{
				case 'read':
					RiddR.options.test_speech( $("#utterance").val() );
				break;

				case 'stop':
					RiddR.options.stop_reading();
				break;	

				case 'error':
					_error(RiddR.options.lastError);
				break;
			}
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

		// set listenr for shortcut removal    
		$(document).on('click', '.remove_shortcut', function()
		{
			// remove shortcut from stored objects 
			RiddR.options.removeShortcut( $(this).attr('key') );

			// remove shorctu from the UI
			_remove_list_item( $(this) );
		});

		// Set listeners for new transcription item     
		$(document).on('click', '.add', function()
		{
			switch ( $(this).attr('action') )
			{
				case 'shortcut':
					_add_shortcut();
				break;

				case 'transcript':
					_add_transcript();
				break;
			}

			// scroll to bottom of the container
			_scroll_to_bottom( $(this).parent() );
		});

		$(document).on('click', '.delete_transcript', function()
		{
			RiddR.options.removeTranscript ( $(this).closest('ul').attr('key') );

			// remove shorctu from the UI
			_remove_list_item( $(this) );
		});

		// Event listeners for on transcript change 
		$(document).on('change', '#transcriptions input', function( )
		{
			// get transcript container
			_transcript = $(this).closest('ul');

			RiddR.options.save ( 'transcription', 
			{
				[_transcript.attr('key')] : { [_transcript.find('input:first-child').val()] : _transcript.find('input:last').val() }
			}, 'parent' ); // flush parent storage item

			$(this).blur();
		});

		// handle read transcript requests 
		$(document).on('click', '.read_transcript', function()
		{
			container = $(this).closest('ul');
			$(".reading").removeClass('reading'); // remove previous reading states 
			transcript = RiddR.defaults.transcription[ container.attr('key') ];

			// read the transcript 
			RiddR.IO.call( 'read', 
			{ 
				utterance : Object.keys( transcript)[0], // read the key in order to test the transcription
				options : 
				{ 
					'TTS_engine' 	: 'SpeakIt',
					'language'		: 'en-US' 
				},

			}, function()
			{
				container.addClass('reading');
				window.addEventListener('onTTSupdate', _TUI_handler ); 
			}, 'background' );
		});

	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Transcription UI handler - handle TX 
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _TUI_handler = function( event )
	{
		if( event.detail.type == 'end' )
		{
			container.removeClass('reading');
			window.removeEventListener( "onTTSupdate", _TUI_handler );
		}
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Test button UI handler
 * ---------------------------------------------------------------------------------------------------------------------
*/
	var _TEST_handler = function ( event, state = false )
	{
		switch( event.detail.type )
		{
			case 'start':
				state = RiddR.storage.get('enqueue') ? 'enqueue reading' : 'reading';
			break;

			// avoid other states 
			case 'end':
			case 'idle':
			case 'interrupted':
				state = event.detail.type;
				_hide_modal();
			break;

			case 'error':
				state = 'error';
				RiddR.options.lastError = event.detail.errorMessage;
				_error(RiddR.options.lastError);
			break;
		}

		// update test box state 
		if( state )
			$("#test_box").attr( 'class', state );
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
			var select 	 = $(this);
			var dropdown = ( select.next().length == 0 ) ? $("<ul></ul>") : select.next();

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
			dtop    = select.offset().top,
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
				message = $(this).data('message') || 'TTS engine dosen\'t support this feature.';
				setTimeout(function(){_snackbar(message);},10);
			}

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
	var _generate_tts_list = function (  selected, truncate = 25, offline = false, html = '' )
	{
		for ( engine in RiddR.TTS.engines )
		{
			if( !offline || ( offline && !RiddR.TTS.engines[engine].remote )  )
			{
				html += '<option display="'+engine+'" '+( ( engine == selected )? 'selected' : '' )+' value="'+engine+'">'+engine.truncate(truncate)+'</option>'            
			}
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

		// update language box
		_update_select_box( 'language', _language_list(engine.lang, RiddR.storage.get('language') ) );

		// update translate checkbox
		//_update_lang_translate();
	}

	// update language select list
	var _language_list = function ( languages, selected_lang , html = '')
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
				selected = ( language.code == selected_lang )? 'selected' : '';

				html += `<option ${selected} display="${language.name}" value="${language.code}">${language.name}</option>`;
			}
		}
	
		return html;
	}

	// update the state of language translate button
	var _update_lang_translate = function ()
	{
		$("#translate").prop('disabled',  (RiddR.storage.get('language') == 'auto') );
	}

	// update dropdown / select menu  
	var _update_select_box = function ( box_id, list )
	{
		// get list container / box
		box = $("#" + box_id.replace( /(:|\.|\[|\]|,|\+|=|@)/g, "\\$1" ));

		// ubdate box html and status
		box.html( list ).attr('updated', true);

		// update box state
		box.prop('disabled', (box.children().length == 1) );
	}

	// update language select box
	var _update_language_box = function ( box_id, languages, active_lang )
	{
		_update_select_box( box_id, _language_list( languages, active_lang ) );
	}

	// determine weither select box should be active 
	var _select_is_active = function ( data )
	{
		return ( data.length == 1 || typeof data == 'string' ) ? 'disabled' : '';
	}

	// remove UL item from data list
	var _remove_list_item = function ( item )
	{
		item.closest('ul').animate({'height' : 0, opacity: 0, margin: 0, padding: 0}, 400, function()
		{
			$(this).remove();
		});
	}

	// scroll to botton of specific element 
	var _scroll_to_bottom = function ( element )
	{
		element.scrollTop(element.prop("scrollHeight"));
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
								<label for="kb-read">`+RiddR.__('SHORTCUTS_'+command.name)+`</label> 
								<div class="keys" id="kb-read">`
									+ _get_shortcut_keys( command.shortcut ) +
							`	</div>
							</div>`;

			// register global shortcut
			RiddR.options.registerShortcut( command.shortcut.substr(-1) );

			// push shortcut html into shortcut container element 
			$("#global-shortcuts-container").append( shortcut_html );
		}
	}

	// generate user defined keyboard shortcuts 
	var _render_shortcuts = function ()
	{
		for ( sh_id in shortcuts = RiddR.storage.get('shortcuts') )
		{
			_add_shortcut({ [sh_id] : shortcuts[sh_id] });

			// register custom shortcuts
			RiddR.options.registerShortcut( sh_id.substr(-1) );
		}
	}

	// generate shortcut html from shortcut code in the following format: ( Alt+Shift+R )
	var _get_shortcut_keys = function ( code, html = '' )
	{
		for ( key_id in keys = code.split('+') )
			html += `<span key="`+keys[key_id].toLowerCase()+`">` + keys[key_id] + `</span>`;

		return html;
	}

	// generate shortcut HTML
	var _get_shortcut_html = function ( shortcut )
	{
		// get shortcut key
		_key = (Object.keys(shortcut)[0]);
		
		// extract shortuct options from the shortcut object
		shortcut = shortcut[_key];

		if( RiddR.TTS.engines[shortcut.TTS_engine] != undefined ) // check if TTS engine exists ( eg. removed by 3rd party TTS extenson )
			return `<ul>
						<li><div class="keys" id="kb-read">`+_get_shortcut_keys(_key)+`</div></li>
						<li>
							<div class="material select stripped">
								<select id="`+_key+`-TTS_engine">
								`+_generate_tts_list( shortcut.TTS_engine , 20 )+` 
								</select>
							</div>						
						</li>
						<li>
							<div class="material select stripped">
								<select id="`+_key+`-language" ${ _select_is_active( RiddR.TTS.engines[shortcut.TTS_engine].lang ) } > 
									`+_language_list( RiddR.TTS.engines[shortcut.TTS_engine].lang, shortcut.language )+`
								</select>
							</div>							
						</li>
						<li>
							<div class="material switch stripped">
								<input title="Coming soon..." disabled id="`+_key+`-translate" type="checkbox" `+ ( (shortcut.translate)? 'checked' : '' ) +` />
								<span></span>
							</div>						
						</li>
						<li>
							<i class="material-icons remove_shortcut" key="`+_key+`">delete</i>
						</li>
					</ul>`;
	}

	// add shortcut into shortcut container 
	var _add_shortcut = function ( shortcut )
	{
		// get new shortcut from the options 
		shortcut = shortcut || RiddR.options.newShortcut();

		// generate shortcut html
		html = _get_shortcut_html( shortcut );

		// add generated HTML into the shortcuts container
		$("#shortcuts").append(html);
	}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * UI TRANSCRIPTION RELATED FUNCTIONS 
 * 
 * Generate user defined transcription items / transcripts  
 * ---------------------------------------------------------------------------------------------------------------------
*/	
	var _render_transcripts = function ()
	{
		for ( key in transcripts = RiddR.storage.get('transcription') ) 
		{
			if( transcript = transcripts[key] )
			{
				_add_transcript
				(
					{
						id 		: key,
						from 	: Object.keys(transcript)[0],
						to 		: transcript[Object.keys(transcript)[0]]
					}
				);		
			}
		}
	}

	// generate  transcription item html
	var _get_transcript_html = function ( transcript )
	{
		return `<ul key="${transcript.id}">
					<li>
						<input type="text" value="${transcript.from}">
					</li>
					<li><i class="material-icons">chevron_right</i></li>
					<li>
						<input type="text" value="${transcript.to}">
					</li>
					<li>
						<i class="material-icons read_transcript">record_voice_over</i>
						<i class="material-icons  delete_transcript">delete</i>
					</li>
				</ul>`;
	}

	// add transcription item 
	var _add_transcript = function ( transcript )
	{
		// generate transcript data
		transcript = ( transcript )? transcript : RiddR.options.newTranscript();

		html = _get_transcript_html(transcript);

		$("#transcriptions").append(html);
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
			$("#offline_engine").html( _generate_tts_list(RiddR.storage.get('offline_engine'), 40, true ) );

			// update TTS engine parameters
			_update_tts_parameters( engine );

			// generate global keyboard shortcuts / commands  
			_render_global_commands();

			// render saved shortcuts
			_render_shortcuts();

			// render transcription items
			_render_transcripts();
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

		modal 				: _modal,
		snackbar			: _snackbar,
		hideModal 			: _hide_modal,
		updateLanguageBox 	: _update_language_box,
		updateTTSParameters : _update_tts_parameters
	}

	// register TTS update event listener
	window.addEventListener('onTTSupdate', _TEST_handler ); 

}).apply( RiddR );