(function () {
    'use strict';

    angular.module('clientApp')
        .factory('UserService', ['$http', '$window', '$q', 'TokenService',
            function ($http, $window, $q, TokenService) {

                // ---------------------------------------------------------------------------
                // PUBLIC API.
                // ---------------------------------------------------------------------------
                return ({
                    setTypeUser: setTypeUser,
                    getTypeUser: getTypeUser,
                    removeTypeUser: removeTypeUser,
                    setIdUser: setIdUser,
                    getIdUser: getIdUser,
                    removeIdUser: removeIdUser,
                    logout: logout,
                    login: login
                });


                // ---------------------------------------------------------------------------
                // PUBLIC METHODS.
                // ---------------------------------------------------------------------------
                function setTypeUser(typeUser) {
                    $window.sessionStorage.typeUser = typeUser;
                }

                function getTypeUser() {
                    return $window.sessionStorage.typeUser;
                }

                function removeTypeUser() {
                    delete $window.sessionStorage.typeUser;
                }

                function setIdUser(idUser) {
                    $window.sessionStorage.idUser = idUser;
                }

                function getIdUser() {
                    return $window.sessionStorage.idUser;
                }

                function removeIdUser() {
                    delete $window.sessionStorage.idUser;
                }

                function login(credentials) {
                    var request = $http.post(apiServer + '/api/CompteUsers/SeConnecter', credentials);
                    return request.then(handleSuccess, handleError);
                }

                function logout(id) {
                    removeIdUser();
                    var typeUser = getTypeUser();
                    removeTypeUser();
                    if (typeUser == "Contributeur") {
                        var request = $http.post(apiServer + '/api/CompteContributeurs/logout');
                        return request.then(handleSuccess, handleError);
                    } else {
                        var request = $http.post(apiServer + '/api/CompteProposeurs/logout');
                        return request.then(handleSuccess, handleError);
                    }
                }
                // ---------------------------------------------------------------------------
                // PRIVATE METHODS.
                // ---------------------------------------------------------------------------

                function handleSuccess(response) {
                    return response.data;
                }

                function handleError(response) {
                    if (response.data == '' ||
                        !angular.isDefined(response.status) ||
                        response.statusText == '') {

                        return ($q.reject("An unknown error occurred."));
                    }

                    // Otherwise, use expected error message.
                    return ($q.reject('Error ' + response.status + ' (' + response.statusText + '): ' + response.data));
                }
            }
        ]);
})();