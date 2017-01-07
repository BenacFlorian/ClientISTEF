(function () {
    'use strict';

    angular.module('clientApp')
        .factory('FileService', ['$http', '$q',
            function ($http, $q) {

                // ---------------------------------------------------------------------------
                // PUBLIC API.
                // ---------------------------------------------------------------------------
                return ({
                    // real data webservices
                    addProjectPicture: addProjectPicture,
                    removeProjectPicture: removeProjectPicture,
                    createContainerForFile: createContainerForFile,
                    getContainers: getContainers,
                    uploadFileToUrl: uploadFileToUrl,
                    deleteFile: deleteFile,
                    getFiles: getFiles,
                    deleteContainer: deleteContainer,
                    downloadFile: downloadFile
                });


                // ---------------------------------------------------------------------------
                // PUBLIC METHODS.
                // ---------------------------------------------------------------------------
                function uploadFileToUrl(file, uploadUrl, name) {
                    var fd = new FormData();
                    if (name) {
                        fd.append('file', file, name);
                    } else {
                        fd.append('file', file);
                    }
                    var request = $http.post(uploadUrl, fd, {
                        transformRequest: angular.identity,
                        headers: {
                            'Content-Type': undefined
                        }
                    });
                    return request.then(handleSuccess, handleError);
                }

                function addProjectPicture(data) {
                    var request = $http.post(apiServer + '/api/Photos', data);
                    return request.then(handleSuccess, handleError);
                }

                //Container for image
                function createContainerForFile(containerData) {
                    var request = $http.post(apiServer + '/api/containers', containerData);
                    return request.then(handleSuccess, handleError);
                }

                function getContainers() {
                    var request = $http.get(apiServer + '/api/containers');
                    return request.then(handleSuccess, handleError);
                }

                function deleteFile(containerId, nameFile) {
                    var request = $http.delete(apiServer + '/api/containers/' + containerId + '/files/' + nameFile);
                    return request.then(handleSuccess, handleError);
                }

                function getFiles(containerId) {
                    var request = $http.get(apiServer + '/api/containers/' + containerId + '/files/');
                    return request.then(handleSuccess, handleError);
                }

                function deleteContainer(containerId) {
                    var request = $http.delete(apiServer + '/api/containers/' + containerId);
                    return request.then(handleSuccess, handleError);
                }

                function removeProjectPicture(photoId) {
                    var request = $http.delete(apiServer + '/api/Photos/' + photoId);
                    return request.then(handleSuccess, handleError);
                }

                function downloadFile(containerId, fileName) {
                    var request = $http.get(apiServer + '/api/containers/' + containerId + '/download/' + fileName);
                    return request.then(handleSuccess, handleError);
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