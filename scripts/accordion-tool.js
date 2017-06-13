// Accordion Tool
(function (factory) {

    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}
    (function ($) {
        'use strict';
        var accordionTool = window.accordionTool || {};

        accordionTool = (function() {	
            function accordionTool(element, settings){
            var _ = this;

            //Class Names
            _.classNames = $.extend({
                triggerClass: "aButton",
                contentClass: "aContent"
            }, settings);

            //Defaults
            _.$element = $(element);
            _.$triggers = null;
            _.$content = null;

            //Setup the Methods with click listeners because "this" needs to be correct for clicks
            _.toggleAccordion = $.proxy(_.toggleAccordion, _);

            //Initalize the thing
            _.init();
        }

        return accordionTool;

    }());


    //All public Methods go here
    accordionTool.prototype.init = function () {

        var _ = this;

        //Set Up the Tab Triggers
        _.$triggers = $(_.$element).find('.' + _.classNames.triggerClass);
        _.$triggers.each(function (index, element) {
            $(element).attr("data-index", index).on('click.accordionTool', _.toggleAccordion);
        });

        //Set Up the Tab Content
        _.$content = $(_.$element).find('.' + _.classNames.contentClass);

    };

    accordionTool.prototype.toggleAccordion = function (e) {

        var _ = this,
        targetIndex = $(e.delegateTarget).data('index');

        //Animate the height 
        var oldHeight = $(_.$content[targetIndex]).outerHeight(true);
        var newHeight = (oldHeight <= 0) ? $(_.$content[targetIndex]).children().outerHeight(true) : 0;

        $(_.$content[targetIndex]).css({ 'height': (oldHeight + 'px'), 'position': 'relative', 'overflow': 'hidden' }).animate({
            height: newHeight
        }, 250, function () {
            $(_.$content[targetIndex]).removeAttr('style')
        });

        $(_.$content[targetIndex]).toggleClass('active');
        $(_.$triggers[targetIndex]).toggleClass('active');

    };

    $.fn.accordionTool = function() {

        //Puts it into jQuery Namespace?
        var _ = this, opt = arguments[0], args = Array.prototype.slice.call(arguments, 1), l = _.length, i = 0, ret;

        for(i; i < l; i++) {
            if (typeof opt === 'object' || typeof opt === 'undefined') {
                _[i].accordionTool = new accordionTool(_[i], opt);
            } else {
                ret = _[i].accordionTool[opt].apply(_[i].accordionTool, args);
            }

            if (typeof ret !== 'undefined') return ret;
        }

        return _;

    };

}));
	
