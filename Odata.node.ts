import {IExecuteFunctions} from 'n8n-core';
import {
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    // NodeApiError,
    // NodeOperationError,
} from 'n8n-workflow';

import {odataService} from '@sap_oss/odata-library';
import {OptionsWithUri} from 'request';

export class Odata implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Odata Node',
        name: 'Odata',
        group: ['transform'],
        version: 1,
        description: 'Fetch a specific reource from a Odata API',
        defaults: {
            name: 'Odata Node',
            color: '#772244',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'httpBasicAuth',
                required: true,
                displayOptions: {
                    show: {
                        authentication: [
                            'basicAuth',
                        ],
                    },
                },
            },
            {
                name: 'httpHeaderAuth',
                required: true,
                displayOptions: {
                    show: {
                        authentication: [
                            'headerAuth',
                        ],
                    },
                },
            },
            {
                name: 'oAuth2Api',
                required: false,
                displayOptions: {
                    show: {
                        authentication: [
                            'oAuth2',
                        ],
                    },
                },
            },
        ],
        properties: [
            {
                displayName: 'Authentication',
                name: 'authentication',
                type: 'options',
                options: [
                    {
                        name: 'Basic Auth',
                        value: 'basicAuth',
                    },
                    {
                        name: 'Header Auth',
                        value: 'headerAuth',
                    },
                    {
                        name: 'OAuth2',
                        value: 'oAuth2',
                    },
                    {
                        name: 'None',
                        value: 'none',
                    },
                ],
                default: 'none',
                description: 'The way to authenticate.',
            },
            {
                displayName: 'HTTP Method',
                name: 'requestMethod',
                type: 'options',
                options: [
                    {
                        name: 'DELETE',
                        value: 'DELETE',
                    },
                    {
                        name: 'GET',
                        value: 'GET',
                    },
                    {
                        name: 'PATCH',
                        value: 'PATCH',
                    },
                    {
                        name: 'POST',
                        value: 'POST',
                    },
                ],
                default: 'GET',
                description: 'The HTTP method to execute.',
            },
            // Node properties which the user gets displayed and
            // can change on the node.
            {
                displayName: 'odata base url',
                name: 'baseUrl',
                type: 'string',
                default: '',
                placeholder: 'https://username:password@localhost/path/to/service/',
                description: 'The base url of the Odata service (eg. https://services.odata.org/TripPinRESTierService)',
                required: true,
            },
            {
                displayName: 'requestType',
                name: 'requestType',
                type: 'options',
                options: [
                    {
                        name: 'query',
                        value: 'query',
                    },
                    {
                        name: 'get List of entities',
                        value: 'listEntitySet',
                    },
                    {
                        name: 'get Single Entity',
                        value: 'singleEntity',
                    },
                    {
                        name: 'get entity Property value',
                        value: 'singleEntityPropertyValue',
                    },
                    {
                        name: 'Invoke function or action',
                        value: 'invokeFunction',
                    },
                ],
                required: true,
                default: 'listEntitySet',
                description: 'How to fetch resources',
                displayOptions: {
                    show: {
                        requestMethod: [
                            'GET',
                        ],
                    },
                },
            },
            {
                displayName: 'requestType',
                name: 'requestType',
                type: 'options',
                options: [
                    {
                        name: 'Invoke function or action',
                        value: 'invokeFunction',
                    },
                    {
                        name: 'Create an entity',
                        value: 'createEntity',
                    },
                ],
                default: 'invokeFunction',
                description: '',
                displayOptions: {
                    show: {
                        requestMethod: [
                            'POST',
                        ],
                    },
                },
            },
            {
                displayName: 'requestType',
                name: 'requestType',
                type: 'options',
                options: [
                    {
                        name: 'Update an entity',
                        value: 'updateEntity',
                    },
                ],
                default: 'updateEntity',
                description: '',
                displayOptions: {
                    show: {
                        requestMethod: [
                            'PATCH',
                        ],
                    },
                },
            },
            {
                displayName: 'requestType',
                name: 'requestType',
                type: 'options',
                options: [
                    {
                        name: 'Delete an entity',
                        value: 'deleteEntity',
                    },
                ],
                default: 'deleteEntity',
                description: '',
                displayOptions: {
                    show: {
                        requestMethod: [
                            'DELETE',
                        ],
                    },
                },
            },
            {
                displayName: 'request Body',
                name: 'requestBody',
                type: 'string',
                default: '',
                placeholder: '{}',
                description: 'The body to send (eg. {name: "Frederik"})',
                displayOptions: {
                    show: {
                        requestType: [
                            'createEntity',
                            'updateEntity',
                        ],
                        requestMethod: [
                            'POST',
                            'PATCH',
                        ],
                    },
                },
            },
            {
                displayName: 'path',
                name: 'path',
                type: 'string',
                default: '',
                placeholder: 'path',
                description: 'The base url of the Odata service (eg. People)',
                displayOptions: {
                    show: {
                        requestType: [
                            'createEntity',
                            'deleteEntity',
                            'updateEntity',
                            'query',
                            'listEntitySet',
                            'singleEntity',
                            'singleEntityPropertyValue',
                        ],
                    },
                },
            },
            {
                displayName: 'Odata Object Id',
                name: 'OdataObjectId',
                type: 'string',
                default: '',
                placeholder: 'id',
                description: 'The id of a specific object (eg. "russellwhyte" )',
                displayOptions: {
                    show: {
                        requestType: [
                            'deleteEntity',
                            'updateEntity',
                            'singleEntity',
                            'singleEntityPropertyValue',
                        ],
                        requestMethod: [
                            'GET',
                            'DELETE',
                            'PATCH',
                        ],
                    },
                },
            },
            {
                displayName: 'Odata property name',
                name: 'OdataObjectPropertyName',
                type: 'string',
                default: '',
                placeholder: 'propertyname',
                description: 'The id of a specific property (eg. "Name" )',
                displayOptions: {
                    show: {
                        requestType: [
                            'singleEntityPropertyValue',
                        ],
                        requestMethod: [
                            'GET',
                        ],
                    },
                },
            },
            {
                displayName: 'extra query params',
                name: 'OdataObjectqueryparams',
                type: 'string',
                default: '',
                placeholder: 'queryparams',
                description: 'Extra queryparams to add (eg. "$filter=FirstName eq \'Scott\'" )',
                required: false,
                displayOptions: {
                    show: {
                        requestMethod: [
                            'GET',
                        ],
                        requestType: [
                            'query',
                            'listEntitySet',
                            'singleEntity',
                            'singleEntityPropertyValue',
                        ],
                    },
                },
            },
            {
                displayName: 'Odata function name',
                name: 'OdataFunctionName',
                type: 'string',
                default: '',
                placeholder: 'function name',
                description: 'The odata function name (eg. "GetNearestAirport" )',
                displayOptions: {
                    show: {
                        requestType: [
                            'invokeFunction',
                        ],
                        requestMethod: [
                            'GET',
                            'POST',
                        ],
                    },
                },
            },
            {
                displayName: 'Odata function params',
                name: 'OdataFunctionParams',
                type: 'string',
                default: '',
                placeholder: 'function params',
                description: 'The odata function params (eg. "lat = 33, lon = -118" )',
                displayOptions: {
                    show: {
                        requestType: [
                            'invokeFunction',
                        ],
                        requestMethod: [
                            'GET',
                        ],
                    },
                },
            },
        ]
    };


    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

        const items = this.getInputData();

        let item: INodeExecutionData;
        const requestMethod = this.getNodeParameter('requestMethod', 0) as string;
        const requestType = this.getNodeParameter('requestType', 0) as string;
        const baseUrl = this.getNodeParameter('baseUrl', 0) as string;


        const httpBasicAuth = this.getCredentials('httpBasicAuth');
        const httpHeaderAuth = this.getCredentials('httpHeaderAuth');
        const oAuth2Api = this.getCredentials('oAuth2Api');

        let requestOptions: OptionsWithUri;
        let path;
        if (requestType == 'listEntitySet' || requestType == 'createEntity') {
            path = this.getNodeParameter('path', 0) as string;
            path = path;
        } else if (requestType == 'singleEntity' || requestType == 'deleteEntity' || requestType == 'updateEntity') {
            path = this.getNodeParameter('path', 0) as string;
            const OdataObjectId = this.getNodeParameter('OdataObjectId', 0) as string;
            if (OdataObjectId != '') {
                path = path + "('" + OdataObjectId + "')";
            }
        } else if (requestType == 'singleEntityPropertyValue') {
            path = this.getNodeParameter('path', 0) as string;
            const OdataObjectId = this.getNodeParameter('OdataObjectId', 0) as string;
            const OdataObjectPropertyName = this.getNodeParameter('OdataObjectPropertyName', 0) as string;
            if (OdataObjectId != '' && OdataObjectPropertyName != '') {
                path = path + "('" + OdataObjectId + "')/" + OdataObjectPropertyName;
            }
        } else if (requestType == 'invokeFunction') {
            const OdataFunctionName = this.getNodeParameter('OdataFunctionName', 0) as string;
            if (requestMethod == 'GET') {
                const OdataFunctionParams = this.getNodeParameter('OdataFunctionParams', 0) as string;
                if (OdataFunctionParams != '') {
                    path = OdataFunctionName + "(" + OdataFunctionParams + ")";
                } else {
                    path = OdataFunctionName;
                }
            } else {
                path = OdataFunctionName;
            }
        }
        console.log(baseUrl + '/' + path);
        let headers = {};
        if (requestMethod == 'PATCH' || requestMethod == 'POST') {
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }

        requestOptions = {
            headers: headers,
            method: requestMethod,
            uri: baseUrl + '/' + path,
            gzip: true,
            //rejectUnauthorized: !this.getNodeParameter('allowUnauthorizedCerts', itemIndex, false) as boolean,
        };
        if (requestMethod == 'POST') {
            requestOptions.formData = requestOptions.body;
        }

        // Add credentials if any are set
        if (httpBasicAuth !== undefined) {
            requestOptions.auth = {
                user: httpBasicAuth.user as string,
                pass: httpBasicAuth.password as string,
            };
        }
        if (httpHeaderAuth !== undefined) {
            requestOptions.headers![httpHeaderAuth.name as string] = httpHeaderAuth.value;
        }


        const requestPromises = [];
        // Now that the options are all set make the actual http request
        if (oAuth2Api !== undefined) {
            requestPromises.push(this.helpers.requestOAuth2.call(this, 'oAuth2Api', requestOptions, {tokenType: 'Bearer'}));
        } else {
            requestPromises.push(this.helpers.request(requestOptions));
        }

        // @ts-ignore
        const promisesResponses = await Promise.allSettled(requestPromises);
        const returnItems: INodeExecutionData[] = [];
        let response: any; // tslint:disable-line:no-any

        // @ts-ignore
        response = promisesResponses.shift();

        let returnItem;
        if (response!.status !== 'fulfilled') {
            console.log(response!.status);
            if (this.continueOnFail() !== true) {
                // throw error;
                //throw new NodeApiError(this.getNode(), response);
                console.log('Response FAILED');
                console.log(response);
            } else {
                // Return the actual reason as error
                returnItems.push(
                    {
                        json: {
                            error: response.reason,
                        },
                    },
                );
            }
        } else {

            try {
                returnItem = JSON.parse(response.value);
                console.log('JSON:');
                console.log(returnItem);
                returnItems.push({json: returnItem});
            } catch (error) {
                console.log('Response body is not valid JSON');
                //throw new NodeOperationError(this.getNode(), 'Response body is not valid JSON. Change "Response Format" to "String"');
            }
        }

        return this.prepareOutputData(returnItems);

    }
}
