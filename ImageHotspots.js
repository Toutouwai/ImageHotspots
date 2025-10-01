$(function() {

	// Initialise variables
	let $hotspot;
	let $parent;
	let $repeaterItem;
	let $xInput;
	let $yInput;
	let centreOffsetX;
	let centreOffsetY;
	let mouseOffsetX;
	let mouseOffsetY;
	let boundaryBottom;
	let boundaryRight;
	let timer = 0;

	// Set the position of a hotspot
	function setHotspotPosition($hs, percentageX, percentageY) {
		$hs.css('left', `calc(${percentageX}% - ${$hs.outerWidth() / 2}px)`);
		$hs.css('top', `calc(${percentageY}% - ${$hs.outerHeight() / 2}px)`);
	}

	// Get the hotspot for a given repeater item
	function getHotspotForRepeaterItem($repeaterItem) {
		const $inputfield = $repeaterItem.closest('.ImageHotspots');
		return $inputfield.find('.ih-hotspot[data-id="' + $repeaterItem.data('page') + '"]');
	}

	// Initialise hotspots
	function initHotspots() {
		$('.ImageHotspots').each(function() {
			const $image = $(this).find('> .InputfieldContent > .ih-image-outer .ih-image');
			$image.find('.ih-hotspot').each(function() {
				const id = $(this).data('id');
				const $r = $(`.InputfieldRepeaterItem[data-page="${id}"]`);
				const percentageX = $r.find('input[name^="hotspot_x_"]').val();
				const percentageY = $r.find('input[name^="hotspot_y_"]').val();
				setHotspotPosition($(this), percentageX, percentageY);
			});
			$image.addClass('ih-image-ready');
		});
	}

	// Hotspot drag
	function hotspotDrag(event) {
		event.preventDefault();
		// Get hotspot coordinates, adjusting for difference between mouse position and hotspot edge
		let hotspotX = event.pageX - mouseOffsetX - $parent.offset().left;
		let hotspotY = event.pageY - mouseOffsetY - $parent.offset().top;
		// Get centre of hotspot
		let centreX = hotspotX + centreOffsetX;
		let centreY = hotspotY + centreOffsetY;
		// Ensure hotspot centre stays within parent
		if(centreX < 0) hotspotX = 0 - centreOffsetX;
		if(centreX > boundaryRight) hotspotX = boundaryRight - centreOffsetX;
		if(centreY < 0) hotspotY = 0 - centreOffsetY;
		if(centreY > boundaryBottom) hotspotY = boundaryBottom - centreOffsetY;
		centreX = hotspotX + centreOffsetX;
		centreY = hotspotY + centreOffsetY;
		// Calculate percentage coordinates
		const percentageX = (centreX / boundaryRight * 100).toFixed(2);
		const percentageY = (centreY / boundaryBottom * 100).toFixed(2);
		// Set hotspot position
		setHotspotPosition($hotspot, percentageX, percentageY);
		// Set input values
		$xInput.val(percentageX).trigger('change');
		$yInput.val(percentageY).trigger('change');
	}

	// Mousedown on hotspot
	$(document).on('mousedown', '.ih-hotspot', function(event) {
		event.preventDefault();
		// Set variables
		timer = new Date().getTime();
		$hotspot = $(this);
		$parent = $hotspot.parent();
		const id = $hotspot.data('id');
		$repeaterItem = $(`.InputfieldRepeaterItem[data-page="${id}"]`);
		$xInput = $repeaterItem.find('input[name^="hotspot_x_"]');
		$yInput = $repeaterItem.find('input[name^="hotspot_y_"]');
		centreOffsetX = $hotspot.outerWidth() / 2;
		centreOffsetY = $hotspot.outerHeight() / 2;
		mouseOffsetX = event.pageX - $hotspot.offset().left;
		mouseOffsetY = event.pageY - $hotspot.offset().top;
		boundaryBottom = $parent.outerHeight();
		boundaryRight = $parent.outerWidth();
		// Attach hotspot drag event handler
		$(document).on('mousemove', hotspotDrag);
	});

	// Mouseup
	$(document).on('mouseup', function(event) {
		// Remove hotspot drag event handler
		$(document).off('mousemove', hotspotDrag);
		// If this was a brief click on a hotspot, highlight the repeater item header
		if(timer && new Date().getTime() - timer < 200) {
			const $header = $repeaterItem.children('.InputfieldHeader');
			const isHighlighted = $header.hasClass('ih-header-highlight');
			$('.ih-header-highlight').removeClass('ih-header-highlight');
			if(!isHighlighted) $header.addClass('ih-header-highlight');
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
