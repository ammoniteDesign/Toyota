/*
 Tool for Toggling Elements to show and hide
 */
(function(factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports !== 'undefined') {
		module.exports = factory(require('jquery'));
	} else {
		factory(jQuery);
	}

}(function ($) {
	'use strict';

	var elementToggle = window.elementToggle || {};

	elementToggle = (function () {

		
		function elementToggle(element, settings, slickSettings) {
			//All the vars for the current element control go here and any private functions/methods
			var _ = this;
		

			_.defaults = {
				
				initialElement: null,
				animationSpeed: 250,
				mobileBreakpoint: 600,


				deskOption: 'tabs',
				mobileOption: 'accordion',
				menuOption: 'dropDown',

			
				abilityAccordionAutoClose: true,
				abilityAccordionClose: true,
				abilityMenuControl: true,
				abilityTabsClose: false,
				abilityMenuToggle: false,


				
				classButton: 'js-toggleBtn',
				classMobileButton: 'js-toggleMobileBtn',
				classContent: 'js-toggleContent',
				classContentWrap: 'js-toggleWrap',
				classMenuWrap: 'js-toggleMenuWrap',
				classMenuBtn: 'js-toggleMenuBtn',
				classActive: 'active',
				slickSettings : null
			}

			$.extend(_.defaults, settings);


			//Name the properties
			_.onMobile = false;
			_.onMenu = false;
			_.openArray = [];
			_.isAnimating = false;
			_.windowWidth = null;
			_.windowThrottle = null;
			_.windowListener = true;

			_.$element = $(element);
			_.$menuBtn = null;
			_.$menuWrap = null;
			_.$btns = null;
			_.$mobileBtns = null;
			_.$contentWrap = null;
			_.$content = null;

			//Setup the Methods that are click calls 
			_.setListeners = $.proxy(_.setListeners, _);
			//_.clickHandler = $.proxy(_.clickHandler, _);
			_.changeElement = $.proxy(_.changeElement, _);
			_.menuToggle = $.proxy(_.menuToggle, _);
			
			

			//Initalize the thing
			_.init();
		}

		return elementToggle;
	}());


	//All public Methods go here
	elementToggle.prototype.init = function(){
		var _ = this;
		//Set the Properties
		_.$contentWrap = _.$element.find('.' + _.defaults.classContentWrap);
		_.windowWidth = window.innerWidth || $(window).width()
		//Set Up the content
		_.$content = _.$contentWrap.find('.' + _.defaults.classContent);
		_.$content.each(function (index, element) {
			$(element).attr("data-element-index", index);
		});
		


		//Set Up Mobile Accordion Buttons
		_.$mobileBtns = _.$contentWrap.find('.' + _.defaults.classMobileButton);
		_.$mobileBtns.each(function (index, element) {
			$(element).attr("data-element-index", index);
		});

		//Set Up Desktop Buttons
		if (_.defaults.abilityMenuControl) {
			_.$btns = _.$element.find('.' + _.defaults.classButton);
			_.$btns.each(function (index, element) {
				$(element).attr("data-element-index", index);
			});
		}

		//Set Up Menu Toggle
		if (_.defaults.abilityMenuToggle) {
			_.$menuBtn = _.$element.find('.' + _.defaults.classMenuBtn);
			_.$menuWrap = _.$element.find('.' + _.defaults.classMenuWrap).filter(':first');
		}

		//Is there a switch from desktop to mobile?
		if (_.defaults.deskOption === _.defaults.mobileOption) {
			_.windowListener = false;
		} else {
			
			//Check if really on desktopcurrentWidth <= _.defaults.mobileBreakpoint
			if (!_.onMobile && _.windowWidth <= _.defaults.mobileBreakpoint) {
				_.onMobile = true;
			}
		}

		switch ((_.onMobile) ? _.defaults.mobileOption : _.defaults.deskOption) {
			case "accordion":
				if (!_.defaults.abilityAccordionClose) {
					if (isNaN(_.defaults.initialElement)) {
						_.defaults.initialElement = 0;
					}
					_.changeElement();
				}
				break;
			case "carousel":
				_.initCarousel();
				break;
			case "tabs":
				if (!_.defaults.abilityTabsClose) {
					if (isNaN(_.defaults.initialElement) || _.defaults.initialElement == null) {
						_.defaults.initialElement = 0;
					} 
					_.changeElement();
				}
				break;
			default:
				console.log("Error: " + (_.onMobile) ? _.defaults.mobileOption : _.defaults.deskOption + " not found")
				break;
		}
		
		//Call Listener Method
		_.setListeners();
	}

	elementToggle.prototype.changeElement = function (e) {
		var _ = this,
			openingIndex = (e != null) ? $(e.delegateTarget).data('element-index') : _.defaults.initialElement,
			type = (_.onMobile) ? _.defaults.mobileOption : _.defaults.deskOption;
			
		switch (type) {
			case 'tabs':
				_.switchTabs(openingIndex);
				
				break;
			case 'accordion':
				//Check if it's in the middle of Animating (to ensure the open array doesn't get messy)
				
				if (!_.isAnimating) {
					
					_.isAnimating = true;
					//Should we Close the Accordion?
					if (_.openArray.length > 0) {
						//There's an accordion Open
						if (_.defaults.abilityAccordionAutoClose) {
							//Check if they pressed the open element
							if (_.openArray[0] != openingIndex) {
								_.openAccordion(openingIndex);
								_.closeAccordion(_.openArray[0]);
							} else {
								if (_.defaults.abilityAccordionClose) {
									_.closeAccordion(_.openArray[0])
								} else {
									//console.log('You pressed the open element')
									_.isAnimating = false;
								}
							
							}

						} else {
							//Check if content is open
							if (_.openArray.indexOf(openingIndex) == -1) {
								//Content is closed
								_.openAccordion(openingIndex);
							} else {
								//Content is open--> Check if accordion can close
								if (_.defaults.abilityAccordionClose) {
									_.closeAccordion(openingIndex);
								} else {
									if (_.openArray.length > 1) {
										_.closeAccordion(openingIndex);
									} else {
										//console.log('You pressed the open element')
										_.isAnimating = false;
									}
									//Else do nothing
								}
							}
						}
					} else {
						//Open the accordion
						_.openAccordion(openingIndex);
					}
				}
				
				
				break;
			case 'carousel':
				_.$contentWrap.slick('slickGoTo', openingIndex)
				break;


			default:
				console.log("Type of transition wasn't understood: " + type)
				break;

		}

	}

	elementToggle.prototype.setListeners = function () {
		var _ = this;
		
		//Set Listners for window
		if (_.windowListener) {
			
			$(window).on('resize', function () {
				var currentWidth = window.innerWidth || $(window).width()
				if(currentWidth != _.windowWidth){
					clearTimeout(_.windowThrottle);
					//console.log('Timeout Cleared');
					_.windowThrottle = window.setTimeout(function () {
						//console.log('Timeout A-Function Called');
					

						
						//console.log('window width was changed');
						//Width Changed
						if (_.onMobile && currentWidth > _.defaults.mobileBreakpoint) {
							//We changed from Mobile to Desktop!
							_.onMobile = false;
							//console.log("We changed from Mobile to Desktop!");
							_.mobileChange();

						} else if (!_.onMobile && currentWidth <= _.defaults.mobileBreakpoint) {
							//We changed from Desktop to Mobile!
							_.onMobile = true;
							//console.log("We changed from Desktop to Mobile!");
							_.mobileChange();
						}
						_.windowWidth = currentWidth

						

					}, 100);
				}
			});
		}


		//Set Listeners for Controls (if exists)
		if (_.$btns.length > 0) {
			$(_.$btns).on('click.elementToggle', _.changeElement);
		}

		//Set Listeners for Mobile Controls (if exists)
		if (_.$mobileBtns.length > 0) {
			$(_.$mobileBtns).on('click.elementToggle', _.changeElement);
		}

		//Set Listeners for Menu Toggle (if exists)
		if (_.defaults.abilityMenuToggle) {
			$(_.$menuBtn).on('click.elementToggle', _.menuToggle);
		}
	}

	elementToggle.prototype.mobileChange = function () {
		var _ = this;
		var movingFrom = '';
		var movingTo = '';
		if (_.onMobile) {
			movingFrom = _.defaults.deskOption;
			movingTo = _.defaults.mobileOption;
		} else {
			movingFrom = _.defaults.mobileOption;
			movingTo = _.defaults.deskOption;
		}
		//console.log('MobileChangeFired')

		switch (movingFrom) {
			case 'accordion':
				switch (movingTo) {
					case 'carousel':
						for (var i = 0; _.openArray.length > i; i++) {
							var $btn = $(_.$btns[_.openArray[i]]);
							var $mobileBtn = $(_.$mobileBtns[_.openArray[i]]);

							$(_.$content[_.openArray[i]]).removeAttr('style').removeClass('active');
							if ($btn != undefined) {
								$btn.removeClass('active')
							}
							if ($mobileBtn != undefined) {
								$mobileBtn.removeClass('active')
							}
						}
						if (_.openArray.length == 1) {
							_.initCarousel(_.openArray[0]);
						} else {
							_.initCarousel();
						}
						break;
					case 'tabs':
						if (_.openArray.length < 1) {
							//Add styles to default
							var $btn = $(_.$btns[_.defaults.initialElement]);
							var $mobileBtn = $(_.$mobileBtns[_.defaults.initialElement]);

							$(_.$content[_.defaults.initialElement]).css('height', 'auto').addClass('active');
							if ($btn != undefined) {
								$btn.addClass('active')
							}
							if ($mobileBtn != undefined) {
								$mobileBtn.addClass('active')
							}
							//Set Open
							_.openArray = [_.defaults.initialElement]
						} else if (_.openArray.length > 1) {
							//Remove styles from all open EXCEPT first in array
							for (var j = 1; _.openArray.length > j; j++) {
								var $btn = $(_.$btns[_.openArray[j]]);
								var $mobileBtn = $(_.$mobileBtns[_.openArray[j]]);

								$(_.$content[_.openArray[j]]).removeAttr('style').removeClass('active');
								if ($btn != undefined) {
									$btn.removeClass('active')
								}
								if ($mobileBtn != undefined) {
									$mobileBtn.removeClass('active')
								}
							}

							//Remove closed from array
							_.openArray.splice(1, (_.openArray.length - 1))
						}
						
						break;
					default:
						console.log('MobileChange: Your movingTo type is not understood')
						break;
				}
				break;
			case 'tabs':
				switch (movingTo) {
					case 'carousel':
						var $btn = $(_.$btns[_.openArray[0]]);
						var $mobileBtn = $(_.$mobileBtns[_.openArray[0]]);

						$(_.$content[_.openArray[0]]).removeAttr('style').removeClass('active');

						if ($btn != undefined) {
							$btn.removeClass('active')
						}
						if ($mobileBtn != undefined) {
							$mobileBtn.removeClass('active')
						}
						_.initCarousel(_.openArray[0]);
											
						break;
					case 'accordion':
						//I don't think I have to do anything...
						break;
					default:
						console.log('MobileChange: Your movingTo type is not understood')
						break;
				}
				break;
			case 'carousel':
				switch (movingTo) {
					case 'accordion':
						
						_.destroyCarousel();
						var openIndex = _.openArray[0];
						_.openArray = [];
						_.openAccordion(openIndex)
						break;
					case 'tabs':
						
						_.destroyCarousel();
						var openIndex = _.openArray[0];
						_.openArray = [];
						_.switchTabs(openIndex);
						break;
					default:
						console.log('MobileChange: Your movingTo type is not understood')
						break;
				}
				break;
			default:
				console.log('MobileChange: Your movingFrom type is not understood')
				break;
		}

		if (_.defaults.abilityMenuToggle && _.onMenu) {
			_.menuToggle(true);
		}
	}

	elementToggle.prototype.menuToggle = function (noAnimate) {
		var _ = this,
			newHeight = 0;
		if (!_.isAnimating) {
			_.isAnimating = true;
			if (_.onMenu) {
				_.$menuBtn.removeClass('active');
				_.onMenu = false;
			} else {
				newHeight = _.$menuWrap.children().outerHeight(true);
				_.$menuBtn.addClass('active');
				_.onMenu = true;
			}
			if (noAnimate == true) {
				if (_.onMenu) {
					_.$menuWrap.addClass('active').removeAttr('style');
				} else {
					_.$menuWrap.removeClass('active').removeAttr('style');
				}
				_.isAnimating = false;
			} else {
				_.$menuWrap.animate({
					height: newHeight
				}, _.defaults.animationSpeed, function () {
					//Done Animating
					if (_.onMenu) {
						_.$menuWrap.addClass('active').removeAttr('style');
					} else {
						_.$menuWrap.removeClass('active').removeAttr('style');
					}
					_.isAnimating = false;
				})
			}
			
		}
	}

	elementToggle.prototype.openAccordion = function (openingIndex) {
		var _ = this;
		
		var $newContent = $(_.$content[openingIndex]);
		var $newBtn = $(_.$btns[openingIndex])
		var $newMobileBtn = $(_.$mobileBtns[openingIndex])
		var newHeight = $newContent.children().outerHeight(true);
		
		

		//Check for correct set up
		if (!isNaN(newHeight) && newHeight > 0) {
			//Add Active Classes
			if ($newBtn != undefined) {
				$newBtn.addClass('active')
			}
			if ($newMobileBtn != undefined) {
				$newMobileBtn.addClass('active')
			}
			
			//Add Opening Index to Array
			_.openArray.push(openingIndex)

			$newContent.animate({
				height: newHeight
			}, _.defaults.animationSpeed, function () {
				//Done Animating
				$newContent.addClass('active').removeAttr('style')
				_.isAnimating = false;
			})
		} else {
			console.log("Error: Your Accordion is set up incorrectly. The height of your content is either 0 or not a number or non-existant")
			//console.log($newContent.children())
			_.isAnimating = false;
		}

	}

	elementToggle.prototype.closeAccordion = function (closingIndex) {
		var _ = this;
		var $closingContent = $(_.$content[closingIndex]);
		var $closingBtn = $(_.$btns[closingIndex])
		var $closingMobileBtn = $(_.$mobileBtns[closingIndex])
		var closingHeight = $closingContent.children().outerHeight(true);
		var arrayIndex = _.openArray.indexOf(closingIndex)



		//Remove Active Classes
		if ($closingBtn != undefined) {
			$closingBtn.removeClass('active')
		}
		if ($closingMobileBtn != undefined) {
			$closingMobileBtn.removeClass('active')
		}

		//Remove Opening Index from Array
		_.openArray.splice(arrayIndex, 1)

		$closingContent.css('height', closingHeight).animate({
			height: 0
		}, _.defaults.animationSpeed, function () {
			//Done Animating
			$closingContent.removeAttr('style').removeClass('active')
			_.isAnimating = false;
		})
		

	}

	elementToggle.prototype.switchTabs = function (openingIndex) {
		var _ = this;
		if ((_.openArray[0] != openingIndex || _.defaults.abilityTabsClose ) && !_.isAnimating) {
			var currentHeight = _.$contentWrap.outerHeight(true),
				$newContent = null,
				$newBtn = null,
				$newMobileBtn = null,
				newHeight = 0;
				
			if(_.openArray[0] != openingIndex){
				$newContent = $(_.$content[openingIndex]);
				$newBtn = $(_.$btns[openingIndex]);
				$newMobileBtn = $(_.$mobileBtns[openingIndex]);
				newHeight = $newContent.children().outerHeight(true);
			}

			if (_.$contentWrap.css('box-sizing') == 'border-box') {
				newHeight += (parseInt(_.$contentWrap.css('borderTopWidth')) + parseInt(_.$contentWrap.css('borderBottomWidth')))
			}


			_.isAnimating = true;

			//Animate height if needed else just set height
			if (currentHeight != newHeight) {
				_.$contentWrap.css({ 'height': currentHeight }).animate({ 'height': newHeight }, _.defaults.animationSpeed, function () {
					_.$contentWrap.removeAttr('style').addClass('active');
				})

			} else {
				_.$contentWrap.css({ 'height': newHeight })
				setTimeout(function () {
					_.$contentWrap.removeAttr('style').addClass('active')
				}, _.defaults.animationSpeed)

			}

			//Close old array if needed
			if (_.openArray[0] != null) {
				var $oldContent = $(_.$content[_.openArray[0]])
				var $oldBtn = $(_.$btns[_.openArray[0]])
				var $oldMobileBtn = $(_.$mobileBtns[_.openArray[0]])

				//Remove Active from button Controls 
				if ($oldBtn != undefined) {
					$oldBtn.removeClass('active');
				}
				//Remove Active from Accordion Controls
				if ($oldMobileBtn != undefined) {
					$oldMobileBtn.removeClass('active');
				}
				//Make the old element absolute and behind the fading in element
				$oldContent.removeClass('active');
			}


			//Add Active to Desk Controls 
			if ($newBtn) {
				$newBtn.addClass('active');
			}
			//Add Active to Accordion Controls
			if ($newMobileBtn) {
				$newMobileBtn.addClass('active');
			}
			//Open the new element
			if ($newContent) {
				$newContent.addClass('active');
				setTimeout(function () {
					//Set the new open
					_.openArray = [openingIndex]
					_.isAnimating = false;
				}, _.defaults.animationSpeed)
			} else {
				//Set the new open
				setTimeout(function () {
					_.openArray = []
					_.isAnimating = false;
				}, _.defaults.animationSpeed)
			}
		} else {
			console.log('That IS the open one')
			_.isAnimating = false;
		}
	}

	elementToggle.prototype.updateCarousel = function (currentSlide, nextSlide) {
		var _ = this;
		//Add and remove classes
		if (currentSlide != nextSlide) {
			$(_.$btns[nextSlide]).addClass('active')
			$(_.$btns[currentSlide]).removeClass('active')
		}
		
	}
	
	elementToggle.prototype.initCarousel = function (openingIndex) {
		var _ = this;

		//Set the Open Slide
		if (_.defaults.slickSettings != null){
			if (_.defaults.slickSettings.hasOwnProperty('initialSlide')) {
				_.openArray = [_.defaults.slickSettings.initialSlide];
			}
			else {
				_.openArray = [0];
			}
		} else {
			_.openArray = [0];
		}

		//Initalize Slick
		_.$contentWrap.slick(_.defaults.slickSettings)

		//Filter the Accordion Buttons out of the Slides
		_.$contentWrap.slick('slickFilter', '.' + _.defaults.classContent)

		if (_.defaults.abilityMenuControl) {
			//Make the current Menu Active
			var openSlide = _.$contentWrap.slick('slickCurrentSlide')
			$(_.$btns[openSlide]).addClass('active')

			//Update the Menu Controls before it changes
			_.$contentWrap.on('beforeChange', function (e, slick, currentSlide, nextSlide) {
				_.updateCarousel(currentSlide, nextSlide);
			});
		}
		

		//Update the Open Array After it changes
		_.$contentWrap.on('afterChange', function (e, slick, currentSlide) {
			_.openArray = [currentSlide];
			console.log(_.openArray)
		});

		//If carousel is being Reinitalized from mobile change then it might have an opening index
		if (openingIndex != null) {
			_.$contentWrap.slick('slickGoTo', openingIndex)
		} else if (_.defaults.initialElement != 0) {
			_.$contentWrap.slick('slickGoTo', _.defaults.initialElement)
		}
	
		



	};

	elementToggle.prototype.destroyCarousel = function () {
		var _ = this;

		//Unfilter 
		_.$contentWrap.slick('slickUnfilter');
		


		//Unbind the Listeners
		_.$contentWrap.off('afterChange');
		_.$contentWrap.off('beforeChange');
		
		
		//Destroy Slick
		_.$contentWrap.slick('unslick')

		_.$mobileBtns.on('click.elementToggle', _.changeElement);
	};

	$.fn.elementToggle = function() {

		//Puts element Control into jQuery Namespace
		var _ = this, opt = arguments[0], args = Array.prototype.slice.call(arguments,1), l = _.length, i = 0, ret;
		for(i; i < l; i++) {
			if (typeof opt == 'object' || typeof opt == 'undefined')
				_[i].elementToggle =  new elementToggle(_[i], opt);
			else
				ret = _[i].elementToggle[opt].apply(_[i].elementToggle, args);
			if (typeof ret != 'undefined') return ret;
		}
		return _;
	};

}));
		
