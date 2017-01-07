/**
 * @ngdoc function
 * @name clientApp.controller:CompteUserCtrl
 * @description
 * # CompteUserCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('CompteUserCtrl', ['$scope', '$state', '$stateParams', 'DataService', 'UserService', 'TokenService',
      function ($scope, $state, $stateParams, DataService, UserService, TokenService) {

                $scope.init = init;
                $scope.goToProject = goToProject;
                $scope.formatAge = formatAge;
                $scope.formatDate = formatDate;
                $scope.goToUpdateCompteUser = goToUpdateCompteUser;

                $scope.init();

                // -------------------------------------------------

                function init() {
                    var userId = $stateParams.userId,
                        typeUser = UserService.getTypeUser();
                    moment().locale('fr');


                    if (userId == UserService.getIdUser()) {
                        $scope.showEditing = true;
                    } else {
                        $scope.showEditing = false;
                    }

                    // init user compte part
                    DataService.getUser({
                            userId: userId,
                            typeUser: UserService.getTypeUser()
                        })
                        .then(function (data) {
                            data.user.created = moment(data.user.created).format('DD MMM YYYY');
                            $scope.user = data.user;
                        });

                    if (typeUser == "Proposeur") {
                        // init user project part 
                        DataService.getProjectOfUser(userId)
                            .then(function (projects) {
                                var dateNow = moment((new Date()));
                                $scope.projects = _.filter(projects, function (project) {
                                    var dateExpiration = moment(new Date(project.dateExpiration));
                                    return dateExpiration.isAfter(dateNow) && !project.estArchive;
                                });
                            });
                        $scope.showProject = true;
                        $scope.showContribution = false;
                    } else {
                        initTable();
                        $scope.showProject = false;
                        $scope.showContribution = true;
                    }
                }


                // PUBLIC
                // ----------------------------------------------------------------------------
                function goToProject(projectId) {
                    $state.go('project', {
                        projectId: projectId
                    });
                }

                function goToUpdateCompteUser() {
                    $state.go('updateUser', {
                        userId: UserService.getIdUser()
                    });
                }

                function formatDate(date) {
                    return moment(date).format('DD MMM YYYY');
                }

                // PRIVATE
                // ----------------------------------------------------------------------------
                function initTable() {
                    DataService.getContributionWithProjectsOfUser(UserService.getIdUser())
                        .then(function (data) {
                            $scope.contributions = _.sortBy(data.contributions, function (contribution) {
                                var date = new Date(contribution.date);
                                return date.getTime() * -1;
                            });
                        });
                }

                function formatAge(dateBirth) {
                    var dateBirthMoment = moment(dateBirth),
                        nowMoment = moment(new Date()),
                        age = nowMoment.diff(dateBirthMoment, 'year', false)
                    return age;
                }
      }]);
}());