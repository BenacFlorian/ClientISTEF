/**
 * @ngdoc function
 * @name clientApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('LoginCtrl', ['$scope', '$state', 'DataService', 'TokenService', 'UserService', 'alertify', '$rootScope',
      function ($scope, $state, DataService, TokenService, UserService, alertify, $rootScope) {

                $scope.init = init;
                $scope.login = login;
                $scope.loginFB = loginFB;

                $scope.init();

                // -------------------------------------------------

                function init() {
                    initFB();
                }

                // PUBLIC
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
          
                function login() {
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

                // PRIVATE
                // ----------------------------------------------------------------------------
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
                                        .catch(function(err){
                                            alertify.error("Le compte associé à ce compte facebook n'est plus actif");
                                            console.log(err);
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
      }]);
}());