/**
 * @ngdoc function
 * @name clientApp.controller:UpdateUserCtrl
 * @description
 * # UpdateUserCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('UpdateUserCtrl', ['$scope', '$state', 'DataService', 'UserService', 'alertify', '$q', 'FileService', 'TokenService',
      function ($scope, $state, DataService, UserService, alertify, $q, FileService, TokenService) {

                $scope.init = init;
                $scope.deleteCompteUser = deleteCompteUser;
                $scope.updateCompteUser = updateCompteUser;

                $scope.init();

                // -------------------------------------------------

                function init() {
                    var userId = UserService.getIdUser();
                    if (UserService.getTypeUser() == "Contributeur") {
                        initCategorieMultipleSelect(userId);
                        DataService.getContributeur(userId)
                            .then(function (user) {
                                $scope.email = user.email;
                                $scope.user = user;
                            });
                        $scope.isContributeur = true;
                    } else {
                        DataService.getProposeur(userId)
                            .then(function (user) {
                                $scope.email = user.email;
                                $scope.user = user;
                            });
                        $scope.isContributeur = false;
                    }
                }

                // PUBLIC
                // ----------------------------------------------------------------------------
                function updateCompteUser() {
                    if (UserService.getTypeUser() == "Contributeur") {
                        DataService.updateCompteContributeur($scope.user)
                            .then(function (compteUser) {
                                return manageRelationBetweenContributeurAndCategorie(compteUser);
                            })
                            .then(function(){
                                if($scope.file){
                                    loadAvatar(UserService.getTypeUser())
                                        .then(function () {
                                            alertify.success("Vos données ont bien été mis à jour");
                                        })
                                        .catch(function(err){
                                            alertify.error('Il y a eu une erreur lors de la modification de votre avatar.'); 
                                            console.log(err);
                                        });
                                }else{
                                    alertify.success("Vos données ont bien été mis à jour");
                                }
                            })
                            .catch(function(err){
                                alertify.error('Il y a eu une erreur lors de la modification de votre compte.'); 
                                console.log(err);
                            });
                    } else {
                        DataService.updateCompteProposeur($scope.user)
                            .then(function (compteUser) {
                                if($scope.file){
                                    loadAvatar(UserService.getTypeUser())
                                        .then(function () {
                                            alertify.success("Vos données ont bien été mis à jour");
                                        })
                                        .catch(function(err){
                                            alertify.error('Il y a eu une erreur lors de la modification de votre avatar.'); 
                                            console.log(err);
                                        });
                                }else{
                                    alertify.success("Vos données ont bien été mis à jour");
                                }
                            })
                            .catch(function(err){
                                alertify.error('Il y a eu une erreur lors de la modification de votre compte.'); 
                                console.log(err);
                            });
                    }
                }

                function deleteCompteUser() {
                    var userId = UserService.getIdUser();
                    if (UserService.getTypeUser() == "Contributeur") {
                        archiveCompte(userId);
                    } else {
                        DataService.getProjectOfUser(userId)
                            .then(function (projects) {
                                return archiveProjects(projects)
                                    .then(function () {
                                        return archiveCompte(userId);
                                    })
                            })
                            .then(function () {
                                UserService.logout(UserService.getIdUser())
                                    .then(function () {
                                        TokenService.removeToken();
                                        $state.go('home');
                                    })
                                alertify.success("Votre compte a été désactivé");
                            })
                            .catch(function (err) {
                                console.log(err);
                                alertify.error("Problème durant la désactivation de votre compte");
                            });
                    }
                }

                // PRIVATE
                // ----------------------------------------------------------------------------

                // INIT PART 
                function initCategorieMultipleSelect(userId){
                    DataService.getCategories(userId)
                        .then(function(data){
                            $scope.dataCategorie = {
                                categories : data, 
                                selectedCategories: []
                            };
                            return DataService.getUserCategoriePreferees(userId);
                        })
                        .then(function(categoriesPreferees){
                            $scope.dataCategorie.selectedCategories = categoriesPreferees;
                        })
                        .catch(function(err){
                            alertify.error("Erreur lors du chargement des catégories");
                            console.log("Erreur getCategories: "+err);
                        })
                }
          
                // UPDATE DATA PART
                function manageRelationBetweenContributeurAndCategorie(user){
                    return DataService.getUserCategoriePreferees(user.id)
                        .then(function(categoriePreferees){
                            // delete all relation
                            var tabOfPromise = [],
                                size = categoriePreferees.length; 
                            for(var i = 0; i < size; i++){
                                tabOfPromise.push(DataService.deleteRelCategorieUser(user, categoriePreferees[i]));
                            }
                            return $q.all(tabOfPromise);
                        })
                        .then(function(){
                            // re-create all relation
                            var tabOfPromise = [],
                                size = $scope.dataCategorie.selectedCategories.length; 
                            for(var i = 0; i < size; i++){
                                tabOfPromise.push(DataService.addLinkCategorieContributeur(user, $scope.dataCategorie.selectedCategories[i]));
                            }
                            return $q.all(tabOfPromise);
                        })
                        .catch(function(err){
                            alertify.error("Erreur durant la mise à jour des catégories préférées"); 
                            console.log("Error : "+err);
                        });
                }
          
                function loadAvatar(typeUser) {
                    return FileService.getFiles(typeUser)
                        .then(function (files) {
                            var fileExisted = fileExist($scope.file.name, files);
                            if (fileExisted) {
                                // delete old file, because we can't have 2 times the same name for file
                                FileService.deleteFile(typeUser, $scope.file.name)
                                    .then(function (res) {
                                        // upload new file and display it
                                        return manageUpload(typeUser);
                                    })
                                    .catch(errorUploadImageOrData);
                            } else {
                                // upload new file and display it
                                return manageUpload(typeUser);
                            }
                        });
                }

                function manageUpload(typeUser) {

                    var img = $scope.file,
                        uploadUrl = apiServer + "/api/containers/" + typeUser + "/upload";

                    return FileService.uploadFileToUrl(img, uploadUrl, $scope.email);
                }

                function fileExist(fileName, fileList) {
                    var fileFound = false,
                        size = fileList.length;
                    for (var i = 0; i < size; i++) {
                        // check if containers exist
                        if (fileList[i].name == fileName) {
                            fileFound = true;
                        }
                    }
                    return fileFound;
                }

                function errorUploadImageOrData(err) {
                    alertify.error('Erreur lors de l\'enregistrement des données');
                    console.log('ERROR: ' + err);
                }

                // ARCHIVE COMPTE PART
                function archiveProjects(projects) {
                    var tabOfPromise = [],
                        size = projects.length;
                    for (var i = 0; i < size; i++) {
                        tabOfPromise.push(DataService.archiveProject(projects[i].id, {
                            estArchive: true
                        }));
                    }
                    return $q.all(tabOfPromise);
                }

                function archiveCompte(userId) {
                    if (UserService.getTypeUser() == "Contributeur") {
                        return DataService.archiveContributeur(userId, {
                            estCompteActif: false
                        });
                    } else {
                        return DataService.archiveProposeur(userId, {
                            estCompteActif: false
                        });
                    }
                }
                        }]);
}());