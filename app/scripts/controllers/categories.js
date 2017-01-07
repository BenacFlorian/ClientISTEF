/**
 * @ngdoc function
 * @name clientApp.controller:CategoriesCtrl
 * @description
 * # CategoriesCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('CategoriesCtrl', ['$scope', '$state', 'DataService', '$q',
      function ($scope, $state, DataService, $q) {

                $scope.init = init;
                $scope.goToCategorieProjets = goToCategorieProjets;

                $scope.init();

                // -------------------------------------------------

                function init() {
                    DataService.getCategories()
                        .then(function (categories) {
                            var tabPromise = [],
                                size = categories.length;
                            for (var i = 0; i < size; i++) {
                                tabPromise.push(DataService.getCategorieProjectCount(categories[i].id));
                            }
                            $q.all(tabPromise)
                                .then(function (categoriesProjectCount) {
                                    var tabCategorie = [],
                                        size = categories.length;
                                    for (var i = 0; i < size; i++) {
                                        tabCategorie.push({
                                            label: categories[i].label,
                                            id: categories[i].id,
                                            color: categories[i].color,
                                            count: categoriesProjectCount[i].count,
                                            urlPicture: apiServer + "/api/containers/categorie/download/" + categories[i].label.replace(/ /g, "") + ".jpg"
                                        });
                                    }
                                    $scope.categories = tabCategorie;
                                })
                        })
                }


                // PUBLIC
                // ----------------------------------------------------------------------------
                function goToCategorieProjets(categorieId) {
                    $state.go('categoriesProjects', {
                        categorieId: categorieId
                    });
                }

                // PRIVATE
                // ----------------------------------------------------------------------------
      }]);
}());