/**
 * @ngdoc function
 * @name clientApp.controller:SearchResultCtrl
 * @description
 * # SearchResultCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('SearchResultCtrl', ['$scope', '$state', 'DataService', 'SearchService',
      function ($scope, $state, DataService, SearchService) {

                $scope.init = init;
                $scope.goToProjectDetail = goToProjectDetail;
                $scope.init();

                // -------------------------------------------------

                function init() {
                    $scope.searchValue = SearchService.getSearchValue();
                    if ($scope.searchValue) {
                        if ($scope.searchValue.id) {
                            $scope.searchValue = $scope.searchValue.titre;
                        }

                        DataService.searchProjet($scope.searchValue)
                            .then(function (data) {
                                $scope.countResult = data.results.length;
                                $scope.projects = data.results;
                            })
                    }
                }


                // PUBLIC
                // ----------------------------------------------------------------------------

                function goToProjectDetail(projectId) {
                    $state.go('project', {
                        projectId: projectId
                    });
                }

                // PRIVATE
                // ----------------------------------------------------------------------------
      }]);
}());