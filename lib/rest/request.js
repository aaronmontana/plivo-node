import request from 'request';
import queryString from 'querystring';
import * as Exceptions from '../utils/exceptions';
import * as _ from "lodash";

export function Request(config) {
  let auth = 'Basic ' + Buffer.from(config.authId + ':' + config.authToken)
    .toString('base64');

  let headers = {
    Authorization: auth,
    'User-Agent': config.userAgent,
    'Content-Type': 'application/json'
  };

  return (method, action, params) => {
    if (typeof (params) != 'undefined' && typeof (params.file) != 'undefined') {
      var files = []
      if (Array.isArray(params.file)) {
        for (let index = 0; index < params.file.length; index++) {
          files[index] = require('fs').createReadStream(params.file[index])
        }
      } else {
        files[0] = require('fs').createReadStream(params.file);
      }
      params.file = files;
    }
    var options = {
      url: config.url + '/' + action,
      method: method,
      formData: params || '',
      headers: headers,
      json: true
    };
    let apiVoiceUris = ['https://voice.plivo.com/v1/Account/','https://voice-usw1.plivo.com/v1/Account/','https://voice-use1.plivo.com/v1/Account/'];
    let isVoiceReq = false;
    if (params) {
      if (params.hasOwnProperty('is_call_insights_request')) {
        options.url = params.call_insights_base_url + params.call_insights_request_path;
        delete params.is_call_insights_request;
        delete params.call_insights_base_url;
        delete params.call_insights_request_path;
        delete options.formData;
        options.json = params;
      }
      else if (params.hasOwnProperty('is_voice_request')){
        options.url = apiVoiceUris[0] + config.authId + '/' + action;
        delete params.is_voice_request;
        isVoiceReq = true;
      }
    }

    if (method === 'GET' && options.formData !== '') {
      let query = '?' + queryString.stringify(params);
      options.url += query;
    }

    if (typeof config.proxy !== 'undefined') {
      options.proxy = config.proxy;
    }

    if (typeof config.timeout !== 'undefined') {
      options.timeout = config.timeout;
    }

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          reject(error);
          return;
        }

        if(isVoiceReq === true){
          if (response.statusCode >= 500){
            options.url = apiVoiceUris[1] + config.authId + '/' + action;
            if (method === 'GET' && options.formData !== '') {
              let query = '?' + queryString.stringify(params);
              options.url += query;
            }
            request(options,(error, response) => {
              if(error){
                reject(error);
                return;
              }
              if(response.statusCode>=500){
                options.url = apiVoiceUris[2] + config.authId + '/' + action;
                if (method === 'GET' && options.formData !== '') {
                  let query = '?' + queryString.stringify(params);
                  options.url += query;
                }
                request(options, (error, response) => {
                  if(error){
                    reject(error);
                    return;
                  }
                  const exceptionClass = {
                    400: Exceptions.InvalidRequestError,
                    401: Exceptions.AuthenticationError,
                    404: Exceptions.ResourceNotFoundError,
                    405: Exceptions.InvalidRequestError,
                    500: Exceptions.ServerError,
                  } [response.statusCode] || Error;

                  if (!_.inRange(response.statusCode, 200, 300)) {
                    body = body || response.body;
                    if (typeof body === 'object') {
                      reject(new exceptionClass(JSON.stringify(body)));
                    } else {
                      reject(new exceptionClass(body));
                    }
                  }
                  // else {
                    let body = response.body;
                    let isObj = typeof _body === 'object' && _body !== null && !(_body instanceof Array) && !(_body instanceof Date)
                    if (isObj) {
                      _body['statusCode'] = response.statusCode;
                    }
                    resolve({
                      response: response,
                      body: body
                    });
                  // }
                })
              }
              else {
              const exceptionClass = {
                400: Exceptions.InvalidRequestError,
                401: Exceptions.AuthenticationError,
                404: Exceptions.ResourceNotFoundError,
                405: Exceptions.InvalidRequestError,
                500: Exceptions.ServerError,
              } [response.statusCode] || Error;

              if (!_.inRange(response.statusCode, 200, 300)) {
                body = body || response.body;
                if (typeof body === 'object') {
                  reject(new exceptionClass(JSON.stringify(body)));
                } else {
                  reject(new exceptionClass(body));
                }
              }
              // else {
                let body = response.body;
                let isObj = typeof _body === 'object' && _body !== null && !(_body instanceof Array) && !(_body instanceof Date)
                if (isObj) {
                  _body['statusCode'] = response.statusCode;
                }
                resolve({
                  response: response,
                  body: body
                });
              }
            })
          }
          else {
          const exceptionClass = {
            400: Exceptions.InvalidRequestError,
            401: Exceptions.AuthenticationError,
            404: Exceptions.ResourceNotFoundError,
            405: Exceptions.InvalidRequestError,
            500: Exceptions.ServerError,
          } [response.statusCode] || Error;

          if (!_.inRange(response.statusCode, 200, 300)) {
            body = body || response.body;
            if (typeof body === 'object') {
              reject(new exceptionClass(JSON.stringify(body)));
            } else {
              reject(new exceptionClass(body));
            }
          }
          // else {
            let body = response.body;
            let isObj = typeof _body === 'object' && _body !== null && !(_body instanceof Array) && !(_body instanceof Date)
            if (isObj) {
              _body['statusCode'] = response.statusCode;
            }
            resolve({
              response: response,
              body: body
            });
          }
        }

        else {
          const exceptionClass = {
            400: Exceptions.InvalidRequestError,
            401: Exceptions.AuthenticationError,
            404: Exceptions.ResourceNotFoundError,
            405: Exceptions.InvalidRequestError,
            500: Exceptions.ServerError,
          } [response.statusCode] || Error;

          if (!_.inRange(response.statusCode, 200, 300)) {
            body = body || response.body;
            if (typeof body === 'object') {
              reject(new exceptionClass(JSON.stringify(body)));
            } else {
              reject(new exceptionClass(body));
            }
          }
          else {
          let body = response.body;
          let isObj = typeof _body === 'object' && _body !== null && !(_body instanceof Array) && !(_body instanceof Date)
          if (isObj) {
            _body['statusCode'] = response.statusCode;
          }
          resolve({
            response: response,
            body: body
          });
        }
        }
      });
    });
  };
}
