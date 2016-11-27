(function() {
  "use strict";
  
  	angular
	  	.module("skyApp.flights")
	  	.factory("FlightsService", FlightsService);
  		
FlightsService.$inject = ["AWSService","UserService"];
function FlightsService(AWSService, UserService) {
	var service = {       
	    USERS_TABLE: 'users-skycision',
	    OPS_TABLE: 'ops-skycision',
	    ORGS_TABLE: 'orgs-skycision',
	    BLOCKS_TABLE: 'blocks-skycision',
	    INDEX_TABLE: 'id-singleton',
	    FARM_BUCKET: "skycisionfarmbucket",
	    DATA_BUCKET: "skycisiondatabucket",
	    FLIGHTS_TABLE:"flights-skycision",
	    loadFlights: loadFlights
	}

    return service;
	
	function loadFlights(){
		
		return UserService.getOrg()
		.then( ({orgId : orgId}) => {
		    console.log(orgId);
			return AWSService.dynamo()
			.then( dynamo => {
		       // Find Org's flights
		        var requestItems = {
		            ReturnConsumedCapacity: 'TOTAL',
		            TableName: service.FLIGHTS_TABLE,
		            IndexName: "org-index",
		            KeyConditionExpression: "org = :orgVal",
		            ExpressionAttributeValues: {
		                ":orgVal": orgId
		            }
		        }
		       	return dynamo.do('query',requestItems)
			})
			.then( f => {
			    return AWSService.s3()
			    .then( s3 => { 
			        return f.Items.map( item => {
			            var prefix = item.prefix
	                    var suffixes = ['png','pdf','preview','shp','tif'];
	                    suffixes.map( suf => {
	                       item[suf+'Url'] = s3.getSignedUrl('getObject',{
	                           Key: prefix + item[suf],
	                           Bucket: service.DATA_BUCKET
	                       })
	                    })

	                    return item
			        })
			       
			    })
			})
		})
		.catch(console.log);
		
    }
	
}

})();
