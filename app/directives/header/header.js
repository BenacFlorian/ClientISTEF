(function () {
    'use strict';

    angular.module('clientApp')
        .directive('header', ['$state', 'UserService', 'DataService', 'SearchService',
            'alertify', 'TokenService',
            function ($state, UserService, DataService, SearchService, alertify, TokenService) {

                return {
                    templateUrl: 'directives/header/header.html',
                    restrict: 'E',
                    replace: true,
                    link: function (scope, element, attrs) {

                        scope.showSearchInput = false;

                        // init menu 
                        var userId = UserService.getIdUser(),
                            typeUser = UserService.getTypeUser();

                        if (typeUser == "Contributeur") {
                            scope.isContributeur = true;
                        } else {
                            scope.isContributeur = false;
                        }

                        if (userId) {
                            DataService.getUser({
                                    userId: userId,
                                    typeUser: typeUser
                                })
                                .then(function (data) {
                                    scope.username = data.user.username;
                                    if (scope.username) {
                                        scope.isConnected = true;
                                    } else {
                                        scope.isConnected = false;
                                    }
                                });
                        }

                        DataService.getProjectTyephead()
                            .then(function (data) {
                                scope.projets = data;
                            });

                        scope.actualizeHeader = function () {
                            var userId = UserService.getIdUser(),
                                typeUser = UserService.getTypeUser();

                            if (userId) {
                                DataService.getUser({
                                        userId: userId,
                                        typeUser: typeUser
                                    })
                                    .then(function (data) {
                                        scope.username = data.user.username;
                                        scope.userId = data.user.id;
                                        if (scope.username) {
                                            scope.isConnected = true;
                                        } else {
                                            scope.isConnected = false;
                                        }
                                    });
                            } else {
                                scope.isConnected = false;
                            }
                        }

                        scope.searchResult = function () {
                            var searchValue = scope.searchValue;
                            if (searchValue) {
                                SearchService.setSearchValue(searchValue);
                                if ($state.current.name != 'searchResult') {
                                    $state.go('searchResult');
                                } else {
                                    $state.go($state.current, {}, {
                                        reload: true
                                    });
                                }
                            } else {
                                alertify.error("Veuillez rentrez des mots clé")
                            }
                        }

                        scope.categories = function () {
                            $state.go('categories');
                        }

                        scope.logout = function () {
                            UserService.logout(UserService.getIdUser())
                                .then(function () {
                                    scope.actualizeHeader();
                                    TokenService.removeToken();
                                    alertify.success('Au revoir');
                                })
                        }

                        scope.search = function () {
                            scope.showSearchInput = !scope.showSearchInput;
                        }
                    }
                };

                    }]);

}());