/**
 * @ngdoc function
 * @name clientApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('HomeCtrl', ['$scope', '$state', 'DataService',
      function ($scope, $state, DataService) {

                $scope.init = init;

                $scope.goToProjectDetail = goToProjectDetail;

                $scope.init();

                // -------------------------------------------------

                function init() {

                    DataService.getProjectFrontPage()
                        .then(function (projects) {
                            var dateNow = moment((new Date()));
                            $scope.projects = _.filter(projects, function (project) {
                                var dateExpiration = moment(new Date(project.dateExpiration));
                                return dateExpiration.isAfter(dateNow) && !project.estArchive;
                            });
                        });
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