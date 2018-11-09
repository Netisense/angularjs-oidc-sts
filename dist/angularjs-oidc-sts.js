// Copyright 2016-2018 Netisense
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

angular.module('angularjs-oidc-sts', []).
service('aws', ['$window', '$q', 'openid', 'config', function($window, $q, openid, config) {
  var region = config.region;
  var logger = config.logger;
  var roleArn = config.roleArn;
  return $q(function(resolve, reject) {
    openid.then( function(id_token) {
      AWS.config.logger = logger;
      AWS.config.region = region;
      AWS.config.credentials = new AWS.WebIdentityCredentials({
        RoleArn: roleArn,
        WebIdentityToken: id_token
      });
      var promise = AWS.config.credentials.getPromise();
      promise.then(function() { 
        console.log("Obtained AWS credentials for AWS SDK.");
        var creds = {
          accessKey: AWS.config.credentials.accessKeyId,
          secretKey: AWS.config.credentials.secretAccessKey,
          sessionToken: AWS.config.credentials.sessionToken,
        };
        resolve(creds);
      }, function(err) { 
        console.log('AWS SDK Returned Error' + err.message);
        reject(err.code);
      });
    });
  });
}]).
service('openid', ['$window', '$q', 'config', function($window, $q, config) {
  var login = config.loginRoute;
  return $q(function(resolve, reject){
    var id = $window.localStorage.getItem('id_token');
    var ex = $window.localStorage.getItem('id_token_exp');
    if ( ( typeof id != 'undefined' & id != null ) 
      & ( typeof ex != 'undefined' & ex != null ) 
      & ( new Date(ex*1000-(1*60*1000)) > new Date() ) // token must be valid for at least another 1 min
    ) {
      console.log("Using OpenId token in storage.");
      console.log("Token valid until " + new Date(ex*1000));
      resolve(id);
    } else {
      console.log("No OpenId token in storage.");
      // redirect to login
      $window.location.href = login;
      console.log("Not logged in.");
      reject();
    };
  });
}]);
