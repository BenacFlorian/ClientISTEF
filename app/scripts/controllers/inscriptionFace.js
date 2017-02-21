/**
 * @ngdoc function
 * @name clientApp.controller:InscriptionFaceCtrl
 * @description
 * # InscriptionFaceCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('InscriptionFaceCtrl', ['$scope', '$state', 'DataService', 'TokenService', 'UserService', 'alertify', '$rootScope','$q',
      function ($scope, $state, DataService, TokenService, UserService, alertify, $rootScope, $q) {

                $scope.init = init;
                $scope.createUser = createUser;

                $scope.init();

                // -------------------------------------------------

                function init() {
                    
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
                    $scope.dataFacebook = UserService.getDataFacebook();
                    $scope.nameUser = $scope.dataFacebook.name;
                }

                // PUBLIC
                // ----------------------------------------------------------------------------
                function createUser() {
                    var typeUser = getToggleValue(),
                        compteValid = isCompteValid();

                    var prenom = $scope.dataFacebook.name.split(' ')[1],
                        nom = $scope.dataFacebook.name.split(' ')[0], 
                        urlPhoto = $scope.dataFacebook.picture.data.url, 
                        id = $scope.dataFacebook.id;
                    if (compteValid.valid) {
                        if (typeUser == "Contributeur") {
                            DataService.createContributeur({
                                    "nom":nom,
                                    "prenom": prenom,
                                    "adresse": $scope.address,
                                    "ville": $scope.city,
                                    "codePostal": $scope.zipCode,
                                    "estCompteActif": true,
                                    "username": $scope.nameUser,
                                    "email": $scope.email,
                                    "created": new Date(),
                                    "dateNaissance": $scope.dateBirth,
                                    "password": "passwordFacebook",
                                    "description": $scope.description,
                                    "avatarUrl": urlPhoto, 
                                    "idFacebook":id
                                })
                                .then(function (user) {
                                    return manageCategoriesPreferees(user);
                                })
                                .then(function (user) {
                                    alertify.success("Le compte a bien été créé. Vous pouvez dés maintenant vous connecter");
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
                                    "nom": nom,
                                    "prenom": prenom,
                                    "adresse": $scope.address,
                                    "ville": $scope.city,
                                    "dateNaissance": $scope.dateBirth,
                                    "codePostal": $scope.zipCode,
                                    "estCompteActif": true,
                                    "created": new Date(),
                                    "username": $scope.nameUser,
                                    "email": $scope.email,
                                    "password": "passwordFacebook",
                                    "description": $scope.description,
                                    "avatarUrl": urlPhoto, 
                                    "idFacebook":id
                                })
                                .then(function (user) {
                                    alertify.success("Le compte a bien été créé. Vous pouvez dés maintenant vous connecter");
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
                function manageCategoriesPreferees(user){
                    var categories = $scope.dataCategorie.selectedCategories, 
                        tabOfPromise = [], 
                        size = categories.length;
                    for(var i = 0; i < size; i++){
                        tabOfPromise.push(DataService.addLinkCategorieContributeur(user, categories[i]));
                    }
                    return $q.all(tabOfPromise);
                }
                function isCompteValid() {
                    if (!$scope.nameUser) {
                        return {
                            valid: false,
                            err: "Veuillez rentrez un nom d'utilisateur valide"
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
                    if (!$scope.description || $scope.description == "") {
                        return {
                            valid: false,
                            err: "Veuillez rentrer une description"
                        }
                    }
                    return {
                        valid: true,
                        err: "ok"
                    }
                }
          

                function isValidEmail(email) {
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