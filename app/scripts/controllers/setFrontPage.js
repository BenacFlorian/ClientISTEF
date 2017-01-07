/**
 * @ngdoc function
 * @name clientApp.controller:SetFrontPageCtrl
 * @description
 * # SetFrontPageCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('SetFrontPageCtrl', ['$scope', '$state', 'DataService', '$stateParams', 'alertify',
      function ($scope, $state, DataService, $stateParams, alertify) {

                $scope.init = init;

                $scope.setFrontPage = setFrontPage;

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
                function setFrontPage() {
                    var value = $scope.amount;
                    if (isValidAmount().valid) {
                        var nbWeek = value / 10;
                        if ($scope.project.dateExpirationMisEnAvant) {
                            var dateExpirationFrontPage = moment($scope.project.dateExpirationMisEnAvant).add(nbWeek, 'week');
                        } else {
                            var dateExpirationFrontPage = moment(new Date()).add(nbWeek, 'week');
                        }
                        DataService.updateProject($stateParams.projectId, {
                                "dateExpirationMisEnAvant": dateExpirationFrontPage
                            })
                            .then(function () {
                                alertify.success("Votre financement a bien été pris en compte, votre projet est mis en avant jusq'au " + dateExpirationFrontPage.format('DD MMM YYYY'));
                                $state.go('project', {
                                    projectId: $stateParams.projectId
                                });
                            })
                    } else {
                        alertify.error(isValidAmount().err);
                    }
                }

                // PRIVATE
                // ----------------------------------------------------------------------------
                function isValidAmount() {
                    var value = parseInt($scope.amount);
                    if (value <= 0) {
                        return {
                            err: "Veuillez renseigner un montant positif",
                            valid: false
                        };
                    }
                    if (isNaN(value)) {
                        return {
                            err: "Le montant doit être un nombre",
                            valid: false
                        };
                    }
                    if (value % 10 != 0) {
                        return {
                            err: "Le montant doit être un multiple de 10",
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