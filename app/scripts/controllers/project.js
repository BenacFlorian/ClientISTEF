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

                $scope.init();

                // -------------------------------------------------

                function init() {
                    var projectId = $stateParams.projectId;

                    $scope.typeUser = UserService.getTypeUser();
                    DataService.getProject(projectId)
                        .then(function (project) {
                            if (project.compteProposeurId == UserService.getIdUser()) {
                                $scope.isOwnProject = true;
                            } else {
                                $scope.isOwnProject = false;
                            }
                            $scope.proposeur = project.compteProposeur;
                            $scope.contreparties = project.contreparties;

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

                function deleteProject(projectId) {
                    DataService.archiveProject(projectId)
                        .then(function () {
                            alertify.success("Le projet a été supprimé");
                            $state.go('home');
                        })
                        .catch(function (err) {
                            alertify.error("Erreur durant la suppresion du projet");
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