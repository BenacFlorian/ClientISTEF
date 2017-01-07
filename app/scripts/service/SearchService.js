(function () {
    'use strict';

    angular.module('clientApp')
        .factory('SearchService', ['$http', '$window',
            function ($http, $window) {

                var searchValue;

                // ---------------------------------------------------------------------------
                // PUBLIC API.
                // ---------------------------------------------------------------------------
                return ({
                    setSearchValue: setSearchValue,
                    getSearchValue: getSearchValue,
                    initSearchValue: initSearchValue
                });


                // ---------------------------------------------------------------------------
                // PUBLIC METHODS.
                // ---------------------------------------------------------------------------
                function setSearchValue(data) {
                    searchValue = data;
                }

                function getSearchValue() {
                    return searchValue;
                }

                function initSearchValue() {
                    searchValue = "";
                }
                // ---------------------------------------------------------------------------
                // PRIVATE METHODS.
                // ---------------------------------------------------------------------------

            }
        ]);
})();