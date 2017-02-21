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
        .controller('CompteUserCtrl', ['$scope', '$state', '$stateParams', 'DataService', 'UserService', 'TokenService', 'alertify','$q',
      function ($scope, $state, $stateParams, DataService, UserService, TokenService, alertify,$q) {

                $scope.init = init;
                $scope.goToProject = goToProject;
                $scope.formatAge = formatAge;
                $scope.formatDate = formatDate;
                $scope.deleteUser = deleteUser;
                $scope.goToUpdateCompteUser = goToUpdateCompteUser;
                $scope.goToCategorie = goToCategorie;
                $scope.formatEstActif = formatEstActif;

                $scope.init();

                // -------------------------------------------------

                function init() {
                    var userId = $stateParams.userId,
                        typeUser = $stateParams.typeUser;
                    moment().locale('fr');
                    $scope.typeUser == UserService.getTypeUser()

                    if (userId == UserService.getIdUser() && typeUser == UserService.getTypeUser() && typeUser != "Admin") {
                        $scope.showEditing = true;
                    } else {
                        $scope.showEditing = false;
                    }
                    
                    if (userId == UserService.getIdUser() && typeUser == UserService.getTypeUser() && typeUser == "Admin"){
                        $scope.dontShowButtonDeleteUser = true;
                    }else{
                        $scope.dontShowButtonDeleteUser = false;
                    }
                    
                    if(userId == UserService.getIdUser() && typeUser == UserService.getTypeUser()){
                        $scope.isOwnCompte = true;
                    }else{
                        $scope.isOwnCompte = false;
                    }
                    
                    // init user compte part
                    DataService.getUser({
                            userId: userId,
                            typeUser: typeUser
                        })
                        .then(function (data) {
                            data.user.created = moment(data.user.created).format('DD MMM YYYY');
                            $scope.user = data.user;
                        });

                    if (typeUser == "Proposeur") {
                        
                        if($scope.isOwnCompte){
                            initStatistique();
                        }
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
                        DataService.getUserCategoriePreferees(userId)
                            .then(function(data){
                                $scope.categories = data;
                            })
                        initTable();
                        $scope.showProject = false;
                        $scope.showContribution = true;
                    }                    

                    if(typeUser == "Admin"){
                        initAdminPart();
                        $scope.isAdmin = true;
                        $scope.showContribution = false;
                    }else{
                        $scope.isAdmin = false;
                    }
                }


                // PUBLIC
                // ----------------------------------------------------------------------------
                function formatEstActif(bool){
                    if(bool){
                        return "Actif";
                    }else{
                        return "Désactivé"
                    }
                }   
                
                function deleteUser(){
                    var userId = $stateParams.userId, 
                        typeUser = $stateParams.typeUser; 
                    DataService.deleteUser(userId, typeUser)
                        .then(function(data){
                            return DataService.getProjectOfUser(userId);
                        })
                        .then(function(projects){
                            var size = projects.length, 
                                tabOfPromise = []; 
                            for(var i = 0; i < size; i++){
                                tabOfPromise.push(DataService.archiveProject(projects[i].id));
                            }
                            return $q.all(tabOfPromise);
                        })
                        .then(function(){
                            alertify.success("Utilisateur supprimé");
                            $state.go('home');
                        })
                        .catch(function(err){
                            console.log(err);
                            alertify.error("Probléme lors de la suppression de l'utilisateur");
                        })
                }
                
                function goToCategorie(id) {
                    if (id) {
                        $state.go('categoriesProjects', {
                            categorieId: id
                        });
                    } else {
                        alertify.error("Erreur durant la récupération de donnée");
                    }
                }
                
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
                function initAdminPart(){
                    DataService.getProjectArchive()
                        .then(function(data){
                            $scope.projets = data;
                        })
                    DataService.getUsers()
                        .then(function(data){
                            $scope.users = data.users;
                        })
                }
          
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