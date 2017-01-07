(function () {
    'use strict';

    angular.module('clientApp')
        .factory('TokenService', ['$window',
            function ($window) {

                // ---------------------------------------------------------------------------
                // PUBLIC API.
                // ---------------------------------------------------------------------------
                return ({
                    setToken: setToken,
                    getToken: getToken,
                    removeToken: removeToken
                });

                // ---------------------------------------------------------------------------
                // PUBLIC METHODS.
                // ---------------------------------------------------------------------------
                function setToken(token) {
                    $window.sessionStorage.token = token;
                }

                function getToken() {
                    return $window.sessionStorage.token;
                }

                function removeToken() {
                    delete $window.sessionStorage.token;
                }
                // ---------------------------------------------------------------------------
                // PRIVATE METHODS.
                // ---------------------------------------------------------------------------
            }
        ]);
})();