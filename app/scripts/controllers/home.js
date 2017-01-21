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
                            $scope.projects = getProjectHomePage(projects);
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
                function getProjectHomePage(projects) {
                    var dateNow = new Date(),
                        projectsValid = _.filter(projects, function (project) {
                            var dateExpiration = moment(new Date(project.dateExpiration));
                            if(!project.dateExpirationMisEnAvant){
                                return false;
                            }
                            var dateExpirationMisEnAvant = moment(new Date(project.dateExpirationMisEnAvant));
                            
                            return dateExpiration.isAfter(dateNow) && dateExpirationMisEnAvant.isAfter(dateNow) && !project.estArchive;
                        }),
                        result = [{
                            "titre": "Projet d'Oc",
                            "isAboutUs":true,
                            "description": "Contribuez à la vie de la région Toulousaine en finançant ou en proposant des projets culturels, solidaires ou entrepreneuriaux.",
                            "urlPhotoPrincipal": "http://127.0.0.1:3000/api/containers/default/download/toulouse.jpg"
                        }], 
                        size = projectsValid.length; 
                    for(var i = 0; i < size; i++){
                        result.push(projectsValid[i]);
                    }
                    return result;
                }
        }]);
}());