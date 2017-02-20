(function () {
    'use strict';

    angular.module('clientApp')
        .factory('DataService', ['$http', '$q',
            function ($http, $q) {

                // ---------------------------------------------------------------------------
                // PUBLIC API.
                // ---------------------------------------------------------------------------
                return ({
                    // real data webservices
                    getProject: getProject,
                    getProjectFrontPage: getProjectFrontPage,
                    getStatistique: getStatistique,
                    getCompteUser: getCompteUser,
                    getCategorieWithProject: getCategorieWithProject,
                    getCategorieProjectCount: getCategorieProjectCount,
                    getUser: getUser,
                    getUserCategoriePreferees: getUserCategoriePreferees,
                    getContributeur: getContributeur,
                    updateCompteContributeur: updateCompteContributeur,
                    updateCompteProposeur: updateCompteProposeur,
                    archiveProject: archiveProject,
                    getContributionWithProjectsOfUser: getContributionWithProjectsOfUser,
                    createTransaction: createTransaction,
                    getProjectOfUser: getProjectOfUser,
                    getProjectArchive: getProjectArchive,
                    addProject: addProject,
                    getProposeur: getProposeur,
                    getCategories: getCategories,
                    updateCategorie: updateCategorie,
                    addLinkCategorieContributeur: addLinkCategorieContributeur,
                    deleteUser: deleteUser,
                    createTagFromProject: createTagFromProject,
                    updateProject: updateProject,
                    createContributeur: createContributeur,
                    archiveContributeur: archiveContributeur,
                    archiveProposeur: archiveProposeur,
                    deleteContrepartie: deleteContrepartie,
                    deleteTag: deleteTag,
                    createProposeur: createProposeur,
                    deleteRelCategorieUser: deleteRelCategorieUser,
                    createContrepartie: createContrepartie,
                    getProjectTypehead: getProjectTypehead,
                    getUsers: getUsers,
                    searchProjet: searchProjet
                });

                // ---------------------------------------------------------------------------
                // PUBLIC METHODS.
                // ---------------------------------------------------------------------------

                function updateProject(id, data) {
                    var request = $http.put(apiServer + '/api/Projets/' + id, data);
                    return request.then(handleSuccess, handleError);
                }

                function getProjectFrontPage() {
                    var request = $http.get(apiServer + '/api/Projets?filter={"where":{"estMisEnAvant":true}}');
                    return request.then(handleSuccess, handleError);
                }

                function getUsers() {
                    var request = $http.post(apiServer + '/api/CompteUsers/getUsers');
                    return request.then(handleSuccess, handleError);
                }

                function deleteUser(userId, typeUser) {
                    var request = $http.put(apiServer + '/api/Compte'+typeUser+"s/"+userId,{
                        estCompteActif: false
                    });
                    return request.then(handleSuccess, handleError);
                }

                function getStatistique(userId) {
                    var request = $http.post(apiServer + '/api/CompteProposeurs/getStatistiques', {
                        userId: userId
                    });
                    return request.then(handleSuccess, handleError);
                }

                function getCompteUser(userId) {
                    var request = $http.get(apiServer + '/api/CompteUser' + userId);
                    return request.then(handleSuccess, handleError);
                }

                function getProject(projectId) {
                    var request = $http.get(apiServer + '/api/Projets/' + projectId + '?filter={"include":[{"relation":"compteProposeur"},{"relation":"contreparties"},{"relation":"photos"},{"relation":"tags"},{"relation":"categorie"}]}');
                    return request.then(handleSuccess, handleError);
                }

                function getCategorieWithProject(categorieId) {
                    var request = $http.get(apiServer + '/api/Categories/' + categorieId + '?filter={"include":{"relation":"projets","scope":{"include":{"relation":"compteProposeur"}}}}');
                    return request.then(handleSuccess, handleError);
                }

                function getCategories() {
                    var request = $http.get(apiServer + '/api/Categories');
                    return request.then(handleSuccess, handleError);
                }

                function updateCategorie(id, categorie) {
                    var request = $http.put(apiServer + '/api/Projets/'+id,{
                        categorieId : categorie.id
                    });
                    return request.then(handleSuccess, handleError);
                }

                function addLinkCategorieContributeur(user, categorie) {
                    var request = $http.put(apiServer + '/api/CompteContributeurs/'+user.id+'/categoriesPreferees/rel/'+categorie.id);
                    return request.then(handleSuccess, handleError);
                }

                function getCategorieProjectCount(categorieId) {
                    var request = $http.get(apiServer + '/api/Categories/' + categorieId + '/projets/count?filter={"where":{"estArchive":"false"}}');
                    return request.then(handleSuccess, handleError);
                }

                function getProposeur(proposeurId) {
                    var request = $http.get(apiServer + '/api/CompteProposeurs/' + proposeurId);
                    return request.then(handleSuccess, handleError);
                }

                function addProject(data) {
                    var request = $http.post(apiServer + '/api/Projets', data);
                    return request.then(handleSuccess, handleError);
                }

                function createContrepartie(data) {
                    var request = $http.post(apiServer + '/api/Contreparties', data);
                    return request.then(handleSuccess, handleError);
                }

                function createTagFromProject(projectId, data) {
                    var request = $http.post(apiServer + '/api/Projets/' + projectId + '/tags', data);
                    return request.then(handleSuccess, handleError);
                }

                function createContributeur(data) {
                    var request = $http.post(apiServer + '/api/CompteContributeurs', data);
                    return request.then(handleSuccess, handleError);
                }

                function createProposeur(data) {
                    var request = $http.post(apiServer + '/api/CompteProposeurs', data);
                    return request.then(handleSuccess, handleError);
                }

                function deleteRelCategorieUser(user, categorie) {
                    var request = $http.delete(apiServer + '/api/CompteContributeurs/'+user.id+'/categoriesPreferees/rel/'+categorie.id);
                    return request.then(handleSuccess, handleError);
                }

                function getUser(userId, typeUser) {
                    var request = $http.post(apiServer + '/api/CompteUsers/getUser', userId, typeUser);
                    return request.then(handleSuccess, handleError);
                }

                function getUserCategoriePreferees(userId, typeUser) {
                    var request = $http.get(apiServer + '/api/CompteContributeurs/'+userId+'/categoriesPreferees');
                    return request.then(handleSuccess, handleError);
                }

                function getContributeur(userId) {
                    var request = $http.get(apiServer + '/api/CompteContributeurs/' + userId);
                    return request.then(handleSuccess, handleError);
                }

                function updateCompteContributeur(user) {
                    var request = $http.put(apiServer + '/api/CompteContributeurs/' + user.id, user);
                    return request.then(handleSuccess, handleError);
                }

                function archiveContributeur(userId, data) {
                    var request = $http.put(apiServer + '/api/CompteContributeurs/' + userId, data);
                    return request.then(handleSuccess, handleError);
                }

                function archiveProposeur(userId, data) {
                    var request = $http.put(apiServer + '/api/CompteProposeurs/' + userId, data);
                    return request.then(handleSuccess, handleError);
                }

                function deleteContrepartie(contrepartieId) {
                    var request = $http.delete(apiServer + '/api/Contreparties/' + contrepartieId);
                    return request.then(handleSuccess, handleError);
                }

                function deleteTag(tagId) {
                    var request = $http.delete(apiServer + '/api/Tags/' + tagId);
                    return request.then(handleSuccess, handleError);
                }

                function updateCompteProposeur(user) {
                    var request = $http.put(apiServer + '/api/CompteProposeurs/' + user.id, user);
                    return request.then(handleSuccess, handleError);
                }

                function archiveProject(projectId) {
                    var request = $http.put(apiServer + '/api/Projets/' + projectId, {
                        estArchive: true, 
                        dateArchivage: new Date()
                    });
                    return request.then(handleSuccess, handleError);
                }

                function getProjectTypehead() {
                    var request = $http.get(apiServer + '/api/Projets?filter={"fields":{"id":"true","titre":"true","dateExpiration":"true","estArchive":"true"}}');
                    return request.then(handleSuccess, handleError);
                }

                function searchProjet(searchValue) {
                    var request = $http.post(apiServer + '/api/Projets/search', {
                        searchValue: searchValue
                    });
                    return request.then(handleSuccess, handleError);
                }

                function getContributionWithProjectsOfUser(userId) {
                    var request = $http.get(apiServer + '/api/CompteContributeurs/' + userId + '?filter={"include":{"relation":"contributions","scope":{"include":{"relation":"projet"}}}}');
                    return request.then(handleSuccess, handleError);
                }

                function createTransaction(projectId, value, contributeurId) {
                    var request = $http.post(apiServer + '/api/Transactions', {
                        "somme": value,
                        "projetId": projectId,
                        "compteContributeurId": contributeurId,
                        "date": new Date()
                    });
                    return request.then(handleSuccess, handleError);
                }

                function getProjectOfUser(userId) {
                    var request = $http.get(apiServer + '/api/Projets?filter={"where":{"and":[{"estArchive":"false"},{"compteProposeurId":' + userId + '}]}}');
                    return request.then(handleSuccess, handleError);
                }

                function getProjectArchive() {
                    var request = $http.get(apiServer + '/api/Projets?filter={"where":{"estArchive":"true"}}');
                    return request.then(handleSuccess, handleError);
                }

                // ---------------------------------------------------------------------------
                // PRIVATE METHODS.
                // ---------------------------------------------------------------------------

                // complete to implement the use case "avoir des suggestions de projet"
                function createOrlinkTags(data, projectId) {
                    return getTagsWithSameLabel(data.label)
                        .then(function (tags) {
                            var size = tags.length,
                                tabOfPromise = [];
                            if (size > 0) {
                                for (var i = 0; i < size; i++) {
                                    tabOfPromise.push(linkProjectToTag(projectId, tags[i].id));
                                }
                                return $q.all(tabOfPromise);
                            } else {
                                return createTagFromProject(projectId, data);
                            }
                        });
                }

                function getTagsWithSameLabel(label) {
                    var request = $http.post(apiServer + '/api/Tags?filter={"where":{"label":' + label + '}}');
                    return request.then(handleSuccess, handleError);
                }

                function linkProjectToTag(projectId, tagId) {
                    var request = $http.post(apiServer + '/api/Tags?filter={"where":{"label":' + label + '}}');
                    return request.then(handleSuccess, handleError);
                }

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