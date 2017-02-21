/**
 * @ngdoc function
 * @name clientApp.controller:ProjectCtrl
 * @description
 * # ProjectCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('ProjectCtrl', ['$scope', '$state', '$stateParams', 'DataService', 'UserService', 'alertify',
      function ($scope, $state, $stateParams, DataService, UserService, alertify) {

                $scope.init = init;

                $scope.goToCategorie = goToCategorie;
                $scope.goToContribute = goToContribute;
                $scope.goToUpdateProject = goToUpdateProject;
                $scope.goToSetFrontPage = goToSetFrontPage;

                $scope.changeImageSelected = changeImageSelected;
                $scope.deleteProject = deleteProject;
          
                $scope.defineCategorie = defineCategorie;
                $scope.categorieChange = categorieChange;
          
                $scope.formatDate = formatDate;

                $scope.init();
          
                $scope.dataCategorie = {
                    selectedCategorie : {}, 
                    tabOfCategorie: []
                }

                // -------------------------------------------------

                function init() {
                    var projectId = $stateParams.projectId;

                    $scope.typeUser = UserService.getTypeUser();
                    
                    $scope.definingCategorie = false;
                    $scope.notDefiningCategorie = true;
                    
                    DataService.getProject(projectId)
                        .then(function (project) {
                            if($scope.typeUser != "Admin"){
                                if (project.compteProposeurId == UserService.getIdUser() && $scope.typeUser == "Proposeur") {
                                    $scope.isOwnProject = true;
                                } else {
                                    $scope.isOwnProject = false;
                                }
                            }else{
                                $scope.isOwnProject = false;                                
                            }
                            $scope.proposeur = project.compteProposeur;
                            $scope.contreparties = project.contreparties;
                            $scope.contributions = project.contributions;
                
                            // si le projet a une date d'expiration et qu'elle est dans le futur
                            if (project.dateExpirationMisEnAvant && moment(project.dateExpirationMisEnAvant).isAfter(moment(new Date()))) {
                                $scope.showDateExpirationFrontPage = true;
                                project.dateExpirationMisEnAvant = moment(project.dateExpirationMisEnAvant).format("DD MMM YYYY");
                            } else {
                                $scope.showDateExpirationFrontPage = false;
                            }

                            $scope.project = project;
                            getImgListUrl(project);
                            if (project.urlVideo) {
                                $scope.haveVideo = true;
                            } else {
                                $scope.haveVideo = false;
                            }
                        })
                }


                // PUBLIC
                // ----------------------------------------------------------------------------
          
                function formatDate(date) {
                    return moment(date).format('DD MMM YYYY');
                }
          
                function deleteProject(projectId) {
                    DataService.archiveProject(projectId)
                        .then(function () {
                            if(UserService.getTypeUser() == "Admin"){
                                alertify.success("Le projet a été archivé");
                            }else{
                                alertify.success("Le projet a été supprimé");
                            }
                            $state.go('home');
                        })
                        .catch(function (err) {
                            if(UserService.getTypeUser() == "Admin"){
                                alertify.error("Erreur durant l'arcvhivage du projet");
                            }else{
                                alertify.error("Erreur durant la suppresion du projet");
                            }
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

                function goToContribute() {
                    $state.go('contribute', {
                        projectId: $scope.project.id
                    });
                }

                function goToUpdateProject() {
                    $state.go('updateProject', {
                        projectId: $scope.project.id
                    });
                }

                function goToSetFrontPage() {
                    $state.go('setFrontPage', {
                        projectId: $stateParams.projectId
                    });
                }

                function changeImageSelected(urlImg) {
                    $scope.dataImg.imageSelected = urlImg;
                }
          
                function defineCategorie(){
                    $scope.definingCategorie = true;
                    $scope.notDefiningCategorie = false;
                    DataService.getCategories()
                        .then(function(categories){
                            $scope.dataCategorie.tabOfCategorie = categories;
                            $scope.dataCategorie.selectedCategorie = _.find(categories, function(categorie){
                                return categorie.id == $scope.project.categorieId;
                            });
                        })
                }
          
                function categorieChange(){
                    $scope.definingCategorie = false;
                    var categorie = $scope.dataCategorie.selectedCategorie;
                    DataService.updateCategorie($scope.project.id,categorie)
                        .then(function(data){
                            var newCategorie = _.find( $scope.dataCategorie.tabOfCategorie, function(categorie){
                                return categorie.id == data.categorieId;
                            });
                            $scope.project.categorieId = newCategorie.id; 
                            alertify.success("La catégorie a été modifié");
                            $scope.project.categorie = newCategorie;
                            $scope.notDefiningCategorie = true;
                        })
                        .catch(function(err){
                            alertify.error("Problème lors de la modification de la catégorie"); 
                            console.log(err);
                        });
                }

                // PRIVATE
                // ----------------------------------------------------------------------------

                function getImgListUrl(project) {
                    var listImg = [],
                        photos = project.photos,
                        size = photos.length;
                    for (var i = 0; i < size; i++) {
                        var url = apiServer + "/api/containers/" + project.id + "/download/" + photos[i].name;
                        listImg.push(url);
                        if (project.urlPhotoPrincipal == url) {
                            var indexPrincipal = i;
                        }
                    }
                    $scope.dataImg = {
                        imageList: listImg,
                        imageSelected: listImg[indexPrincipal]
                    }
                }
      }]);
}());