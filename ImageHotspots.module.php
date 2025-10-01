<?php namespace ProcessWire;

class ImageHotspots extends WireData implements Module {

	protected $defaultImageHeight = 600;

	/**
	 * Ready
	 */
	public function ready() {
		$this->addHookAfter('InputfieldRepeater::renderReadyHook', $this, 'beforeRepeaterRender');
		$this->addHookAfter('FieldtypeRepeater::getConfigInputfields', $this, 'addConfigInputfields');
	}

	/**
	 * Before InputfieldRepeater::renderReadyHook
	 *
	 * @param HookEvent $event
	 */
	protected function beforeRepeaterRender(HookEvent $event) {
		/** @var InputfieldRepeater $inputfield */
		$inputfield = $event->object;
		$field = $inputfield->hasField;
		$page = $inputfield->hasPage;
		$config = $this->wire()->config;
		if(!$field || !$this->isValidRepeaterField($field)) return;
		if(!$field->ihImageField) return;
		if(!$page) return;
		if(!$page->template->hasField($field->ihImageField)) return;

		// Add class
		$inputfield->addClass('ImageHotspots', 'wrapClass');

		// Add module assets
		$info = $this->wire()->modules->getModuleInfo($this);
		$version = $info['version'];
		$config->styles->add($config->urls->$this . "$this.css?v=$version");
		$config->scripts->add($config->urls->$this . "$this.js?v=$version");

		// Hook inputfield render to add preview page and hotspots because of limitations of prependMarkup
		// https://github.com/processwire/processwire-requests/issues/536
		$pageimage = $page->getUnformatted($field->ihImageField)->first();
		if($pageimage) {
			// Disable AJAX loading as x/y inputs need to be present for each repeater item
			$field->repeaterLoading = 0;
			$this->wire()->addHookAfter("InputfieldRepeater(name=$inputfield->name)::render", function(HookEvent $event) use ($pageimage) {
				/** @var InputfieldRepeater $inputfield */
				$inputfield = $event->object;
				if($inputfield->ihProcessed) return;
				$field = $inputfield->hasField;
				$height = $field->ihHeight ?? $this->defaultImageHeight;
				$items = $inputfield->value;
				$hotspots = '';
				foreach($items as $item) {
					// Skip "ready" page, which has hidden status
					if($item->hasStatus(Page::statusHidden)) continue;
					$hotspots .= "<div class='ih-hotspot' data-id='$item->id'></div>";
				}
				$prepend = <<<EOT
<div class="ih-image-outer">
	<div class="ih-image">
		$hotspots
		<img src="$pageimage->url" alt="$pageimage->description" style="max-height:{$height}px">
	</div>
</div>
EOT;
				$event->return = $prepend . $event->return;
				$inputfield->ihProcessed = true;
			});
		}

	}

	/**
	 * Is the given repeater field valid for Image Hotspots?
	 */
	protected function isValidRepeaterField($field) {
		if($field->type != 'FieldtypeRepeater') return false;
		$template = $this->wire()->templates->get($field->template_id);
		if(!$template) return false;
		if(!$template->hasField('hotspot_x')) return false;
		if(!$template->hasField('hotspot_y')) return false;
		return true;
	}

	/**
	 * Add config inputfields
	 *
	 * @param HookEvent $event
	 */
	protected function addConfigInputfields(HookEvent $event) {
		$field = $event->arguments(0);
		/* @var InputfieldWrapper $wrapper */
		$wrapper = $event->return;
		$modules = $this->wire()->modules;
		if(!$this->isValidRepeaterField($field)) return;

		/** @var InputfieldFieldset $fs */
		$fs = $modules->get('InputfieldFieldset');
		$fs->name = 'ihConfig';
		$fs->label = $this->_('Image Hotspots');
		$fs->icon = 'circle-o';
		$fs->addClass('InputfieldIsOffset', 'wrapClass');
		$fs->collapsed = Inputfield::collapsedYes;
		$wrapper->add($fs);
		
		/** @var InputfieldSelect $f */
		$f = $modules->get('InputfieldSelect');
		$name = 'ihImageField';
		$f->name = $name;
		$f->label = $this->_('Image field');
		$f->notes = $this->_('The image field selected here should be added to the same template as this Repeater field.');
		foreach($this->wire()->fields->find('type=FieldtypeImage, maxFiles=1') as $imageField) {
			$f->addOption($imageField->name);
		}
		$f->columnWidth = 50;
		$f->value = $field->$name;
		$fs->add($f);

		/** @var InputfieldInteger $f */
		$f = $modules->get('InputfieldInteger');
		$name = 'ihImageHeight';
		$f->name = $name;
		$f->label = $this->_('Image height');
		$f->columnWidth = 50;
		$f->showIf = 'ihImageField!=""';
		$f->value = $field->$name ?? $this->defaultImageHeight;
		$fs->add($f);
	}

	/**
	 * Install
	 */
	public function ___install() {
		$fields = $this->wire()->fields;
		$modules = $this->wire()->modules;

		// Create fields for X and Y percentage coordinates
		$name = 'hotspot_x';
		$f = $fields->get($name);
		if(!$f) {
			/** @var InputfieldFloat $f */
			$f = $this->wire(new Field());
			$f->type = $modules->get('FieldtypeDecimal');
			$f->name = $name;
			$f->label = $this->_('X coordinate (%)');
			$f->precision = 2;
			$f->inputType = 'number';
			$f->columnWidth = 50;
			$f->addTag('ImageHotspots');
			$f->save();
		}
		$name = 'hotspot_y';
		$f = $fields->get($name);
		if(!$f) {
			/** @var InputfieldFloat $f */
			$f = $this->wire(new Field());
			$f->type = $modules->get('FieldtypeDecimal');
			$f->name = $name;
			$f->label = $this->_('Y coordinate (%)');
			$f->precision = 2;
			$f->inputType = 'number';
			$f->columnWidth = 50;
			$f->addTag('ImageHotspots');
			$f->save();
		}
	}

}
