/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var apigClientFactory = {};
apigClientFactory.newClient = function (config) {
    var apigClient = { };
    if(config === undefined) {
        config = {
            accessKey: '',
            secretKey: '',
            sessionToken: '',
            region: '',
            apiKey: undefined,
            defaultContentType: 'application/json',
            defaultAcceptType: 'application/json'
        };
    }
    if(config.accessKey === undefined) {
        config.accessKey = '';
    }
    if(config.secretKey === undefined) {
        config.secretKey = '';
    }
    if(config.apiKey === undefined) {
        config.apiKey = '';
    }
    if(config.sessionToken === undefined) {
        config.sessionToken = '';
    }
    if(config.region === undefined) {
        config.region = 'us-east-1';
    }
    //If defaultContentType is not defined then default to application/json
    if(config.defaultContentType === undefined) {
        config.defaultContentType = 'application/json';
    }
    //If defaultAcceptType is not defined then default to application/json
    if(config.defaultAcceptType === undefined) {
        config.defaultAcceptType = 'application/json';
    }

    
    // extract endpoint and path from url
    var invokeUrl = 'https://xk8l3tbax2.execute-api.us-east-1.amazonaws.com/dev';
    var endpoint = /(^https?:\/\/[^\/]+)/g.exec(invokeUrl)[1];
    var pathComponent = invokeUrl.substring(endpoint.length);

    var sigV4ClientConfig = {
        accessKey: config.accessKey,
        secretKey: config.secretKey,
        sessionToken: config.sessionToken,
        serviceName: 'execute-api',
        region: config.region,
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var authType = 'NONE';
    if (sigV4ClientConfig.accessKey !== undefined && sigV4ClientConfig.accessKey !== '' && sigV4ClientConfig.secretKey !== undefined && sigV4ClientConfig.secretKey !== '') {
        authType = 'AWS_IAM';
    }

    var simpleHttpClientConfig = {
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var apiGatewayClient = apiGateway.core.apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);
    
    
    
    apigClient.ebtesturlPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var ebtesturlPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/ebtesturl').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(ebtesturlPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.ebtesturlOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var ebtesturlOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/ebtesturl').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(ebtesturlOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.ec2postPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['Access-Control-Allow-Origin'], ['body']);
        
        var ec2postPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/ec2post').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, ['Access-Control-Allow-Origin']),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(ec2postPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.ec2postOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var ec2postOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/ec2post').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(ec2postOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.eventDrivenRoutingPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods'], ['body']);
        
        var eventDrivenRoutingPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/eventDrivenRouting').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods']),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(eventDrivenRoutingPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.eventDrivenRoutingOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var eventDrivenRoutingOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/eventDrivenRouting').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(eventDrivenRoutingOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.inputCognitoidInitialPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'body'], ['body']);
        
        var inputCognitoidInitialPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/input-cognitoid-initial').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, ['Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', ]),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(inputCognitoidInitialPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.inputCognitoidInitialOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods'], ['body']);
        
        var inputCognitoidInitialOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/input-cognitoid-initial').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, ['Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods']),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(inputCognitoidInitialOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.lambdaTestPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'body'], ['body']);
        
        var lambdaTestPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/lambda-test').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, ['Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', ]),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(lambdaTestPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.lambdaTestOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var lambdaTestOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/lambda-test').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(lambdaTestOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.routegenPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['Access-Control-Allow-Origins', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods'], ['body']);
        
        var routegenPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/routegen').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, ['Access-Control-Allow-Origins', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods']),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(routegenPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.routegenOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods'], ['body']);
        
        var routegenOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/routegen').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, ['Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods']),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(routegenOptionsRequest, authType, additionalParams, config.apiKey);
    };
    

    return apigClient;
};
