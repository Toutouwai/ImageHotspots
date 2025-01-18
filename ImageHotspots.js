$(document).ready(function() {

	// Initialise variables
	let $hotspot;
	let $parent;
	let $repeater_item;
	let $x_input;
	let $y_input;
	let centre_offset_x;
	let centre_offset_y;
	let mouse_offset_x;
	let mouse_offset_y;
	let boundary_bottom;
	let boundary_right;
	let timer = 0;

	// Set the position of a hotspot
	function setHotspotPosition($hs, percentage_x, percentage_y) {
		$hs.css('left', `calc(${percentage_x}% - ${$hs.outerWidth() / 2}px)`);
		$hs.css('top', `calc(${percentage_y}% - ${$hs.outerHeight() / 2}px)`);
	}

	// Get the hotspot for a given repeater item
	function getHotspotForRepeaterItem($repeater_item) {
		const $inputfield = $repeater_item.closest('.ImageHotspots');
		return $inputfield.find('.ih-hotspot[data-id="' + $repeater_item.data('page') + '"]');
	}

	// Initialise hotspots
	function initHotspots() {
		$('.ImageHotspots').each(function() {
			const $image = $(this).find('> .InputfieldContent > .ih-image-outer .ih-image');
			$image.find('.ih-hotspot').each(function() {
				const id = $(this).data('id');
				const $r = $(`.InputfieldRepeaterItem[data-page="${id}"]`);
				const percentage_x = $r.find('input[name^="hotspot_x_"]').val();
				const percentage_y = $r.find('input[name^="hotspot_y_"]').val();
				setHotspotPosition($(this), percentage_x, percentage_y);
			});
			$image.addClass('ih-ready');
		});
	}

	// Hotspot drag
	function hotspotDrag(event) {
		event.preventDefault();
		// Get hotspot coordinates, adjusting for difference between mouse position and hotspot edge
		let hotspot_x = event.pageX - mouse_offset_x - $parent.offset().left;
		let hotspot_y = event.pageY - mouse_offset_y - $parent.offset().top;
		// Get centre of hotspot
		let centre_x = hotspot_x + centre_offset_x;
		let centre_y = hotspot_y + centre_offset_y;
		// Ensure hotspot centre stays within parent
		if(centre_x < 0) hotspot_x = 0 - centre_offset_x;
		if(centre_x > boundary_right) hotspot_x = boundary_right - centre_offset_x;
		if(centre_y < 0) hotspot_y = 0 - centre_offset_y;
		if(centre_y > boundary_bottom) hotspot_y = boundary_bottom - centre_offset_y;
		centre_x = hotspot_x + centre_offset_x;
		centre_y = hotspot_y + centre_offset_y;
		// Calculate percentage coordinates
		const percentage_x = (centre_x / boundary_right * 100).toFixed(2);
		const percentage_y = (centre_y / boundary_bottom * 100).toFixed(2);
		// Set hotspot position
		setHotspotPosition($hotspot, percentage_x, percentage_y);
		// Set input values
		$x_input.val(percentage_x).trigger('change');
		$y_input.val(percentage_y).trigger('change');
	}

	// Mousedown on hotspot
	$(document).on('mousedown', '.ih-hotspot', function(event) {
		event.preventDefault();
		// Set variables
		timer = new Date().getTime();
		$hotspot = $(this);
		$parent = $hotspot.parent();
		const id = $hotspot.data('id');
		$repeater_item = $(`.InputfieldRepeaterItem[data-page="${id}"]`);
		$x_input = $repeater_item.find('input[name^="hotspot_x_"]');
		$y_input = $repeater_item.find('input[name^="hotspot_y_"]');
		centre_offset_x = $hotspot.outerWidth() / 2;
		centre_offset_y = $hotspot.outerHeight() / 2;
		mouse_offset_x = event.pageX - $hotspot.offset().left;
		mouse_offset_y = event.pageY - $hotspot.offset().top;
		boundary_bottom = $parent.outerHeight();
		boundary_right = $parent.outerWidth();
		// Attach hotspot drag event handler
		$(document).on('mousemove', hotspotDrag);
	});

	// Mouseup
	$(document).on('mouseup', function(event) {
		// Remove hotspot drag event handler
		$(document).off('mousemove', hotspotDrag);
		// If this was a brief click on a hotspot, highlight the repeater item header
		if(timer && new Date().getTime() - timer < 200) {
			const $header = $repeater_item.children('.InputfieldHeader');
			const is_highlighted = $header.hasClass('ih-header-highlight');
			$('.ih-header-highlight').removeClass('ih-header-highlight');
			if(!is_highlighted) $header.addClass('ih-header-highlight');
		}
		timer = 0;
	});

	// Move hotspot when x or y input changes
	$(document).on('change', 'input[name^="hotspot_x_"], input[name^="hotspot_y_"]', function() {
		const $item = $(this).closest('.InputfieldRepeaterItem');
		const $hs = getHotspotForRepeaterItem($item);
		const x = $item.find('input[name^="hotspot_x_"]').val();
		const y = $item.find('input[name^="hotspot_y_"]').val();
		setHotspotPosition($hs, x, y);
	});

	// Highlight hotspot when x or y input is focused
	$(document).on('focus', 'input[name^="hotspot_x_"], input[name^="hotspot_y_"]', function() {
		const $hs = getHotspotForRepeaterItem($(this).closest('.InputfieldRepeaterItem'));
		$hs.addClass('ih-hotspot-highlight');
	});

	// Remove hotspot highlight when x or y input is blurred
	$(document).on('blur', 'input[name^="hotspot_x_"], input[name^="hotspot_y_"]', function() {
		$('.ih-hotspot-highlight').removeClass('ih-hotspot-highlight');
	});

	// When a Repeater item is added
	$(document).on('repeateradd', '.InputfieldRepeaterAddLink', function(event, el) {
		const $item = $(el);
		// Set x/y to 0
		$item.find('input[name^="hotspot_x_"]').val(0);
		$item.find('input[name^="hotspot_y_"]').val(0);
		// Add hotspot
		$item.closest('.InputfieldRepeater').find('.ih-image').append('<div class="ih-hotspot" data-id="' + $item.data('page') + '"></div>');
		// Re-init hotspots
		initHotspots();
	});

	// Init hotspots on Repeater inputfield reloaded
	$(document).on('reloaded', '.InputfieldRepeater', function() {
		initHotspots();
	});

	// Init hotspots on DOM ready
	initHotspots();

});
