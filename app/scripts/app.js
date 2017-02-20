'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module of the application.
 */
angular
    .module('clientApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'daterangepicker',
    'ui.router',
    'ngSanitize',
    'ui.bootstrap',
    'ngTouch',
    'nvd3',
    'ksSwiper',
    'ui.select',
    'ngAlertify'
  ])

.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
             function ($stateProvider, $urlRouterProvider, $httpProvider) {

            //Set default route
            $urlRouterProvider.otherwise('/home');

            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'views/home.html',
                    controller: 'HomeCtrl'
                })
                .state('searchResult', {
                    url: '/searchResult',
                    templateUrl: 'views/searchResult.html',
                    controller: 'SearchResultCtrl'
                })
                .state('addProject', {
                    url: '/addProject',
                    templateUrl: 'views/addProject.html',
                    controller: 'AddProjectCtrl'
                })
                .state('inscription', {
                    url: '/inscription',
                    templateUrl: 'views/inscription.html',
                    controller: 'InscriptionCtrl'
                })
                .state('updateUser', {
                    url: '/updateUser',
                    templateUrl: 'views/updateCompteUser.html',
                    controller: 'UpdateUserCtrl'
                })
                .state('contribute', {
                    url: '/contribute/{projectId}',
                    templateUrl: 'views/contribute.html',
                    controller: 'ContributeCtrl'
                })
                .state('setFrontPage', {
                    url: '/setFrontPage/{projectId}',
                    templateUrl: 'views/setFrontPage.html',
                    controller: 'SetFrontPageCtrl'
                })
                .state('categoriesProjects', {
                    url: '/categoriesProjects/{categorieId}',
                    templateUrl: 'views/categegorieProjects.html',
                    controller: 'CategoriesProjectsCtrl'
                })
                .state('login', {
                    url: '/login',
                    templateUrl: 'views/login.html',
                    controller: 'LoginCtrl'
                })
                .state('updateProject', {
                    url: '/updateProject/{projectId}',
                    templateUrl: 'views/updateProject.html',
                    controller: 'UpdateProjectCtrl'
                })
                .state('categories', {
                    url: '/categories',
                    templateUrl: 'views/categories.html',
                    controller: 'CategoriesCtrl'
                })
                .state('compteUser', {
                    url: '/compteUser/{typeUser}/{userId}',
                    templateUrl: 'views/compteUser.html',
                    controller: 'CompteUserCtrl'
                })
                .state('project', {
                    url: '/project/{projectId}',
                    templateUrl: 'views/project.html',
                    controller: 'ProjectCtrl'
                });
            }])
    .run(['$rootScope', 'TokenService',
            function ($rootScope, TokenService) {
            $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {

                    if (TokenService.getToken() && $rootScope.actualizeHeader) {
                        $rootScope.actualizeHeader();
                    }
                    if(!TokenService.getToken() && $rootScope.isConnected){
                        $rootScope.actualizeHeader();                        
                    }

                })
    }]);