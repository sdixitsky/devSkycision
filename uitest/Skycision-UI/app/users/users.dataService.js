(function() {
    angular
        .module('skyApp.users')
        .factory('UserService', [
            '$q',
            '$http',
            '$state',
            '$cacheFactory',
            'AWSService',
            UserService
        ]);

    function UserService($q, $http, $state, $cacheFactory, AWSService) {

        var userDefer = $q.defer();
        var userPromise = userDefer.promise;

        var orgsDefer = $q.defer();
        var orgsPromise = orgsDefer.promise;

        var orgsCache = $cacheFactory('orgs');

        var service = {
            _user: null,
            UsersTable: 'users-skycision',
            OpsTable: 'ops-skycision',
            OrgsTable: 'orgs-skycision',
            BlocksTable: 'BlocksTable',
            BLOCKS_TABLE: 'blocks-skycision',
            INDEX_TABLE: 'id-singleton',
            Bucket: "skycisionfarmbucket",
            DatasetName: "profile",
            ProfileEntries: ["firstName", "lastName", "email", "homeCoord", "farmId", "clients"],
            signOut: signOut,
            setUser: setUser,
            getUser: getUser,
            getOrg: getOrg,
            getRoute: getRoute,
            generateFields: generateFields,
            commitData: commitData,
            commitWithKey: commitWithKey,
            createOperation: createOperation,
            configRequestParams: configRequestParams,
            updateOrgId: updateOrgId
        };

        return service;

        function signOut() {
            service._user.signOut()
            service._user = null;
        }

        function setUser(user) {
            return $q((resolve, reject) => {
                if (!!user) {
                    user.getSession((err, session) => {
                        if (session.isValid()) {
                            AWSService.setCognitoToken(session.getIdToken().getJwtToken());
                            AWSService.ama();
                            console.log("Successfully Authenticated.");
                            service._user = user;
                            user.getUserAttributes((err, attributes) => {
                                if (err) {
                                    console.log(err);
                                    reject(err);
                                }
                                // parse  [{Name: $name , Value: $value}]
                                // into   {$names:$values}
                                var parsedAttrs = unpackObject(attributes);
                                parsedAttrs.identityId = AWS.config.credentials.params.IdentityId;
                                userDefer.resolve(parsedAttrs);
                            });
                            resolve(user)
                        } else {
                            reject('Not authenticated');
                            userDefer.reject('Not authenticated.');
                        }

                    });
                } else {
                    reject('No user.');
                }
            });
        }

        function getUser() {
            return userPromise;
        }

        function updateOrgId(neworgid) {
            service.getUser()
                .then(user => {
                    AWSService.dynamo().then(dynamo => {
                        // Find the User by email
                        dynamo.do('get', {
                            TableName: service.UsersTable,
                            Key: {
                                'user-email': user.email
                            }
                        })
                            .then(data => $q((resolve, reject) => {

                                dynamo.do('put', {
                                    TableName: service.UsersTable,
                                    Item: {
                                        'user-email': user.email,
                                        'address': user.address,
                                        'user-id': user.identityId,
                                        'orgs': [neworgid]
                                    }
                                })

                                .then(data => {
                                    //resolve(data.Item);
                                    console.log("data.Item: ", data.Item);
                                }, err => {
                                    //logMessage('dynamoDB error')(new Error(err));
                                    //reject(err);
                                    console.log("-reject-");
                                });
                            }));

                    });
                });
        }

        function getOrg() {
            service.getUser()
                .then(user => {

                    var org = orgsCache.get(JSON.stringify(user));
                    if (!!org) {
                        return orgsDefer.resolve(org);
                    }

                    AWSService.dynamo().then(dynamo => {
                        // Find the User by email
                        dynamo.do('get', {
                            TableName: service.UsersTable,
                            Key: {
                                'user-email': user.email
                            }
                        })
                            .then(data => $q((resolve, reject) => {
                                if (Object.keys(data).length === 0) {
                                    // User didn't previously exist
                                    // so create an entry
                                    dynamo.do('put', {
                                        TableName: service.UsersTable,
                                        Item: {
                                            'user-email': user.email,
                                            'address': user.address,
                                            'user-id': user.identityId
                                        }
                                    })
                                        .then(data => {
                                            resolve(data.Item);
                                        }, err => {
                                            logMessage('dynamoDB error')(new Error(err));
                                            reject(err);
                                        });
                                } else {
                                    resolve(data.Item);
                                }
                            }))

                        .then(userInfo => {
                            // Find the User's Orgs
                            var orgs = userInfo.orgs.values;
                            var requestItems = {};
                            requestItems[service.OrgsTable] = {
                            Keys: orgs.map(org => ({
                                'org-id': org
                            }))
                            };

                            dynamo.do('bget', {
                                RequestItems: requestItems,
                                ReturnConsumedCapacity: 'TOTAL'
                            })
                                .then(orgsData => {

                                    var out = orgsData.Responses[service.OrgsTable].map(org => {
                                        var a = {};
                                        angular.forEach(org, (val, key) => {
                                            //console.log(typeof val);
                                            a[camelCase(key)] = !!val.values && typeof val.values === "function" ? Array.from(val.values()) : val;
                                        });
                                        return a;
                                    });
                                    orgsCache.put(JSON.stringify(user), out[0]);
                                    orgsDefer.resolve(out[0]);
                                })
                                .catch(err => orgsDefer.reject(err));
                        });
                    });
                });
            return orgsPromise;
        }


        function getRoute(farm) {
            function shuffleArray(array) {
                for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
                return array;
            }

            var coords = farm.fields[0].baseMesh;
            var converted = converted.map(f => ({
                x: c.lng,
                y: c.lat
            }));

            var shuffled = shuffleArray(converted);
            AWSService.lambda().then(function(lambda) {
                var d = $q.defer();
                lambda.invoke({
                    Payload: {
                        farmId: farm.farmId
                    },
                    FunctionName: 'arn:aws:lambda:us-east-1:717391330650:function:ec2post:BETA',
                    InvocationType: 'RequestResponse'
                }, function(err, response) {
                    if (err)
                        d.reject(err);
                    else
                        d.resolve(response);
                });
                return d.promise;
            })
                .then(function(response) {
                    console.log(response);
                }, function(fail) {
                    console.log(fail);
                });
        }

        function generateFields(farm) {
            var d = $q.defer();
            //////
            //////
            console.log(farm);
            // AWSService.lambda().then(function(lambda){
            //  lambda.invoke({
            //      Payload:JSON.stringify(farm),
            //      FunctionName:
            //             'arn:aws:lambda:us-east-1:717391330650:function:ec2post:' + LAMBDA_POST_VER,
            //      InvocationType:'RequestResponse'
            //  },function(err,response) {
            //      if(err) {
            //          d.reject(err);
            //      } else {
            //          console.log(angular.toJson(angular.fromJson(response)));
            //          d.resolve(angular.fromJson(response.Payload));
            //      }
            //  });
            // });
            console.log(farm);
            $http.post(
                '/addField',
                angular.toJson(farm),
                'POST'
            ).then(function(success) {
                // console.log(angular.toJson(angular.fromJson(success)));
                var data = angular.fromJson(success).data;

                d.resolve(data);
            });
            return d.promise;
        }

        function commitData(farm) {
            service.commitWithKey(farm, farm.farmId + '/farm.json');
        }

        function commitWithKey(farm, key) {
            console.log(farm);
            AWSService.s3().then(function(s3) {
                s3.putObject({
                    Key: key,
                    Bucket: service.Bucket,
                    Body: angular.toJson(farm),
                    ACL: 'bucket-owner-full-control',
                    CacheControl: 'no-store'
                })
                    .then(console.log, console.log);
            });
        }

        function createOperation() {


        }

        function configRequestParams(params, table, isArray) {
            return (isArray) ? configBatchWriteParams(...arguments) : configPutParams(...arguments);
        }

        function configBatchWriteParams(item, tableName) {
            var params = {};
            params[tableName] = {
                PutRequest: {
                    Item: item
                }
            };
            return params;
        }

        function configPutParams(item, tableName) {
            var params = {};
            params = {
                TableName: tableName,
                Item: item,
            };
            return params;
        }

        // Convenience function for rejecting top level promise in .catch() method of a long promise chains
        function defaultReject(terminalPromise, rejectVal) {
            return function() {
                terminalPromise.reject(rejectVal);
            };
        }

        function unpackObject(obj) {
            return obj.reduce(
                function(previousValue, currentValue, currentIndex, array) {
                    previousValue[camelCase(currentValue.Name)] = currentValue.Value;
                    return previousValue;
                }, {}) || {};
        }


        // Recursively traverse arbitrary JSON to do cleanup
        //   - Replaces falsey values with dashes
        //   - Trims Number types to 6 or fewer decimal places
        function traverse(o) {
            switch (typeof(o)) {
                case 'number':
                    return Number(o.toFixed(6));
                    break;
                case 'object':
                    if (!o) {
                        return '-'
                    }
                    for (var i in o) {
                        o[i] = traverse(o[i]);
                    }
                    break;
            }
            return o;
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



    }
})();