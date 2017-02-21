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
                    initFB();
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
                                    loginFB();
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
                                    loginFB();
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
                function loginFB(){
                    FB.getLoginStatus(function(response) {
                      if (response.status === 'connected') {
                          getDataFace();
                      }
                      else {
                        FB.login(function(response) {
                          // handle the response
                            getDataFace();
                        }, {scope: 'public_profile,email'});
                      }
                    });
                }
          
                function getDataFace(){
                    FB.api('/me?fields=id,name,picture', function(response) {
                        DataService.existUserFacebook(response.id)
                            .then(function(data){
                                if(data.data.exist){
                                    UserService.loginAsFacebook({idFacebook:response.id})
                                        .then(function(data){
                                            UserService.setIdUser(data.data.userId);
                                            UserService.setTypeUser(data.data.typeUser);
                                            TokenService.setToken(data.data.id);
                                            DataService.getUser({
                                                userId: data.data.userId,
                                                typeUser: data.data.typeUser
                                            }).then(function (data) {
                                                alertify.success("Bienvenue " + data.user.username);
                                                $state.go('home');
                                            });
                                        })
                                }else{
                                    UserService.setDataFacebook(response);
                                    $state.go('inscriptionFace');
                                }
                            })
                            .catch(function(err){
                                console.log(err);
                            })
                    });
                }
          
                function initFB(){
                    window.fbAsyncInit = function () {
                        FB.init({
                            appId: '1846520165632381',
                            xfbml: true,
                            version: 'v2.8'
                        });
                        FB.AppEvents.logPageView();
                    };
                    (function(d, s, id){
                         var js, fjs = d.getElementsByTagName(s)[0];
                         if (d.getElementById(id)) {return;}
                         js = d.createElement(s); js.id = id;
                         js.src = "//connect.facebook.net/en_US/sdk.js";
                         fjs.parentNode.insertBefore(js, fjs);
                       }(document, 'script', 'facebook-jssdk'));
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