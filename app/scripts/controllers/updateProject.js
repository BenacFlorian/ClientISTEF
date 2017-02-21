/**
 * @ngdoc function
 * @name clientApp.controller:AddProjectCtrl
 * @description
 * # AddProjectCtrl
 * Controller of the clientApp
 */
(function () {
    'use strict';

    angular.module('clientApp')
        .controller('UpdateProjectCtrl', ['$scope', '$state', 'DataService', 'FileService', '$q', 'alertify', 'UserService', '$stateParams',
      function ($scope, $state, DataService, FileService, $q, alertify, UserService, $stateParams) {

                $scope.init = init;
                $scope.addContrepartie = addContrepartie;
                $scope.deleteContrepartie = deleteContrepartie;
                $scope.uploadImage = uploadImage;
                $scope.addTag = addTag;
                $scope.deleteTag = deleteTag;
                $scope.removePicture = removePicture;
                $scope.definePrincipalPicture = definePrincipalPicture;
                $scope.updateProject = updateProject;

                $scope.tagList = [];
                $scope.tagListNew = [];
                $scope.contrepartieList = [];
                $scope.contrepartieListNew = [];
                $scope.dates = {};
                $scope.imgList = [];
                $scope.imgFileList = [];

                $scope.init();

                // variable globale
                var projectG;

                // -------------------------------------------------

                function init() {

                    initDatePicker();

                    // trick to avoid the error of startDate, dateExpiration redefined after
                    $scope.project = {
                        dateExpiration: new Date()
                    };

                    DataService.getCategories()
                        .then(function (categories) {

                            $scope.categorieData = {
                                categories: categories,
                                categorieSelected: undefined
                            };

                            DataService.getProject($stateParams.projectId)
                                .then(function (project) {

                                    $scope.tempIdProject = "Update-" + project.id;
                                    $scope.contrepartieList = project.contreparties;

                                    $scope.tagList = project.tags;
                                    project.dateExpiration = moment(project.dateExpiration);
                                    $scope.project = project;

                                    var imgList = getImgListUrl(project),
                                        testImgPrincipal = _.find(imgList, function (value) {
                                            return value.url == project.urlPhotoPrincipal;
                                        });

                                    if (!testImgPrincipal) {
                                        imgList.push(project.urlPhotoPrincipal);
                                    }

                                    var size = imgList.length,
                                        imageList = [];

                                    for (var i = 0; i < size; i++) {
                                        if (imgList[i].url == project.urlPhotoPrincipal) {
                                            imageList.push({
                                                name: imgList[i].name,
                                                url: imgList[i].url,
                                                backgroundColor: "#5ebb61",
                                                principal: true
                                            });
                                        } else {
                                            imageList.push({
                                                name: imgList[i].name,
                                                url: imgList[i].url,
                                                backgroundColor: "#fff",
                                                principal: false
                                            });
                                        }
                                    }
                                    $scope.imgList = imageList;

                                    var categorieIndex = _.findIndex(categories, function (categorie) {
                                        return categorie.id == project.categorieId;
                                    });
                                    if (categorieIndex != -1) {
                                        $scope.categorieData.categorieSelected = categories[categorieIndex];
                                    }
                                });
                        });
                }

                // PUBLIC
                // ----------------------------------------------------------------------------
                function updateProject() {
                    var validProject = projectValid();
                    if (validProject.valid) {
                        var data = {
                            "titre": $scope.project.titre,
                            "description": $scope.project.description,
                            "dateExpiration": $scope.project.dateExpiration,
                            "objectifFinancier": $scope.project.objectifFinancier,
                            "urlVideo": $scope.project.urlVideo,
                            "categorieId": $scope.categorieData.categorieSelected.id,
                            "compteProposeurId": UserService.getIdUser(),
                            "urlPhotoPrincipal": apiServer + "/api/containers/" + $scope.project.id + "/download/" + getNamePicturePrincipal($scope.imgList)
                        };
                        // update project
                        DataService.updateProject($scope.project.id, data)
                            .then(function (project) {
                                // delete old file which is deleted of list on real container
                                var listToDelete = getListPhotoToDelete(),
                                    tabOfPromise = [],
                                    size = listToDelete.length;

                                for (var i = 0; i < size; i++) {
                                    tabOfPromise.push(FileService.deleteFile($scope.project.id, listToDelete[i].name));
                                    tabOfPromise.push(FileService.removeProjectPicture(listToDelete[i].id));
                                }

                                return $q.all(tabOfPromise);
                            })
                            .then(function () {
                                // add new file which is added in list
                                var size = $scope.imgFileList.length,
                                    tabOfPromise = [];

                                // upload img in the right container
                                for (var i = 0; i < size; i++) {
                                    var uploadUrl = apiServer + "/api/containers/" + $scope.project.id + "/upload";
                                    tabOfPromise.push(FileService.uploadFileToUrl($scope.imgFileList[i], uploadUrl));
                                    tabOfPromise.push(FileService.addProjectPicture({
                                        "name": $scope.imgFileList[i].name,
                                        "projetId": $scope.project.id
                                    }));
                                }
                                return $q.all(tabOfPromise);
                            })
                            .then(function () {
                                // delete old contrepartie which is deleted of list
                                var listToDelete = getListContrepartieToDelete(),
                                    tabOfPromise = [],
                                    size = listToDelete.length;

                                for (var i = 0; i < size; i++) {
                                    tabOfPromise.push(DataService.deleteContrepartie(listToDelete[i].id));
                                }

                                return $q.all(tabOfPromise);
                            })
                            .then(function () {
                                // create contrepartie
                                var size = $scope.contrepartieListNew.length,
                                    tabOfPromise = [];
                                for (var i = 0; i < size; i++) {
                                    $scope.contrepartieListNew[i].projetId = $scope.project.id;
                                    tabOfPromise.push(DataService.createContrepartie($scope.contrepartieListNew[i]));
                                }
                                return $q.all(tabOfPromise);
                            })
                            .then(function () {
                                // delete old tag which is deleted of list
                                var listToDelete = getListTagsToDelete(),
                                    tabOfPromise = [],
                                    size = listToDelete.length;

                                for (var i = 0; i < size; i++) {
                                    tabOfPromise.push(DataService.deleteTag(listToDelete[i].id));
                                }

                                return $q.all(tabOfPromise);
                            })
                            .then(function (contrepartieTab) {
                                // create tag
                                var size = $scope.tagListNew.length,
                                    tabOfPromise = [];
                                for (var i = 0; i < size; i++) {
                                    tabOfPromise.push(DataService.createTagFromProject($scope.project.id, {
                                        "label": $scope.tagListNew[i]
                                    }));
                                }
                                return $q.all(tabOfPromise);
                            })
                            .then(function (data) {
                                alertify.success("Projet actualiser avec succéss");
                                console.log('Projet crée');
                                $state.go('project', {
                                    projectId: $scope.project.id
                                });
                            })
                            .catch(function (err) {
                                console.log('[ERROR]: ', err);
                            })
                    } else {
                        alertify.error(validProject.err);
                    }
                }

                function removePicture(img) {
                    var index = _.findIndex($scope.imgList, function (imgCurrent) {
                        return img.name == imgCurrent.name;
                    });
                    if (index != -1) {
                        $scope.imgList = _.without($scope.imgList, img);
                    }
                }

                function definePrincipalPicture(img) {
                    var index = _.findIndex($scope.imgList, function (imgCurrent) {
                        return img.name == imgCurrent.name;
                    });
                    if (index != -1) {
                        var size = $scope.imgList.length;
                        for (var i = 0; i < size; i++) {
                            $scope.imgList[i].backgroundColor = "#fff";
                            $scope.imgList[i].principal = false;
                        }
                        $scope.imgList[index].backgroundColor = "#5ebb61";
                        $scope.imgList[index].principal = true;
                    }
                }

                function uploadImage() {
                    FileService.getContainers()
                        .then(function (containers) {
                            var containerFound = containerExist($scope.tempIdProject, containers);
                            if (containerFound) {

                                var tabOfPromise = [FileService.getFiles($scope.project.id), FileService.getFiles($scope.tempIdProject)];

                                $q.all(tabOfPromise)
                                    .then(function (tabOfFiles) {
                                        var fileExisted = fileExist($scope.file.name, tabOfFiles);
                                        if (fileExisted) {
                                            alertify.error("Une image avec ce nom existe déjà, veuillez changer le nom et recommencer");
                                        } else {
                                            // upload new file and display it
                                            manageUpload();
                                        }
                                    });

                            } else {
                                // create a container for this project
                                FileService.createContainerForFile({
                                        "name": $scope.tempIdProject
                                    })
                                    .then(function (data) {
                                        // upload new file and display it
                                        manageUpload();
                                    })
                                    .catch(errorUploadImageOrData);
                            }
                        });
                }

                function addTag() {
                    var tagValue = $scope.tagAdded;
                    $scope.tagAdded = "";
                    var testValue = _.find($scope.tagList, function (tag) {
                        return tag == tagValue;
                    });
                    if (!testValue) {
                        $scope.tagList.push({
                            label: tagValue
                        });
                        $scope.tagListNew.push({
                            label: tagValue
                        });
                    } else {
                        alertify.error("Vous ne pouvez pas ajouter 2 fois le même tag");
                    }
                }

                function deleteTag(tag) {
                    $scope.tagList = _.filter($scope.tagList, function (elem) {
                        return elem != tag;
                    });
                    $scope.tagListNew = _.filter($scope.tagListNew, function (elem) {
                        return elem != tag;
                    });
                }

                function deleteContrepartie(contrepartieRemove) {
                    $scope.contrepartieList = _.filter($scope.contrepartieList, function (contrepartie) {
                        return contrepartie.palier != contrepartieRemove.palier && contrepartie.value != contrepartieRemove.value;
                    });
                    $scope.contrepartieListNew = _.filter($scope.contrepartieListNew, function (contrepartie) {
                        return contrepartie.palier != contrepartieRemove.palier && contrepartie.value != contrepartieRemove.value;
                    });
                }

                function addContrepartie() {
                    var palier = $scope.palier,
                        value = $scope.contrepartieValue;
                    $scope.palier = null;
                    $scope.contrepartieValue = "";
                    var testPalier = _.find($scope.contrepartieList, function (contrepartie) {
                            return contrepartie.palier == palier;
                        }),
                        testValue = _.find($scope.contrepartieList, function (contrepartie) {
                            return contrepartie.value == value;
                        });
                    if (!testPalier && !testValue && palier > 0) {
                        $scope.contrepartieList.push({
                            palier: palier,
                            value: value
                        });
                        // to know which contrepartie is added for real
                        $scope.contrepartieListNew.push({
                            palier: palier,
                            value: value
                        });
                    } else {
                        if (palier <= 0) {
                            alertify.error("Le palier dois être un nombre positif");
                        } else {
                            alertify.error("Vous ne pouvez ajouter 2 fois le même palier ou la même contrepartie");
                        }
                    }
                }

                // PRIVATE
                // ----------------------------------------------------------------------------
                function getListPhotoToDelete() {
                    var oldList = $scope.project.photos,
                        newList = $scope.imgList,
                        sizeOld = oldList.length,
                        oldToDelete = [];
                    for (var j = 0; j < sizeOld; j++) {
                        var oldElement = oldList[j],
                            find = _.find(newList, function (newElement) {
                                return oldElement.name == newElement.name;
                            });
                        if (!find) {
                            oldToDelete.push(oldElement);
                        }
                    }
                    return oldToDelete;
                }

                function getListTagsToDelete() {
                    var oldList = $scope.project.tags,
                        newList = $scope.tagList,
                        sizeOld = oldList.length,
                        oldToDelete = [];
                    for (var j = 0; j < sizeOld; j++) {
                        var oldElement = oldList[j],
                            find = _.find(newList, function (newElement) {
                                return oldElement.label == newElement.label;
                            });
                        if (!find) {
                            oldToDelete.push(oldElement);
                        }
                    }
                    return oldToDelete;
                }

                function getListContrepartieToDelete() {
                    var oldList = $scope.project.contreparties,
                        newList = $scope.contrepartieList,
                        sizeOld = oldList.length,
                        oldToDelete = [];
                    for (var j = 0; j < sizeOld; j++) {
                        var oldElement = oldList[j],
                            find = _.find(newList, function (newElement) {
                                return oldElement.palier == newElement.palier && oldElement.contrepartie == newElement.contrepartie;
                            });
                        if (!find) {
                            oldToDelete.push(oldElement);
                        }
                    }
                    return oldToDelete;
                }

                function getImgListUrl(project) {
                    var listImg = [],
                        photos = project.photos,
                        size = photos.length;
                    for (var i = 0; i < size; i++) {
                        var url = apiServer + "/api/containers/" + project.id + "/download/" + photos[i].name;
                        listImg.push({
                            url: url,
                            name: photos[i].name
                        });
                    }
                    return listImg;
                }

                function projectValid() {

                    /*
                        REGLE POUR VALIDER LE PROJET :
                            - au moins une image, 
                            - une categorie,
                            - un titre, 
                            - au moins une contrepartie
                            - une description
                            - une photo principal
                    */

                    // titre check  
                    if (!$scope.project.titre || $scope.project.titre == "") {
                        return {
                            err: "Veuillez renseigner un titre",
                            valid: false
                        };
                    }
                    // description check
                    if (!$scope.project.description || $scope.project.description == "") {
                        return {
                            err: "Veuillez renseigner une description",
                            valid: false
                        };
                    }
                    // expirationDate check
                    var now = moment(new Date());
                    if ($scope.project.dateExpiration.isBefore(now)) {
                        return {
                            err: "Veuillez renseigner une date d'expiration ultérieur à la date d'aujourd'hui",
                            valid: false
                        };
                    }
                    // objectifFinancier check
                    var target = parseInt($scope.project.objectifFinancier);
                    if (target <= 0) {
                        return {
                            err: "Veuillez renseigner un objectif financier positif",
                            valid: false
                        };
                    }
                    if (isNaN(target)) {
                        return {
                            err: "L'objectif financier doit être un nombre",
                            valid: false
                        };
                    }
                    if (!$scope.categorieData.categorieSelected) {
                        return {
                            err: "Veuillez choisir une catégorie",
                            valid: false
                        };
                    }
                    // photo check
                    if ($scope.imgList.length == 0) {
                        return {
                            err: "Veuillez renseigner au moins une photo",
                            valid: false
                        };
                    }
                    // photo principal check
                    var photoPrincipalValid = false,
                        size = $scope.imgList.length;
                    for (var i = 0; i < size; i++) {
                        if ($scope.imgList[i].principal) {
                            photoPrincipalValid = true;
                        }
                    }
                    if (!photoPrincipalValid) {
                        return {
                            err: "Veuillez renseigner la photo principale",
                            valid: false
                        };
                    }
                    if ($scope.contrepartieList.length == 0) {
                        return {
                            err: "Veuillez renseigner au moins une contrepartie",
                            valid: false
                        };
                    }
                    return {
                        err: "OK",
                        valid: true
                    };
                }

                function getNamePicturePrincipal(imgList) {
                    var principal = _.find(imgList, function (img) {
                        return img.principal;
                    });
                    if (principal) {
                        return principal.name;
                    } else {
                        return "";
                    }
                }

                function containerExist(containerName, containerList) {
                    var containerFound = false,
                        size = containerList.length;
                    for (var i = 0; i < size; i++) {
                        // check if containers exist
                        if (containerList[i].name == containerName) {
                            containerFound = true;
                        }
                    }
                    return containerFound;
                }

                function fileExist(fileName, tabOfFileList) {
                    var fileFound = false,
                        sizeContainer = tabOfFileList.length;
                    for (var i = 0; i < sizeContainer; i++) {
                        var size = tabOfFileList[i].length;
                        for (var j = 0; j < size; j++) {
                            // check if containers exist
                            if (tabOfFileList[i][j].name == fileName) {
                                fileFound = true;
                            }
                        }
                    }
                    return fileFound;
                }

                //UPLOAD IMAGE -------------------------------------

                function manageUpload() {

                    var img = $scope.file,
                        uploadUrl = apiServer + "/api/containers/" + $scope.tempIdProject + "/upload";

                    $scope.imgFileList.push($scope.file);
                    FileService.uploadFileToUrl(img, uploadUrl)
                        .then(function (res) {
                            $scope.imgList.push({
                                name: $scope.file.name,
                                url: apiServer + "/api/containers/" + $scope.tempIdProject + "/download/" + $scope.file.name,
                                backgroundColor: "#fff",
                                principal: false
                            });
                            $scope.file = undefined;
                            $('#pictureAddedProject').wrap('<form>').closest('form').get(0).reset();
                            $('#pictureAddedProject').unwrap();
                            alertify.success('Image téléchargé avec succés');
                        })
                        .catch(errorUploadImageOrData);
                }

                function initDatePicker() {

                    var locale = {
                        applyLabel: "Ok",
                        cancelLabel: 'Annuler',
                        fromLabel: "Début",
                        toLabel: "Fin",
                        firstDay: 0,
                        format: 'DD/MM/YYYY'
                    };

                    $scope.dpkOptions = {
                        singleDatePicker: true,
                        locale: locale
                    };
                }

                function errorUploadImageOrData(err) {
                    alertify.error('Erreur lors de l\'enregistrement des données');
                    console.log('ERROR: ' + err);
                }

            }]);
}());