$.ajax({
        url: "static/json/ranches/weather.json"
    }).done(function(response){
        console.log(response);
        renderGraph(response);
    });

    function renderGraph(response) {
    	var data = response.forecast[0].daily.data,
    	margin = {top: 20, right: 20, bottom: 70, left: 40},
    	width = 900 - margin.left - margin.right,
    	height = 300 - margin.top - margin.bottom;
    	data = data.slice(0,data.length-1);

    	var x = d3.scale.ordinal()
    			.rangeRoundBands([0, width]);

    	var y = d3.scale.linear()
    			.range([height, 10]);


    	var xAxis = d3.svg.axis()
    				.scale(x)
    				.orient("bottom");

    	var yAxis = d3.svg.axis()
    				.scale(y)
    				.orient("left");

    	var line1 = d3.svg.line()
    	    .x(function(d) { return x(d.week); })
    	    .y(function(d) { return y(d.apparentTemperatureMax); });
	       	
    	var line2 = d3.svg.line()
		    .x(function(d) { return x(d.week); })
		    .y(function(d) { return y(d.dewPoint); });
    
    	var line3 = d3.svg.line()
		    .x(function(d) { return x(d.week); })
		    .y(function(d) { return y(d.windSpeed); });
    	
    	var line4 = d3.svg.line()
		    .x(function(d) { return x(d.week); })
		    .y(function(d) { return y(d.humidity); });
    	
    	var line5 = d3.svg.line()
		    .x(function(d) { return x(d.week); })
		    .y(function(d) { return y(d.apparentTemperatureMin); });
    	
    	var lineA1 = d3.svg.line()
		    .x(function(d) { return x(d.week); })
		    .y(function(d) { return y(d.cloudCover); });
    	
    	var lineA2 = d3.svg.line()
		    .x(function(d) { return x(d.week); })
		    .y(function(d) { return y(d.precipProbability); });
    	
    	var svg = d3.select(".graph1").append("svg")
    	    .attr("width", width + margin.left + margin.right)
    	    .attr("height", height + margin.top + margin.bottom)
    	    .append("g")
    	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    	
    	var svg1 = d3.select(".graph2").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		    .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    	  x.domain(data.map(function (d) {
    	    return d.week;
    	  }));

    		y.domain([0, d3.max(data, function(d) {
    			return Math.max(d.apparentTemperatureMax, d.dewPoint, d.windSpeed,
    					d.humidity, d.apparentTemperatureMin,d.cloudCover,d.precipProbability); 
    		})]);

    	  svg.append("g")
    	      .attr("class", "x axis")
    	      .attr("transform", "translate(0," + height + ")")
    	      .call(xAxis);
    	  svg1.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);
    	     	 
    	  svg.append("g")
    	      .attr("class", "y axis")
    	      .call(yAxis);
    	  svg1.append("g")
	      .attr("class", "y axis")
	      .call(yAxis);

    	  svg.append("path")		
  			  .attr("class", "line1")
  			  .attr("d", line1(data));
    	  
    	  svg1.append("path")		
			  .attr("class", "line4")
			  .attr("d", lineA1(data));
    	  
    	  svg1.append("path")		
			  .attr("class", "line3")
			  .attr("d", lineA2(data));

    	  svg.append("path")		
  			  .attr("class", "line2")
  			  .attr("d", line2(data));
    	  
    	  svg.append("path")		
			  .attr("class", "line3")
			  .attr("d", line3(data));
    	  
    	  svg.append("path")		
			  .attr("class", "line4")
			  .attr("d", line4(data));
    	  
    	  svg.append("path")		
			  .attr("class", "line5")
			  .attr("d", line5(data));
    	  
    	  svg.append("text")
	  		  .attr("transform", "translate(" + (width+3) + "," + y(data[0].apparentTemperatureMax) + ")")
	  		  .attr("dy", ".35em")
	  		  .attr("text-anchor", "start")
	  		  .style("fill", "steelblue")
	  		  .text("Max-temp");

    	  svg1.append("text")
	  		  .attr("transform", "translate(" + (width+3) + "," + y(data[0].cloudCover) + ")")
	  		  .attr("dy", ".35em")
	  		  .attr("text-anchor", "start")
	  		  .style("fill", "red")
	  		  .text("Cloud cover");
    	  svg1.append("text")
	  		  .attr("transform", "translate(" + (width+3) + "," + y(data[0].precipProbability) + ")")
	  		  .attr("dy", "-1em")
	  		  .attr("text-anchor", "start")
	  		  .style("fill", "green")
	  		  .text("Precip probability");


    	  svg.append("text")
  			  .attr("transform", "translate(" + (width+3) + "," + y(data[0].dewPoint) + ")")
  			  .attr("dy", ".35em")
  			  .attr("text-anchor", "start")
  			  .style("fill", "red")
  			  .text("Dew point");
    	  
    	  svg.append("text")
			  .attr("transform", "translate(" + (width+3) + "," + y(data[0].windSpeed) + ")")
			  .attr("dy", ".35em")
			  .attr("text-anchor", "start")
			  .style("fill", "#794044")
			  .text("Wind speed");
    	  
    	  svg.append("text")
			  .attr("transform", "translate(" + (width+3) + "," + y(data[0].humidity) + ")")
			  .attr("dy", ".35em")
			  .attr("text-anchor", "start")
			  .style("fill", "#722e00")
			  .text("Humdity");
    	  
    	  svg.append("text")
			  .attr("transform", "translate(" + (width+3) + "," + y(data[0].apparentTemperatureMin) + ")")
			  .attr("dy", ".35em")
			  .attr("text-anchor", "start")
			  .style("fill", "#000")
			  .text("Min-temp");

    	}
    	function type(d) {
    	  return d.week;
    	  return d.dewPoint;
    	  return d.windSpeed;
    	  return d.windBearing;
    	  return d.apparentTemperatureMin;
    	  return d.cloudCover;
    	  return d.windBearing;
    	  return d.precipProbability;
    	}

	function renderWeatherWidget(latitude, longitude, cityName) {
        var iframeSrc = "http://forecast.io/embed/#lat=" +latitude + "&lon=" + longitude + "&name=" + cityName;// + ""&name=Downtown Boston"
        var elm = '<iframe id="forecast_embed" type="text/html" frameborder="0" height="245" width="100%" src="'
          elm += iframeSrc + '"</iframe>';
          $("#iframePlaceHolder").html(elm);
	}
	
	/ * Weather forcast */
	function showPosition(position) {
	    var latitude = position.coords.latitude;
	    var longitude = position.coords.longitude; 
	    var getCityUrl = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude +"," + longitude;
	
	    $("#iframePlaceHolder").html("Weather widget is Loading...");
	    
	  $.ajax({
	      url: getCityUrl
	  }).done(function(response){
	      $.each(response.results[0].address_components, function(indx, valobj){
	          if (valobj.types && valobj.types.indexOf("administrative_area_level_2") != -1) {
	        	  	renderWeatherWidget(latitude, longitude, valobj.long_name || "");
	              return false;
	          }
	      });
	
	  });
	   
	}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        alert("Geo location is not supported by your browser!")
    }
}
getLocation();