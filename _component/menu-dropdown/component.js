/********************************
	TO DO:
		- Large screen: keep menus open on child focus
		- Large screen: Install click to open option if attribute is set
		- Small screen: Install click to open option globally
********************************/

( function() {

	'use strict';

	/*
		Cache and define some variables
	*/

	var menu = document.getElementById( 'menu-main-nav' );
	var menu_id = menu.getAttribute( 'id' );
	var menu_toggle = document.getElementById( 'js-menu-toggle' );
	var menu_toggle_href = menu_toggle.getAttribute( 'href' );
	var aria_controls = menu_toggle.getAttribute('aria-controls');
	var menu_toggle_target = menu_toggle_href.split('#')[1];
	var sub_menu_acion = menu_toggle.getAttribute( 'data-submenu' );
	var menu_items_with_children = menu.querySelectorAll('.menu-item-has-children');
	var menu_items_with_children_count = menu_items_with_children.length;
	var currentTarget;
	var target
	var i;

	/*
		Helper functions
	*/

	// Check if an element is hidden
	var is_hidden = function( el ) {
		return ( el.offsetParent === null );
	};

	// Get screen size from getComputedStyle (so we don't have to define it twice)
	var get_screen_size = function( sizeString ) {

		var size = window.getComputedStyle( document.body,':before' ).getPropertyValue( 'content' );

		if( size && size.indexOf( sizeString ) !==-1 ) {
			return true;
		}

	};

	// Debounce
	var debounce = function( func, wait, immediate ) {

		var timeout;
		return function() {
			var context = this, args = arguments;

			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};

			var callNow = immediate && !timeout;

			clearTimeout( timeout );
			timeout = setTimeout( later, wait );
			if (callNow) func.apply(context, args);
		};

	};

	// Listener for the menu open/close action
	var listener_menu = function( e ) {

		e.preventDefault();

		if( document.body.classList.contains('menu-is-open') ) {

			// Close the menu
			menu.setAttribute('aria-hidden', 'true');
			menu_toggle.setAttribute('aria-expanded', 'false');

			// Bubble to the document
			document.body.classList.remove('menu-is-open');

		} else {

			// Open the menu
			menu.setAttribute('aria-hidden', 'false');
			menu_toggle.setAttribute('aria-expanded', 'true');

			// Set focus to the first link
			menu.querySelectorAll('a')[0].focus();

			// Bubble to the document
			document.body.classList.add('menu-is-open');

		}

	};

	// Listener for submenu on click
	var listener_submenu_click = function( e ) {

		e.preventDefault();
		e.stopPropagation();

		currentTarget = e.currentTarget;
		target = e.target;

		var first_link = e.currentTarget.querySelector('a');
		var parent_menu = target.parentNode;
		var sub_menu = parent_menu.querySelector('.sub-menu');

		if( e.srcElement.nodeName === 'A' && target.classList.contains( 'submenu-is-open' ) ) {

			sub_menu.setAttribute( 'aria-hidden', 'true' );
			parent_menu.classList.remove( 'child-has-focus' );
			target.classList.remove( 'submenu-is-open' );

		} else {
			// open it
			sub_menu.setAttribute( 'aria-hidden', 'false' );
			parent_menu.classList.add( 'child-has-focus' );
			target.classList.add( 'submenu-is-open' );
			sub_menu.querySelectorAll('a')[0].focus();

		}

	}; // listener_submenu_click()

	// Listener for the window resize
	var listener_window = debounce( function( e ) {

		if( get_screen_size( 'small' ) ) {
			menu_create();
		} else {
			menu_destroy();
		}

	}, 100 );

	// Method to create the small screen menu
	var menu_create = function() {

		if( !document.body.classList.contains( 'menu-created' ) ) {

			if( !document.body.classList.contains( 'menu-is-open' ) ) {
				menu.setAttribute( 'aria-hidden', 'true' );
				menu_toggle.setAttribute( 'aria-expanded', 'false' );
			} else {
				menu.setAttribute( 'aria-hidden', 'false' );
				menu_toggle.setAttribute( 'aria-expanded', 'true' );
			}

			// Bind the event
			menu_toggle.addEventListener( 'click', listener_menu );

			// Add the body class to prevent this from running again
			document.body.classList.add( 'menu-created' );
			document.body.classList.remove( 'menu-destroyed' );

		}

	};

	// Method to destroy the small screen menu
	var menu_destroy = function() {

		if( !document.body.classList.contains( 'menu-destoryed' ) ) {

			// Remove aria-hidden, because we don't need it.
			menu.removeAttribute( 'aria-hidden' );

			// Unbind the event
			menu_toggle.removeEventListener( 'click', listener_menu );

			// Add the body class to prevent this from running again
			document.body.classList.add( 'menu-destroyed' );
			document.body.classList.remove( 'menu-created' );

		}

	};

	// Check init menu state
	if( get_screen_size( 'small' ) ) {
		menu_create();
	}

	// If aria-controls isn't set, set it
	if( !aria_controls ) {
		menu_toggle.setAttribute( 'aria-controls', menu_id );
	}

	// If the menu ID and toggle href don't match, make them match (this seems to happen often to merit this check)
	if( menu_toggle_target !== menu_id ) {
		menu_toggle.setAttribute( 'href', '#' + menu_id );
	}

	/*
		Events
	*/

	// Debounced resize event to create and destroy the small screen menu options
	window.addEventListener( 'resize', listener_window );

	/*
		Hiding and showing submenus (click, focus, hover)
	*/

	// Loop through all items with sub menus and bind focus to them for tabbing
	for ( i = 0; i < menu_items_with_children_count; i = i + 1 ) {

		// Let a screen reader know this menu has a submenu by hooking into the first link
		menu_items_with_children[i].querySelector('a').setAttribute( 'aria-haspopup', 'true' );

		// Hide and label each sub menu
		menu_items_with_children[i].querySelector('.sub-menu').setAttribute( 'aria-hidden', 'true' );
		menu_items_with_children[i].querySelector('.sub-menu').setAttribute( 'aria-label', 'Submenu' );

		// If the screen is small or the action is set to click
		if( get_screen_size( 'small' ) || sub_menu_acion === 'click' ) {
			menu_items_with_children[i].addEventListener( 'click', listener_submenu_click );
			menu_items_with_children[i].classList.add('event--listener_submenu_click');
		}

		// Unbind the click action for submenus on large screen if the action should be hover
		// Make sure this doesn't permanently live in the loop
		window.addEventListener( 'resize', function() {

			if( sub_menu_acion !== 'click' ) {
				menu_items_with_children[i].removeEventListener( 'click', listener_submenu_click );
				menu_items_with_children[i].classList.remove('event--listener_submenu_click');
			}

		} );

	} // for()

} )();
