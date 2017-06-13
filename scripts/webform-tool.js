/*
 Tool for Webforms
 */
(function (factory) {
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

	var webformTool = window.webformTool || {};

	webformTool = (function () {
		function webformTool(element) {
			var _ = this;

			//Name the properties
			_.urlParams = null;
			_.$element = $(element);
			_.formType = null;
			_.submitURL = null;
			_.autoModelPage = {};
			_.make = null;
			_.models = [];
			_.tradeYear = null;
			_.tradeMake = null;
			_.tradeModel = null;
			_.tradeTrim = null;
			_.$yearInput = null;
			_.$makeInput = null;
			_.$modelInput = null;
			_.$trimInput = null;
			_.$stockInput = null;
			_.$vinInput = null;
		    _.$provideAdditionalInformationInput = null;
			_.$tradeYearInput = null;
			_.$tradeMakeInput = null;
			_.$tradeModelInput = null;
			_.$tradeTrimInput = null;
			_.$tradeToggleInput = null;
			_.$dateInput = null;
			_.$submitButton = null;
			

			//Setup the Methods that are click calls/User calls
			_.setMake = $.proxy(_.setMake, _);
			_.setModel = $.proxy(_.setModel, _);
			_.setYear = $.proxy(_.setYear, _);
			_.setTradeYear = $.proxy(_.setTradeYear, _);
			_.setTradeMake = $.proxy(_.setTradeMake, _);
			_.setTradeModel = $.proxy(_.setTradeModel, _);
			_.submit = $.proxy(_.submit, _);

			//Initalize the thing
			_.init();
		}
		return webformTool;
	}());

	//Set Up the Webform
	webformTool.prototype.init = function () {
		var _ = this;

		//Set the Properties/Submit
		_.formType = _.$element.data('formType');
		switch (_.formType) {
			case "Msc":
				_.submitURL = "//smslogin.outsell.com/gateway/contactmanager_keyword.asp";
				break;
			case "Unsubscribe":
				_.submitURL = "/Microsite/unsubscribe";
				break;
			case "Subscribe":
				_.submitURL = "Microsite/Subscribe";
				break;
			default:
				_.submitURL = "/api/WebFormSubmission/" + _.formType;
				break;
		}

		_.$submitButton = $("#webformSubmit");
		_.$submitButton.on('click', function (e) {
			e.preventDefault();
			_.submit();
		})

		//Attach things to the inputs
		var formInputs = _.$element.find(':input');	
		for (var i = 0; formInputs.length > i; i++) {		
			//Attach Labels TODO: skip if no label
			if (formInputs[i].labels == undefined) {
				var inputId = formInputs[i].getAttribute('id');
				if (inputId != null) {
					formInputs[i].labels = [document.querySelector("label[for=" + inputId + "]")];
				}
			}
		}

		//Set Up the URL params
		_.urlParams = _.getUrlParams();

		//Set up the Vehicle of Interest Portion
		if (_.$element.find(".webformVehicle").length > 0) {
			//Set up The "Vehicle of Interest" jQuery objects 
			_.$makeInput = $("#webformVehicleMake");
			_.$modelInput = $("#webformVehicleModel");
			_.$yearInput = $("#webformVehicleYear");
			_.$trimInput = $("#webformVehicleTrim");
			_.$stockInput = $("#webformVehicleStockNumber");
			_.$vinInput = $("#webformVehicleVin");
			_.$provideAdditionalInformationInput = $("#webformVehicleMoreInfo");

			//Set Up the Triggers
			_.$makeInput.change(_.setMake)
			_.$modelInput.change(_.setModel)
			_.$yearInput.change(_.setYear)
			
			//Set Make if it's pre-selected
			if (_.$makeInput.find(":selected").index() > 0) {
				_.setMake()
			}
		}

		//Set up the Trade Vehicle Portion
		if (_.$element.find(".webformTradeVehicle").length > 0) {
			//Set up The "Trade In" jQuery objects 
			_.$tradeToggleInput = $("#webformHaveTrade");
			_.$tradeYearInput = $("#webformTradeInYear");
			_.$tradeMakeInput = $("#webformTradeInMake");
			_.$tradeModelInput = $("#webformTradeInModel");
			_.$tradeTrimInput = $("#webformTradeInTrim");

			//Set Up the Triggers
			_.$tradeYearInput.change(_.setTradeYear)
			_.$tradeMakeInput.change(_.setTradeMake)
			_.$tradeModelInput.change(_.setTradeModel)


			//Get The Trade Years Then Set them if prefill data exists
			$.getJSON("/api/VehicleDropDown/GetYears", function (response) {
				var yearArray = [];
				for (var i = 0; response.data.length > i; i++) {
					yearArray.push(response.data[i].value)
				}
				yearArray.reverse();
				_.createDropDown(yearArray, yearArray, _.$tradeYearInput)

			}).then(function () {
				if (_.$tradeYearInput.data('prefill') != "" && _.$tradeYearInput.data('prefill') != undefined) {
					_.selectPrefill(_.$tradeYearInput, "value" [_.$tradeMakeInput, _.$tradeModelInput, _.$tradeTrimInput]);
					_.setTradeYear();

				}
			});
		}

		//Set up the Auto Model Page Data
		if (_.$element.find(".webformModelPage").length > 0) {
			_.setAutoModel();
		}

		//Set up the Test Drive Portion
		if (_.$element.find(".webformTestDrive").length > 0) {
			//TODO: Set Up the Hours
		}
	}

	//Set the Auto Model Page the Form is on
	webformTool.prototype.setAutoModel = function () {
		var _ = this;

		var year = _.$element.find(".webformModelPage .year").val()
		var make = _.$element.find(".webformModelPage .make").val()
		var model = _.$element.find(".webformModelPage .model").val()

		if (year != "") {
			$.getJSON("/api/VehicleDropDown/GetMakesByYear?year=" + year, function (response) {
				for (var i = 0; response.data.length > i; i++) {
					if (make.toLowerCase() == response.data[i].text.toLowerCase()) {
						make = response.data[i].value
					}
				}
				$.getJSON("/api/VehicleDropDown/GetModels?makeId=" + make + "&year=" + year, function (response) {
					for (var i = 0; response.data.length > i; i++) {
						if (model.toLowerCase() == response.data[i].text.toLowerCase()) {
							model = response.data[i].value
						}
					}
					_.autoModelPage = {
						"year": year,
						"make": make,
						"model": model
					}
				})
			})
		}
		
	}


	//TODO: See if we can compress the "Set" methods
	//SetMake, Get and Enable Models for VOH
	webformTool.prototype.setMake = function () {
		var _ = this;
		
		//Empty out the Models/Years/Trims
		_.emptyInputs([_.$modelInput, _.$yearInput, _.$trimInput])


		//Check to make sure they selected an actual Make
		if (_.$makeInput.find(":selected").index() != 0) {
			//Set the Selected Make and get the models
			_.make = _.$makeInput.find(":selected").attr("value");
			_.models = [];
			var modelArray = [];
			var startYear = new Date().getFullYear() - 1;
			var endYear = new Date().getFullYear() + 1;

			//Get the Models for that Make
			$.getJSON("/api/Vehicle/GetModels?makeId=" + _.make + "&startYear=" + startYear + "&endYear=" + endYear, function (response) {
				var modelObject = {}

				//Loop through the response and build the _.model array from it
				for (var i = 0; response.data.length > i; i++) {
					//Cull all cars before cut off year and after too
					if (response.data[i].year >= startYear && response.data[i].year <= endYear) {
						//Is this the first for this car set up a new modelObject
					    if (modelArray.indexOf(response.data[i].model) == -1) {
					        modelArray.push(response.data[i].model);
							modelObject = {}
							modelObject.name = response.data[i].model;
							modelObject.years = []
						}

						//Push an Year Object into the modelObject.year array
						modelObject.years.push({ year: response.data[i].year, id: response.data[i].modelId })

						//Push the Model Object into Models if we've reached the end OR the next one is different OR the next one is outside the endYear
						if (response.data.length == i + 1) {
							_.models.push(modelObject);
						} else if (response.data[i].model != response.data[(i + 1)].model) {
							_.models.push(modelObject);

						} else if (response.data[(i + 1)].year > endYear) {
							_.models.push(modelObject);
						}


					}
				}

				if (response.data.length > 0) {
				    //Create a dropdown for the Models
				    _.createDropDown(modelArray, modelArray, _.$modelInput);

					//Enable the Models
					_.activateInputs([_.$modelInput])

				} else {
					console.log("Error: The API call failed")
				}

			}).then(function () {
				if (_.$modelInput.data('prefill') != "" && _.$modelInput.data('prefill') != undefined) {
					_.selectPrefill(_.$modelInput, "text", [_.$yearInput]);
					_.setModel();

				}
			})
		}

	}
	//Set Model, Get and Enable Years for VOH
	webformTool.prototype.setModel = function () {
		var _ = this;

		//Empty out the Models/Years/Trims
		_.emptyInputs([_.$yearInput, _.$trimInput]);

		//Check to make sure they selected an actual Model
		if (_.$modelInput.find(":selected").index() != 0) {
			var selectedIndex = _.$modelInput.find(":selected").index();
			var modelYears = _.models[selectedIndex - 1].years;
			var yearArray = [];
			var idArray = [];

			for (var i = 0; modelYears.length > i; i++) {
				yearArray.push(modelYears[i].year)
				idArray.push(modelYears[i].id)
			}
			yearArray.reverse();
			idArray.reverse();
			//Create a dropdown for the Models
			_.createDropDown(idArray, yearArray, _.$yearInput);

			//Enable the Years
			_.activateInputs([_.$yearInput])

			//Check if there's prefill data and select it
			if (_.$yearInput.data('prefill') != "" && _.$yearInput.data('prefill') != undefined) {
				_.selectPrefill(_.$yearInput, "text");
				_.setYear();

			}
		}


	}
	//Set Year, Get and Enable Trims for VOH
	webformTool.prototype.setYear = function () {
		var _ = this;
		//Empty Out Trims
		_.emptyInputs([_.$trimInput])

		//Check to make sure they selected an actual Make
		if (_.$yearInput.find(":selected").index() != 0) {
			//Set the Selected Make and Model
			var selectedYear = _.$yearInput.find(":selected").text();
			var selectedModelId = _.$yearInput.find(":selected").attr("value");

			var trimArray = []
			var trimIdArray = []

			//Get the Trims for that Models
		    $.getJSON("/api/VehicleDropDown/GetTrims?makeId=" +
		        _.make +
		        "&modelId=" +
		        selectedModelId +
		        "&year=" +
		        selectedYear,
		        function(response) {


		            for (var i = 0; response.data.length > i; i++) {
		                trimArray.push(response.data[i].text)
		                trimIdArray.push(response.data[i].value)
		            }
		            if (response.data.length > 0) {
		                //Create a dropdown for the Models
		                _.createDropDown(trimIdArray, trimArray, _.$trimInput);

		                //Enable the Models
		                _.activateInputs([_.$trimInput])


		            } else {
		                console.log("Error: The API call failed")
		            }

		        }).then(function() {
		            //Check if there's prefill data and select it
		            if (_.$trimInput.data('prefill') != "" && _.$trimInput.data('prefill') != undefined) {
		                _.selectPrefill(_.$trimInput, "text");

		            }
		    });
		}



	}

	//Set the Trade In Year (get and enable make)
	webformTool.prototype.setTradeYear = function () {
		var _ = this;
		//Empty out the Makes/Models/Trims
		_.emptyInputs([_.$tradeMakeInput, _.$tradeModelInput, _.$tradeTrimInput])
		

		//Check to make sure they selected an actual Year
		if (_.$tradeYearInput.find(":selected").index() != 0) {

			//Set the Trade In Year
			_.tradeYear = _.$tradeYearInput.find(":selected").attr("value");

			//Get the Makes for that Year
			$.getJSON("/api/VehicleDropDown/GetMakesByYear?year=" + _.tradeYear, function (response) {
				var makeArray = [];
				var valueArray = [];

				for (var i = 0; response.data.length > i; i++) {
					makeArray.push(response.data[i].text)
					valueArray.push(response.data[i].value)
				}

				//Create a dropdown for the Makes
				_.createDropDown(valueArray, makeArray, _.$tradeMakeInput);

				//Enable the TradeIn Makes
				_.activateInputs([_.$tradeMakeInput])


			}).then(function () {
				if (_.$tradeMakeInput.data('prefill') != "" && _.$tradeMakeInput.data('prefill') != undefined) {
					_.selectPrefill(_.$tradeMakeInput, "value" [_.$tradeModelInput, _.$tradeTrimInput]);
					//Call Set Make
					_.setTradeMake();

				}
			})
		}

	}
	//Set the Trade In Make (get and enable model)
	webformTool.prototype.setTradeMake = function () {
		var _ = this;
		//Empty out the Models/Trims
		_.emptyInputs([_.$tradeModelInput, _.$tradeTrimInput])

		//Check to make sure they selected an actual Make
		if (_.$tradeMakeInput.find(":selected").index() != 0) {

			//Set the Trade In Make
			_.tradeMake = _.$tradeMakeInput.find(":selected").attr("value");

			//Get the Models for that Make
			$.getJSON("/api/VehicleDropDown/GetModels?makeId=" + _.tradeMake + "&year=" + _.tradeYear, function (response) {
				var modelArray = [];
				var valueArray = [];

				for (var i = 0; response.data.length > i; i++) {
					modelArray.push(response.data[i].text)
					valueArray.push(response.data[i].value)
				}

				//Create a dropdown for the Makes
				_.createDropDown(valueArray, modelArray, _.$tradeModelInput);

				//Enable the TradeIn Makes
				_.activateInputs([_.$tradeModelInput])
				


			}).then(function () {
				if (_.$tradeModelInput.data('prefill') != "" && _.$tradeModelInput.data('prefill') != undefined) {
					_.selectPrefill(_.$tradeModelInput, "value" [_.$tradeTrimInput]);
					//Call Set Make
					_.setTradeMake();

				}
			})
		}

	}
	//Set the Trade In Model (get and enable trims)
	webformTool.prototype.setTradeModel = function () {
		var _ = this;
		//Empty out the Trims
		_.emptyInputs([_.$tradeTrimInput])

		//Check to make sure they selected an actual Make
		if (_.$tradeModelInput.find(":selected").index() != 0) {

			//Set the Trade In Make
			_.tradeModel = _.$tradeModelInput.find(":selected").attr("value");

			//Get the Models for that Make
			$.getJSON("/api/VehicleDropDown/GetTrims?makeId=" + _.tradeMake + "&year=" + _.tradeYear + "&modelId=" + _.tradeModel, function (response) {
				var trimArray = [];
				var valueArray = [];

				for (var i = 0; response.data.length > i; i++) {
					trimArray.push(response.data[i].text)
					valueArray.push(response.data[i].value)
				}

				//Create a dropdown for the Trims
				_.createDropDown(valueArray, trimArray, _.$tradeTrimInput);

				//Enable the Trims
				_.activateInputs([_.$tradeTrimInput])

			}).then(function () {
				if (_.$tradeTrimInput.data('prefill') != "" && _.$tradeTrimInput.data('prefill') != undefined) {
					_.selectPrefill(_.$tradeTrimInput, "value");

				}


			});
		}

	}

	//TODO: Webform Hours
	webformTool.prototype.getHours = function () {
		var _ = this;
	}

	//Node Creation Method
	webformTool.prototype.createDropDown = function (value, text, node) {
		var list = document.createDocumentFragment();
		var count = value.length;

		for (var i = 0; count > i; i++) {
			var option = document.createElement("option")
			var optionText = document.createTextNode(text[i])
			option.setAttribute("value", value[i])
			option.appendChild(optionText)
			list.appendChild(option)
		}
		node[0].appendChild(list)
	}

	//Empty the inputs of Data
	webformTool.prototype.emptyInputs = function (inputs) {
		for (var i = 0; inputs.length > i; i++) {
			inputs[i].find('option:not(:first)').remove();
			inputs[i].attr("disabled", true);
			$(inputs[i][0].labels[0]).addClass("disabled");
		}
	}
	//Activate Inputs
	webformTool.prototype.activateInputs = function (inputs) {
		for (var i = 0; inputs.length > i; i++) {
			inputs[i].attr("disabled", false);
			$(inputs[i][0].labels[0]).removeClass("disabled");	
		}
	}

	//Select Prefill Data
	webformTool.prototype.selectPrefill = function (node, checkValue, badData) {
		var found = false;
		var prefillData = node.data('prefill').toString().toLowerCase();

		//Set the Input (need to do a for loop for lower-case)
		node.children().each(function (index, element) {
			var elementValue = null;
			if(checkValue === "text") {
				elementValue = element.text.toString().toLowerCase()
			}else {
				elementValue = element.value.toString().toLowerCase()
			}
			if (elementValue == prefillData) {
				$(element).prop("selected", true);
				found = true;
			}
		});

		//Kill the data
		node.removeData('prefill').removeAttr("data-prefill")
				
		//If the model wasn't found kill ALL prefill data
		if (!found && badData.length > 0) {
			for (var i = 0; badData.length > i; i++) {
				badData[i].removeData('prefill').removeAttr("data-prefill")
			}
		}
	}

	//Serialize the Form Data
	webformTool.prototype.serializeObject = function (obj) {
		var o = {};
		var a = obj.find(':input').serializeArray();
		$.each(a, function () {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;

	}

	//Get the needed Data from the URL
	webformTool.prototype.getUrlParams = function() {
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for (var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	}
	
	//Regex the Data
	webformTool.prototype.checkInput = function (element) {
		var regEmail = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
		var regNum = new RegExp(/^[0-9-+s().]*$/);

		//If Sort Input and Select
		if (element.tagName == "INPUT") {
			switch (element.getAttribute("type")) {
				case "text":
					if (element.value.length == 0) {
						return false

					} else {
						return true
					}
				case "tel":
					var telephone = element.value.replace(/\D/g, '');
					if (telephone.length === 11 && telephone.substring(0, 1) == "1") {
						telephone = telephone.substring(1)
					}
					if (telephone.length != 10 || telephone.substring(0, 3).includes("900"))  {
						return false
					} else {
						return true
					}
				case "number":
					if (regNum.test(element.value) && element.value.length != 0) {
						return true
					} else {
						return false
					}
				case "email":
					if (regEmail.test(element.value)) {
						return true
					} else {
						return false
					}
				default:
					console.log("Unknown Type")
					return true;
			}
		} else if (element.tagName == "SELECT") {
			if (element.selectedIndex == 0) {
				return false
			} else {
				return true
			}
		} else if (element.tagName == "TEXTAREA") {
			if (element.value.length == 0) {
				return false

			} else {
				return true
			}
		} else {
			console.log('Error in vaidation')
			return false
		}


	}

	//Form Submit Method TODO: This should be 3 methods.... Too BIG
	webformTool.prototype.submit = function () {
		var _ = this;
		var tradeInOpen = false;
		var formIsGood = true;

		//Disable Submit button
		_.$submitButton.addClass('inactive');

		//Remove all inputRequired classes
		_.$element.find('.inputRequired').removeClass('inputRequired')

		//Remove "required" from Trade In if it's not open (except on the Trade in form) OR if the trade in year hasn't been selected
		if ((_.formType != "ValueTrade" || _.formType != "ConfirmAvailability") && _.$tradeToggleInput != undefined) {
			if (_.$tradeToggleInput.is(":checked") && _.$tradeYearInput.find(":selected").index() != 0) {
				//Needs to be Added!
				_.$element.find('.webformTradeVehicle .conditionalRequired').attr("required", "true");
				tradeInOpen = true;
			} else {
				//Remove!
				_.$element.find('.webformTradeVehicle .conditionalRequired').removeAttr("required");
				tradeInOpen = false;
			}
		}
		
		//Add or Remove Required from Inputs depending upon checkboxes/radios.
		var selectedInputs = _.$element.find('.selectedRequired');
		for (var i = 0; selectedInputs.length > i; i++) {
			var linkedItem = document.getElementById(selectedInputs[i].getAttribute('data-inputLink'));
			if (linkedItem.checked == true) {
				$(selectedInputs[i]).attr("required", "true");
			} else {
				$(selectedInputs[i]).removeAttr("required")
			}
		}
		
		//Grab EVERYTHING that's required and check em
		var required = _.$element.find('input,textarea,select').filter('[required]');
		var badInput = [];

		for (var i = 0; required.length > i; i++) {
			if (!_.checkInput(required[i])) {
				//Input is BAD
				formIsGood = false;
				badInput.push(required[i]);
				if (required[i].labels.length > 0) {
					badInput.push(required[i].labels[0]);
				}
			}
		}
	
		//Check the Recaptcha (only on Live)
		if (window.location.hostname.indexOf('www') != -1 && _.formType != "Msc") {
			if(grecaptcha.getResponse() == ""){
				formIsGood = false;
			}
			
		}
		
		//Stop here if Errors
		if (!formIsGood) {
			//Add the Classes to the badInput (less touch the DOM)
			for (var i = 0; badInput.length > i; i++) {
				$(badInput[i]).addClass("inputRequired")
			}
			_.$submitButton.removeClass('inactive');
		} else {
			//Basic (aka Contact Us/Feedback)
			var formData = _.serializeObject(_.$element.find(".webformConsumer"))

			//Get Params from URL
			formData["broadcastId"] = _.urlParams.osa_bid
			formData["clientId"] = _.urlParams.osa_did
			formData["consumerId"] = _.urlParams.osa_uid

			//Strip out from the telephone any non-numerical numbers and remove the first number if it's 11 digits long (validation checks that it is a "1").
			if (formData.phone != null) {
				formData.phone = formData.phone.replace(/\D/g, '');
				if (formData.phone.length === 11) {
					formData.phone = formData.phone.substring(1)
				}
			}

			//If Contact Preferece is a Radio on the form, turn it into the data dev is looking for
			if (formData.contactPreference != null) {
				if (document.getElementById("isEmailSelected").checked) {
					formData.isEmailSelected = "on";
				}
				if (document.getElementById("isPhoneSelected").checked) {
					formData.isPhoneSelected = "on";
				}
			}			

			//Trade In or if Trade In is open on other forms
			if (tradeInOpen || _.formType === "TradeIn") {
				formData["tradeInVehicle"] = _.serializeObject(_.$element.find(".webformTradeVehicle"))
				formData.tradeInVehicle.isTradeIn = tradeInOpen;
			}
			
			//Vehicle Of Interest
			if (_.formType === "TestDrive" || _.formType === "GetAQuote") {
				formData["vehicleOfInterest"] = _.serializeObject(_.$element.find(".webformVehicle"))

			    //Juggle the Data for Dev because reasons:
			    // there is a difference with how we store data vs edmunds
			    // in edmunds they car eyear first while we are model first.
			    // because of this a particular car's id is really its edmundsmodelyearId which is specific to the year / model of the car
                // The form stores the modelyearId in the value of the year which then is mapped during the submission to "model"
				formData["vehicleOfInterest"]["model"] = formData["vehicleOfInterest"]["year"];
				formData["vehicleOfInterest"]["year"] = _.$yearInput.find(":selected").text();
			}

		    //Vehicle of interest again
			if (_.formType === "ConfirmAvailability") {
			    formData["vehicleOfInterest"] = {};
			    formData["vehicleOfInterest"]["model"] = _.$yearInput[0].tagName !== "INPUT" ? _.$yearInput.val() : _.$modelInput.val(); //Input year? why not model id of some sort? same reason above.
			    formData["vehicleOfInterest"]["make"] = _.$makeInput.val();
			    formData["vehicleOfInterest"]["year"] = _.$yearInput[0].tagName !== "INPUT" ? _.$yearInput.find(":selected").text() : _.$yearInput.val();
			    formData["vehicleOfInterest"]["trim"] = _.$trimInput.val();
			    formData["vehicleOfInterest"]["stock"] = _.$stockInput.val();
			    formData["vehicleOfInterest"]["vin"] = _.$vinInput.val();
			    formData["vehicleOfInterest"]["provideAdditionalInformation"] = _.$provideAdditionalInformationInput.is(":checked");
			}

			//Model Page (this will be null if the autoModel info doesn't exist)
			if(_.autoModelPage != null){
				formData["autoModel"] = _.autoModelPage
			}

			if (_.formType == "Msc") {
				formData["mobile1"] = formData["phone"].slice(0, 3)
				formData["mobile2"] = formData["phone"].slice(3, 6)
				formData["mobile3"] = formData["phone"].slice(6, 10)
			}
			
			$.ajax({
				url: _.submitURL,
				type: "POST",
				contentType: "application/json",
				data: JSON.stringify(formData),
				success: function () {
					if (document.getElementById('webformSuccess') != null) {
						_.$element.addClass('hidden');
						$('#webformSuccess').removeClass('hidden');
					} else {
					    var message = _.$element.data("thankYouMessage");

					    if (message == null) {
					        message = "Thank you for your interest. You'll be hearing from us soon.";
					    }
					    alert(message);
					}
					
					if(typeof trackEvent === "function") {
						trackEvent("Click", "SubmitWebform", {}, {osa_topic: _.formType})
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert("An error has occured, please try again later.");
					if (XMLHttpRequest.responseJSON != undefined) {
						console.log("Webform Error: " + XMLHttpRequest.responseJSON["Message"])
					} else {
						//TODO: this probably is a coder error not a browser error
						console.log("Webform Error: responseJson is having issues check the network tab")
					}
					
				},
				complete: function () {
					_.$submitButton.removeClass('inactive');
				}
			});
		}
	}

	//Put the Plugin into the JQuery Namespace and enable it for multiple instances
	$.fn.webformTool = function () {

		//Puts Webform into jQuery Namespace
		var _ = this, opt = arguments[0], args = Array.prototype.slice.call(arguments, 1), l = _.length, i = 0, ret;
		for (i; i < l; i++) {
			if (typeof opt == 'object' || typeof opt == 'undefined')
				_[i].webformTool = new webformTool(_[i], opt);
			else
				ret = _[i].webformTool[opt].apply(_[i].webformTool, args);
			if (typeof ret != 'undefined') return ret;
		}
		return _;
	};

}));
