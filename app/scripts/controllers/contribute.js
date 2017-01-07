/**
 * @ngdoc function
 * @name clientApp.controller:ContributeCtrl
 * @description
 * # ContributeCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('ContributeCtrl', ['$scope', '$state', 'DataService', '$stateParams', 'alertify', 'UserService',
      function ($scope, $state, DataService, $stateParams, alertify, UserService) {

                $scope.init = init;
                $scope.contribute = contribute;

                $scope.init();

                // -------------------------------------------------

                function init() {
                    var projectId = $stateParams.projectId;
                    DataService.getProject(projectId)
                        .then(function (project) {
                            $scope.project = project;
                        });
                }

                // PUBLIC
                // ----------------------------------------------------------------------------
                function contribute() {
                    var valid = isValidContribution();
                    if (valid.valid) {
                        DataService.createTransaction($stateParams.projectId, $scope.contributionValue, UserService.getIdUser())
                            .then(function () {
                                return DataService.updateProject($scope.project.id, {
                                    sommeRecoltee: parseInt($scope.project.sommeRecoltee) + parseInt($scope.contributionValue)
                                });
                            })
                            .then(function () {
                                alertify.success("Merci de votre contribution!");
                                $state.go('project', {
                                    projectId: $stateParams.projectId
                                })
                            })
                    } else {
                        alertify.error(valid.err);
                    }
                }

                // PRIVATE
                // ----------------------------------------------------------------------------
                function isValidContribution() {
                    var value = parseInt($scope.contributionValue);
                    if (value <= 0) {
                        return {
                            err: "Veuillez renseigner une contribution positive",
                            valid: false
                        };
                    }
                    if (isNaN(value)) {
                        return {
                            err: "La contribution doit être un montant",
                            valid: false
                        };
                    }
                    return {
                        err: "OK",
                        valid: true
                    };
                }
      }]);
}());