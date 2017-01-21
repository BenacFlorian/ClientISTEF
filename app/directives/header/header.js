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

                        initHeader();
                        
                        scope.actualizeHeader = function () {
                            initHeader();
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
                                    $state.go($state.current, {}, {reload: true});
                                    alertify.success('Au revoir');
                                })
                        }

                        scope.search = function () {
                            scope.showSearchInput = !scope.showSearchInput;
                        }
                        
                        function initHeader(){
                            scope.showSearchInput = false;

                            // init menu 
                            var userId = UserService.getIdUser(),
                                typeUser = UserService.getTypeUser();
                            scope.typeUser = typeUser;
                            scope.userId = userId;
                            if (typeUser == "Proposeur") {
                                scope.isProposeur = true;
                            } else {
                                scope.isProposeur = false;
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
                            } else {
                                scope.isConnected = false;
                            }

                            DataService.getProjectTypehead()
                                .then(function (data) {
                                    var dateNow = new Date();
                                    scope.projets = _.filter(data, function (project) {
                                        var dateExpiration = moment(new Date(project.dateExpiration));
                                        return dateExpiration.isAfter(dateNow) && !project.estArchive;
                                    });
                                });
                        }
                    }
            }

    }]);

}());