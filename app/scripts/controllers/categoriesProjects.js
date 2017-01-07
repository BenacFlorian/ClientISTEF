/**
 * @ngdoc function
 * @name clientApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('CategoriesProjectsCtrl', ['$scope', '$state', '$stateParams', 'DataService',
      function ($scope, $state, $stateParams, DataService) {

                $scope.init = init;
                $scope.goToProject = goToProject;
                $scope.goToCompteProposeur = goToCompteProposeur;

                $scope.init();

                // -------------------------------------------------

                function init() {
                    var categorieId = $stateParams.categorieId;
                    DataService.getCategorieWithProject(categorieId)
                        .then(function (categorie) {
                            $scope.projects = _.filter(categorie.projets, function (project) {
                                var dateExpiration = moment(new Date(project.dateExpiration)),
                                    dateNow = moment(new Date());
                                return dateExpiration.isAfter(dateNow) && !project.estArchive;
                            });
                            $scope.projectCount = $scope.projects.length;
                            $scope.categorie = categorie;
                        })
                }

                // PUBLIC
                // ----------------------------------------------------------------------------
                function goToProject(projectId) {
                    $state.go('project', {
                        projectId: projectId
                    });
                }

                function goToCompteProposeur(userId) {
                    $state.go('compteUser', {
                        userId: userId
                    });
                }

                // PRIVATE
                // ----------------------------------------------------------------------------
      }]);
}());