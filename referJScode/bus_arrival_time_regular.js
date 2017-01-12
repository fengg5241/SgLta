(function($) {
	$(function() {
		var resourcePath = $('.bus-arrival-time-container .bus_arrival_time_path').val()
		var $container = $('.bus-arrival-time-container');
		var AUTO_REFRESH_INTERVAL = 20 * 1000;
		
		function refreshDropdownValue(el) {
			var $el = $(el);
			var text = $el.find('option:selected').text();
			$el.prev('.drop-down').children('p').text(text);
		}
	
		function refreshBusArrivalTimeDropdown() {
			$container.find('select').each(function() {
				if ($(this).prev('.drop-down').size() == 0) {
					$(this).before('<div class="drop-down"><p></p></div>');
					$(this).change(function() {
						refreshDropdownValue(this);
					});
				}
				refreshDropdownValue(this);
			});
		}
		
		function resetDirection() {
			var direction = '<option value="default">Select Direction</option>';
			$container.find('.direction').html(direction).parent().parent().hide();
			resetBusStop();
		}
		
		function resetBusStop() {
			var busStopId = '<option value="default">Select Bus Stop</option>';
			$container.find('.bus-stop').html(busStopId).parent().parent().hide();
			refreshBusArrivalTimeDropdown();
		}
		
		function isNotDefaultOption(val) {
			return val != 'default';
		}
		
		function toggleBusStop(busStopId) {
			var $busStopTrigger = $container.find('.svc_result .trigger[bus-stop-id=' + busStopId + ']');
			$busStopTrigger.toggleClass("active").next('.toggle_container').slideToggle();
			
			if ($container.find('.svc_result .trigger.active').size() == 0) {
				$container.find('.svc_result .toggle').removeClass("active");
			} else if ($container.find('.svc_result .trigger.active').size() == $container
							.find('.svc_result .trigger').size()) {
				$container.find('.svc_result .toggle').addClass("active");
			}
		}
		
		function closeAllBusStops() {
			$container.find('.svc_result .trigger.active').each(function() {
				toggleBusStop($(this).attr('bus-stop-id'));
			});
		}
		
		function toggleAllBusStops() {
			var isToggleActive = $(this).hasClass('active');
			$container.find('.svc_result .trigger').each(function() {
				if ($(this).hasClass('active') == isToggleActive) {
					toggleBusStop($(this).attr('bus-stop-id'));
				}
			});
		}
		
		function displayBusStop(busStop, isSingleBus) {
			if (busStop.busStopId != null && busStop.buses.length > 0) {
				$container.find('.svc_result').show();
				
				var $busStopContainer = $container.find('.svc_result .toggle_container[bus-stop-id=' + busStop.busStopId + ']');
				
				// create new bus stop
				if ($busStopContainer.size() == 0) {
					var busStopTrigger = '<div class="trigger" bus-stop-id="'
						+ busStop.busStopId
						+ '" longitude="'
						+ busStop.longitude
						+ '" latitude="'
						+ busStop.latitude
						+ '"><div class="data_label_box">'
						+ busStop.busStopId
						+ ' - '
						+ busStop.busStopDescription
						+ '</div><button class="res_view_map"></button></div>';
					var $busStopTrigger = $(busStopTrigger).appendTo($container.find('.svc_result .bus-stops'));
					
					$busStopTrigger.click(function() {
	    				toggleBusStop(busStop.busStopId);
	    			});
	    			$busStopTrigger.find('.res_view_map').click(function(event) {
	    				var lon = $busStopTrigger.attr('longitude');
	    				var lat = $busStopTrigger.attr('latitude');
	    				if (lon != null && lat != null) {
	    					window.open(
	    						'/html/map.html?overlay=&lon=' + lon + '&lat=' + lat,
	    						'map_window',
	    						'height=460,width=560,resizable=0,toolbar=0,scrollbars=0,menubar=0,status=0,directories=0'
	    					).focus();
	    				} else {
	    					alert("Bus Stop location not found");
	    				}
	    				event.stopPropagation();
	    			});
					
					var busStopContainer = '<div class="toggle_container hidden" bus-stop-id="'
						+ busStop.busStopId
						+ '"><div class="scv_result_header scv_result_detail"><ul><li class="bus_arrival_result_ch">Select</li><li class="bus_arrival_result_bn">Bus No.</li><li class="bus_arrival_result_ar"><div class="arrival-time">Arriving</div><div class="ol-wc"></div></li><li class="bus_arrival_result_nb"><div class="arrival-time">Next Bus</div><div class="ol-wc"></div></li></ul></div><div class="buses"></div><div class="scv_result_detail"><a class="view-all-buses" href="javascript: void(0);">Click here to view other buses</a></div></div>';
					$busStopContainer = $(busStopContainer).appendTo($container.find('.svc_result .bus-stops'));
		            
		            $busStopContainer.find('.view-all-buses').click(function() {
		            	var busStopId = $(this).parent().parent().attr('bus-stop-id');
		            	getBusArrivalTime(false, false, busStopId);
		            });
				}
				
				// update bus stop
				$(busStop.buses).each(function() {
					var $busServiceContainer = $busStopContainer.find('.buses .busReq[bus-service-id=' + this + ']');
					
					// create new bus service
					if ($busServiceContainer.size() == 0) {
		            	var busServiceContainer = '<div class="scv_result_detail busReq" bus-service-id="'
		            		+ this
		            		+'"><div><div class="bus_arrival_result_ch"><input type="checkbox" class="busCookieBox"></div><div class="bus_arrival_result_bn">'
		            		+ this
		            		+ '</div><div class="bus_arrival_result_ar"><div class="arrival-time"><div class="loading"></div></div><div class="occupancy-level"></div><div class="wheelchair"></div></div><div class="bus_arrival_result_nb"><div class="arrival-time"><div class="loading"></div></div><div class="occupancy-level"></div><div class="wheelchair"></div></div></div></div>';
		            	$busServiceContainer = $(busServiceContainer).appendTo($busStopContainer.find('.buses'));
					}
				});
				
				if (!isSingleBus) {
					$busStopContainer.find('.view-all-buses').parent().hide();
				}
			} else {
				alert('Please enter a valid bus stop code');
			}
		}
		
		function updateBusArrivalTime() {
			if ($container.find('.svc_result .busReq').size() > 0) {
				$.ajax({
					url: etaUrl,
					type: 'GET',
					dataType: 'jsonp',
					jsonp: 'callback',
					jsonpCallback: 'etaCallback',
					success: function(etaData) {
						$.ajax({
							url: ntpUrl,
							type: 'GET',
							dataType: 'jsonp',
							jsonp: 'callback',
							jsonpCallback: 'ntpCallback',
							success: function(ntpData) {
								var lastUpdated = moment(etaData[0], 'YYYYMMDDHHmmss').format('[Updated as of] D MMM YYYY HH:mm [hrs]');
								$container.find('.last-updated').text(lastUpdated);
								var busArrivalTimes = parseBusArrivalTime(etaData[1]);
								
								$container.find('.svc_result .busReq').each(function() {
									var busStopId = $(this).parent().parent().attr('bus-stop-id');
									var busServiceId = $(this).attr('bus-service-id');
									
									var at = ['N.A.', 'N.A.'];
					            	var ol = ['', ''];
					            	var wc = ['', ''];
					            	
									if (busArrivalTimes[busStopId] != null && busArrivalTimes[busStopId][busServiceId] != null) {
										var busArrivalTime = busArrivalTimes[busStopId][busServiceId];
										var selectedArrivals = [];
						            	for (var i = 0; i < busArrivalTime.length && selectedArrivals.length < 2; i++) {
						            		if (busArrivalTime[i].arrivalTime != '-') {
							            		busArrivalTime[i].arrivalTime = calculateArrivalMinites(busArrivalTime[i].arrivalTime, ntpData);
							            		if (busArrivalTime[i].arrivalTime >= 0) {
							            			selectedArrivals.push(busArrivalTime[i]);
							            		}
						            		}
						            	}
						            	
						            	if (selectedArrivals.length > 0) {
						            		at[0] = selectedArrivals[0].arrivalTime == '0' ? 'Arr' : selectedArrivals[0].arrivalTime + ' min';
						        			ol[0] = selectedArrivals[0].occupancyLevel;
						        			wc[0] = selectedArrivals[0].wheelchair;
						        			if (selectedArrivals.length > 1) {
						        				at[1] = selectedArrivals[1].arrivalTime == '0' ? 'Arr' : selectedArrivals[1].arrivalTime + ' min';
						            			ol[1] = selectedArrivals[1].occupancyLevel;
						            			wc[1] = selectedArrivals[1].wheelchair;
						        			}
						            	}
									}
					            	
									// update arrival time for bus service
					            	$(this).find('.arrival-time:eq(0)').text(at[0]);
					            	$(this).find('.arrival-time:eq(1)').text(at[1]);
					            	$(this).find('.occupancy-level:eq(0)').removeClass().addClass('occupancy-level occupancy-level-' + ol[0]);
					            	$(this).find('.occupancy-level:eq(1)').removeClass().addClass('occupancy-level occupancy-level-' + ol[1]);
					            	$(this).find('.wheelchair:eq(0)').removeClass().addClass('wheelchair wheelchair-' + wc[0]);
					            	$(this).find('.wheelchair:eq(1)').removeClass().addClass('wheelchair wheelchair-' + wc[1]);
								});
							}
						});
					}
				});
			}
		}
		
		function getBusArrivalTime(fromCookie, highlight, busStopId, busServiceIds) {
			var isSingleBus = busServiceIds != null;
			var url = resourcePath + '.getBusStop?query=' + busStopId;
			if (isSingleBus) {
				url += "_" + busServiceIds;
			}
			
			$.getJSON(url, function(busStop) {
				displayBusStop(busStop, isSingleBus);
				
				if (fromCookie) {
					$container.find('.busCookieBox').prop('checked', true);
				}
				if (highlight) {
					closeAllBusStops();
					toggleBusStop(busStopId);
				}
				
				updateBusArrivalTime();
			});
		}
		
		$container.find('.search-bus-stop-id').click(function() {
			var busStopId = $container.find('.bus-stop-id').val();
			if (busStopId != "") {
				getBusArrivalTime(false, true, busStopId);
			} else {
				alert('Please enter a bus stop code');
			}
		});
		
		$container.find('.bus-stop-id').keydown(function(e) {
			if (e.keyCode == 13) {
				$container.find('.search-bus-stop-id').click();
			}
			
			// reset bus service / stop searching
			$container.find('.bus-service').val('default');
			resetDirection();
		});
		
		$container.find('.bus-stop-id').placeholder();
		
		$.getJSON(resourcePath + '.getBuses?', function(data) {
			$(data).each(function() {
				var busServiceId = '<option value="' + this + '">' + this + '</option>'
				$container.find('.bus-service').append(busServiceId);
			});
			refreshBusArrivalTimeDropdown();
		});
		
		$container.find('.bus-service').change(function() {
			resetDirection();
			var busServiceId = $(this).val();
			if (isNotDefaultOption(busServiceId)) {
				$.getJSON(resourcePath + '.getDirections?busServiceId=' + busServiceId, function(data) {
					$(data).each(function() {
						var direction = '<option value="' + this.direction + '">' + this.description + '</option>'
						$container.find('.direction').append(direction).parent().parent().show();
					});
					refreshBusArrivalTimeDropdown();
				});
			}
		});
		
		$container.find('.direction').change(function() {
			resetBusStop();
			var busServiceId = $container.find('.bus-service').val();
			var direction = $(this).val();
			if (isNotDefaultOption(busServiceId) && isNotDefaultOption(direction)) {
				$.getJSON(resourcePath + '.getRoutes?busServiceId=' + busServiceId + "&direction=" + direction, function(data) {
					$(data).each(function() {
						var busStop = '<option value="' + this.busStopId + '">' + this.busStopId + ' - ' + this.busStopDescription + '</option>'
						$container.find('.bus-stop').append(busStop).parent().parent().show();
					});
					refreshBusArrivalTimeDropdown();
				});
			}
		});
		
		$container.find('.bus-stop').change(function() {
			var busServiceId = $container.find('.bus-service').val();
			var busStopId = $(this).val();
			if (isNotDefaultOption(busServiceId) && isNotDefaultOption(busStopId)) {
				getBusArrivalTime(false, true, busStopId, busServiceId);
			} else {
				alert('Please select a bus service / stop');
			}
		});
		
		$container.find('.get-bus-arrival-time').click(function() {
			$container.find('.bus-stop').change();
		});
		
		// reset bus stop id searching
		$container.find('.bus-service, .direction, .bus-stop').change(function() {
			$container.find('.bus-stop-id').val('');
		});
		
		$container.find('.svc_result .toggle').click(toggleAllBusStops);
		
		// auto refresh
		setInterval(updateBusArrivalTime, AUTO_REFRESH_INTERVAL);
		
		// load cookie
		var busCookie = $.cookie('bus_arrival_time');
		if (busCookie != null) {
			var buses = busCookie.split(',');
			$(buses).each(function() {
				var separatorIndex = this.indexOf('_');
				if (separatorIndex != -1) {
					var busStopId = this.substring(0, separatorIndex);
					var busServiceIds = this.substring(separatorIndex + 1);
					getBusArrivalTime(true, false, busStopId, busServiceIds);
				}
			});
			$container.find('#concierge_ctrl_reset').show();
		}
		
		$container.find('#concierge_ctrl_add').click(function() {
			var $checked = $container.find('.svc_result .busCookieBox:checked');
			if ($checked.size() == 0){
				alert('Please select at least one bus service');
			} else if ($checked.size() > 3) {
				alert('The no. of services selected has exceeded the maximum limit of 3');
			} else {
				var busStops = [];
				var busStopMap = {};
				$checked.each(function() {
					var busStopId = $(this).parents('.toggle_container').attr('bus-stop-id');
					var busServiceId = $(this).parents('.busReq').attr('bus-service-id');
					if (busStopMap[busStopId] == null) {
						busStopMap[busStopId] = [];
					}
					busStopMap[busStopId].push(busServiceId);
				});
				for (var i in busStopMap) {
					busStops.push(i + '_' + busStopMap[i].join('_'));
				}
				$.cookie('bus_arrival_time', busStops.join(','), { expires: 365, path: '/' });
				checkCookiesSeq('D');
				alert('The services have been added to MyConcierge successfully');
				location.reload();
			}
		});
		
		$container.find('#concierge_ctrl_reset').click(function() {
			if (confirm("Are you sure you want to remove the services from MyConcierge?")){
				$.cookie('bus_arrival_time', null, { expires: 365, path: '/' });
				removeCookiesSeqByInd('D');
				alert("This service has been removed from MyConcierge successfully");
				location.reload();
			}
		});
	});
})(jQuery);