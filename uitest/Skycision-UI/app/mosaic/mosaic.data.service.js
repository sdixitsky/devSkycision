(function() {
angular
    .module('skyApp.mosaic')
    .factory('MosaicDataService', [
        '$q',
        '$http',
        '$state',
        '$cacheFactory',
        'AWSService',
        MosaicDataService
    ]);

function MosaicDataService($q, $http, $state, $cacheFactory, AWSService) {
    console.log('mosaicdataservice init');
    var MDS = this;

    var orgDefer = $q.defer();
    MDS.orgId = orgDefer.promise;

    var opsCache = $cacheFactory('mds-ops');

    var service = {
        setOrg: setOrg,
        getOperations: getOperations,
        USERS_TABLE: 'users-skycision',
        OPS_TABLE: 'ops-skycision',
        ORGS_TABLE: 'orgs-skycision',
        BLOCKS_TABLE: 'blocks-skycision',
        INDEX_TABLE: 'id-singleton',
        FARM_BUCKET: "skycisionfarmbucket",
        createBlockFromGeoJSONFeatures: createBlockFromGeoJSONFeatures,
        
    }

    return service;

    function setOrg(orgId) {
        orgDefer.resolve(orgId);
    }
 
    function getOperations() {
        return MDS.orgId.then( id => getOperationsWithCache(id) );
    }
    function camelCase(name) {
		var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
		var MOZ_HACK_REGEXP = /^moz([A-Z])/;
		return name.
		replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
			return offset ? letter.toUpperCase() : letter;
	    }).
   		replace(MOZ_HACK_REGEXP, 'Moz$1');
    }

    function getOperationsWithCache(id) {
        var operations = opsCache.get(id);
        if (!!operations) {
            return $q.when(JSON.parse(operations));
        }

        console.log(id);

        var d = $q.defer();
        var _s3 = AWSService.s3();
        AWSService.dynamo()
        .then( dynamo => {	
            // Find the User's Org's Operations
            var requestItems = {
                ReturnConsumedCapacity: 'TOTAL',
                TableName: service.OPS_TABLE,
                KeyConditionExpression: "org = :orgVal",
                ExpressionAttributeValues: {
                    ":orgVal": id
                }
            }
            return dynamo.do('query',requestItems);
        })
        .then( opsData => opsData.Items)
        .then( opsItems => {
            console.log(opsItems);
//            opsItems.reduce( (prev,cur) => {
//              var out = cur.op;
//              angular.forEach(cur.data,(val,key) => {out[key] = val});                        
//              return prev.concat(out);
//          },[]);
            
            //d.resolve(opsItems);
            
            // Parse the User's Org's Operations into objects for mainController
            var ops = opsItems.map( op => _s3.then(s3 => 
                s3.getObject({
                    Key: op['op-id']+'/farm.json',
                    Bucket: service.FARM_BUCKET,
                    ResponseContentDisposition: 'application/json',
                    ResponseContentEncoding: 'utf-8'
                }).then( data => ({
                    op:op,
                    data:angular.fromJson( data.Body.toString() )
                }))
            ));

            $q.all(ops).then( opsResolved => {
                var parsed = opsResolved.map(obj => {
                    var out = {op:{}};
                    out.data = obj.data;
                    angular.forEach(obj.op, (val,key) => {
                        out.op[camelCase(key)] = val;
                    });
                    return out;
                }).reduce( (prev,cur) => {
                    var out = cur.op;
                    angular.forEach(cur.data,(val,key) => {out[key] = val});                        
                    return prev.concat(out);
                },[]);
                opsCache.put(id, JSON.stringify(parsed))
                d.resolve(parsed);
            })
            .catch( err => console.log(err));
        });
        
        return d.promise;
    }
    
    function createBlockFromGeoJSONFeatures(block) {
    	getIndex('block')
    	.then( id => {
	    	block['block-id'] = id[0];
	    	console.log(id);
	    	var params = {
				TableName: service.BLOCKS_TABLE,
				Item: block,
	    	};
	    
	        return AWSService.dynamo()
	        .then( dynamo => dynamo.do( "put", params ) )
    	})
        .then( d => d.Item )
        .then( console.log )
        .catch(console.log);
        
    }
    
    function getIndex(type, amountToIncrement) {
    	
        amountToIncrement = amountToIncrement || 1;
        console.log(amountToIncrement);
        return $q( (resolve, reject) => {
            AWSService.dynamo()
            .then( dynamo => {
                // get the operation index from the id-singleton table
                dynamo.do('update', {
                    TableName: service.INDEX_TABLE,
                    Key: {
                        'id-type': type
                    },
                    UpdateExpression: "set idcount = idcount + :val",
                    ExpressionAttributeValues:{
                        ":val": amountToIncrement
                    },
                    ReturnValues:"UPDATED_NEW"
                })
                .then( response => {
                	console.log(response);
                    const newIndex = response.Attributes.idcount;
                    const inds = [];

                    let i;
                    for (i = 0; i < amountToIncrement; i++ ) {
                        inds.push(newIndex - i);
                    }

                    const newIds = inds.map( d => {
                        return ('000000' + d.toString('36')).slice(-6);
                    });

                    resolve(newIds);
                });
            })
            .catch(reject);
        });
    }

}

})();