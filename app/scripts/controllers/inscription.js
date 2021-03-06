/**
 * @ngdoc function
 * @name clientApp.controller:InscriptionCtrl
 * @description
 * # InscriptionCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('InscriptionCtrl', ['$scope', '$state', 'alertify', 'DataService', 'FileService', '$q','UserService', 'TokenService',
      function ($scope, $state, alertify, DataService, FileService, $q, UserService, TokenService) {

                $scope.init = init;
                $scope.createUser = createUser;

                $scope.init();

                // -------------------------------------------------

                function init() {

                    // DEBUG
                    /*$scope.lastName = "demo";
                    $scope.firstName = "contrib";
                    $scope.address = "5 rue de la demo";
                    $scope.city = "31400";
                    $scope.zipCode = "Toulouse";
                    $scope.nameUser = "Contributeur";
                    $scope.email = "contrib@demo.fr";
                    $scope.password = "contrib";
                    $scope.passwordConfirm = "contrib";
                    $scope.description = "Je suis un contributeur qui contribue au bonheur de tous et à l’avènement de projet majeur qui vont révolutionner le monde, compter sur ma bourse pour aider les plus démunis. \n \n I'M BATMAN.";*/
                    initDatePicker();
                    initCategorieMultipleSelect();
                    $('#toggle').bootstrapToggle('off');
                    $scope.typeUser = "Contributeur";
                    $('#toggle').change(function() {
                        if($scope.typeUser == "Contributeur"){
                            $scope.typeUser = "Proposeur";
                        }else{
                            $scope.typeUser = "Contributeur";
                        }
                        $scope.$apply();
                    });
                }

                // PUBLIC
                // ----------------------------------------------------------------------------
                function createUser() {
                    var typeUser = getToggleValue(),
                        compteValid = isCompteValid();

                    if (compteValid.valid) {
                        if (typeUser == "Contributeur") {
                            DataService.createContributeur({
                                    "nom": $scope.lastName,
                                    "prenom": $scope.firstName,
                                    "adresse": $scope.address,
                                    "ville": $scope.city,
                                    "codePostal": $scope.zipCode,
                                    "estCompteActif": true,
                                    "username": $scope.nameUser,
                                    "email": $scope.email,
                                    "created": new Date(),
                                    "dateNaissance": $scope.dateBirth,
                                    "password": $scope.password,
                                    "description": $scope.description,
                                    "avatarUrl": apiServer + "/api/containers/Contributeur/download/" + $scope.email
                                })
                                .then(function (user) {
                                    return manageCategoriesPreferees(user);
                                })
                                .then(function (user) {
                                    loadAvatar("Contributeur")
                                        .then(function () {
                                            login();
                                            alertify.success("Le compte a bien été créé. Vous pouvez dés maintenant vous connecter")
                                        })
                                })
                                .catch(function (err) {
                                    if (err == "Error 422 (Unprocessable Entity): [object Object]") {
                                        alertify.error("Un compte avec cet email existe déjà");
                                    }
                                    alertify.error("Erreur lors de la création de votre compte");
                                    console.log(err);
                                });
                        } else {
                            DataService.createProposeur({
                                    "nom": $scope.lastName,
                                    "prenom": $scope.firstName,
                                    "adresse": $scope.address,
                                    "ville": $scope.city,
                                    "dateNaissance": $scope.dateBirth,
                                    "codePostal": $scope.zipCode,
                                    "estCompteActif": true,
                                    "created": new Date(),
                                    "username": $scope.nameUser,
                                    "email": $scope.email,
                                    "password": $scope.password,
                                    "description": $scope.description,
                                    "avatarUrl": apiServer + "/api/containers/Proposeur/download/" + $scope.email
                                })
                                .then(function (user) {
                                    loadAvatar("Proposeur")
                                        .then(function () {
                                            login();
                                            alertify.success("Le compte a bien été créé. Vous pouvez dés maintenant vous connecter")
                                        })
                                })
                                .catch(function (err) {
                                    if (err == "Error 422 (Unprocessable Entity): [object Object]") {
                                        alertify.error("Un compte avec cet email existe déjà");
                                    }
                                    alertify.error("Erreur lors de la création de votre compte");
                                    console.log(err);
                                });
                        }
                    } else {
                        alertify.error(compteValid.err);
                    }
                }

                // PRIVATE
                // ----------------------------------------------------------------------------
                function login(){
                    UserService.login({
                            email: $scope.email,
                            password: $scope.password
                        })
                        .then(function (data) {
                            UserService.setIdUser(data.token.userId);
                            UserService.setTypeUser(data.token.typeUser);
                            TokenService.setToken(data.token.id);
                            DataService.getUser({
                                userId: data.token.userId,
                                typeUser: data.token.typeUser
                            }).then(function (data) {
                                alertify.success("Bienvenue " + data.user.username);
                                $state.go('home');
                            });
                        })
                        .catch(function (err) {

                            alertify.error("Ce compte n'existe pas ou n'est plus actif");
                        })
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

                function manageCategoriesPreferees(user){
                    var categories = $scope.dataCategorie.selectedCategories, 
                        tabOfPromise = [], 
                        size = categories.length;
                    for(var i = 0; i < size; i++){
                        tabOfPromise.push(DataService.addLinkCategorieContributeur(user, categories[i]));
                    }
                    return $q.all(tabOfPromise);
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

                function isCompteValid() {
                    if (!$scope.nameUser) {
                        return {
                            valid: false,
                            err: "Veuillez rentrez un nom d'utilisateur valide"
                        }
                    }
                    if (!$scope.lastName) {
                        return {
                            valid: false,
                            err: "Veuillez rentrez un nom"
                        }
                    }
                    if (!$scope.firstName) {
                        return {
                            valid: false,
                            err: "Veuillez rentrez un prénom"
                        }
                    }
                    var dateNow = moment((new Date()));
                    if (!$scope.dateBirth || moment($scope.dateBirth).isAfter(dateNow)) {
                        return {
                            valid: false,
                            err: "Veuillez rentrez une date de naissance valide"
                        }
                    }
                    if (!$scope.address) {
                        return {
                            valid: false,
                            err: "Veuillez rentrez un adresse"
                        }
                    }
                    if (!$scope.zipCode) {
                        return {
                            valid: false,
                            err: "Veuillez rentrez un code postal"
                        }
                    }
                    if (!$scope.city) {
                        return {
                            valid: false,
                            err: "Veuillez rentrez une ville"
                        }
                    }
                    var emailValid = isValidEmail($scope.email);
                    if (!emailValid) {
                        return {
                            valid: false,
                            err: "Veuillez rentrez un email valide"
                        }
                    }
                    if (!$scope.password || $scope.password.length <= 6) {
                        return {
                            valid: false,
                            err: "Veuillez rentrez un mot de passe valide"
                        }
                    }
                    if (!$scope.passwordConfirm || $scope.password != $scope.passwordConfirm) {
                        return {
                            valid: false,
                            err: "Mot de passe et confirmation différent"
                        }
                    }
                    if (!$scope.description || $scope.description == "") {
                        return {
                            valid: false,
                            err: "Veuillez rentrer une description"
                        }
                    }
                    if (!$scope.file) {
                        return {
                            valid: false,
                            err: "Veuillez charger une photo"
                        }
                    }
                    return {
                        valid: true,
                        err: "ok"
                    }
                }

                function isValidEmail() {
                    return true;
                }

                function isValidNameUser() {
                    return true;
                }

                function initCategorieMultipleSelect(){
                    DataService.getCategories()
                        .then(function(data){
                            $scope.dataCategorie = {
                                categories : data, 
                                selectedCategories: []
                            }
                        })
                        .catch(function(err){
                            alertify.error("Erreur lors du chargement des catégories");
                            console.log("Erreur getCategories: "+err);
                        })
                }
          
                function initDatePicker() {

                    var locale = {
                        applyLabel: "Ok",
                        cancelLabel: 'Annuler',
                        fromLabel: "Début",
                        toLabel: "Fin",
                        format: 'DD/MM/YYYY'
                    };

                    $scope.dpkOptions = {
                        singleDatePicker: true,
                        locale: locale,
                        startDate: moment(new Date())
                    };
                }

                function getToggleValue() {
                    var valueToggle = $('#toggle').prop('checked');
                    if (valueToggle) {
                        return 'Proposeur';
                    } else {
                        return 'Contributeur';
                    }
                }
      }]);
}());