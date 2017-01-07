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

                    initStatistique();
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
                function initStatistique() {

                    DataService.getStatistique($stateParams.userId)
                        .then(function (data) {
                            $scope.stats = data.stats;

                            if (data.stats.dataChart.completed == 0 && data.stats.dataChart.notCompleted == 0 && data.stats.dataChart.depassed == 0) {
                                $scope.hideChart = true;
                            } else {
                                $scope.hideChart = false;
                            }

                            $scope.data = [
                                {
                                    key: "Somme atteinte",
                                    y: parseInt(data.stats.dataChart.completed)
                                },
                                {
                                    key: "Somme dépassé de au moins 50%",
                                    y: parseInt(data.stats.dataChart.depassed)
                                },
                                {
                                    key: "Somme non atteinte",
                                    y: parseInt(data.stats.dataChart.notCompleted)
                                }
                            ];
                        });

                    $scope.options = {
                        chart: {
                            type: 'pieChart',
                            height: 300,
                            width: 500,
                            x: function (d) {
                                return d.key;
                            },
                            y: function (d) {
                                return d.y;
                            },
                            showLabels: false,
                            duration: 100,
                            labelThreshold: 0.01,
                            labelSunbeamLayout: true,
                            legend: {
                                updateState: false,
                                margin: {
                                    top: 10,
                                    right: 0,
                                    bottom: 0,
                                    left: 0
                                }
                            }
                        }
                    };
                }

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