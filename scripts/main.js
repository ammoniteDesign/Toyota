$(document).ready(function () {
	//Initalize NavControl
	$('#mainNav').elementToggle({
		abilityTabsClose: true,
		abilityMenuToggle: true,
		mobileBreakpoint: 780
	});

	if ($('#featureArea').length > 0) {
		$('#featureArea').elementToggle({
			mobileBreakpoint: 600
		});
	}

	if ($('#modelCarousel').length > 0) {
		$('#modelCarousel').slick({
			dots: true
		});
	}
	if ($('#modelCopy1').length > 0) {
		$('#modelCopy1').accordionTool({
			triggerClass: "aButton3",
			contentClass: "aContent3"
		});
	}
	if ($('#modelCopy2').length > 0) {
		$('#modelCopy2').accordionTool({
			triggerClass: "aButton4",
			contentClass: "aContent4"
		});
	}
	
	//Call the webform Tool and accodion Tools
	//Code for the Webforms
	if ($('#webform').length > 0) {
		$('#webform').webformTool();
	}
	////Code for the Webform Accordion(s)
	if ($('#webformWrap').length > 0) {
		$('#webformWrap').accordionTool();
	}
	if ($('#tradeAccordion').length > 0) {
		$('#webform').accordionTool({
			triggerClass: "aButton2",
			contentClass: "aContent2"
		});
	}

	//Code for the Webform Accordion(s)
	if ($('.js-accordion').length > 0) {
		$('.js-accordion').accordionTool();
	}

	//Scroll Time!
	if ($('.js-scrollUp').length > 0) {
		$('.js-scrollUp').on('click', function () {
			$('html, body').animate({ scrollTop: 0 }, 800);
		})
	}

});
