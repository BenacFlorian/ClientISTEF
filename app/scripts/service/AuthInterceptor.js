(function () {
    'use strict';

    angular.module('clientApp')
        .factory('AuthInterceptor', ['$q', 'TokenService', '$location', function ($q, TokenService, $location) {

            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    if (TokenService.getToken()) {
                        config.headers['X-Access-Token'] = TokenService.getToken();
                    }
                    return config;
                },
                response: function (response) {
                    if (response.status === 401) {
                        $location.path('/login');
                    }
                    return response || $q.when(response);
                },

                responseError: function (rejection) {
                    if (rejection.status === 401) {
                        $location.path('/login');
                    }
                    return $q.reject(rejection);
                }
            };
        }])
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptor');
    }]);

}());