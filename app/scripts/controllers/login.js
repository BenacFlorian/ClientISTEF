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

                $scope.init();

                // -------------------------------------------------

                function init() {}

                // PUBLIC
                // ----------------------------------------------------------------------------
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
      }]);
}());