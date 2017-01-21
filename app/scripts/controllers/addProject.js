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
        .controller('AddProjectCtrl', ['$scope', '$state', 'DataService', 'FileService', '$q', 'alertify', 'UserService',
      function ($scope, $state, DataService, FileService, $q, alertify, UserService) {

                $scope.init = init;
                $scope.addContrepartie = addContrepartie;
                $scope.deleteContrepartie = deleteContrepartie;
                $scope.uploadImage = uploadImage;
                $scope.addTag = addTag;
                $scope.deleteTag = deleteTag;
                $scope.removePicture = removePicture;
                $scope.definePrincipalPicture = definePrincipalPicture;
                $scope.addProject = addProject;

                $scope.tagList = [];
                $scope.contrepartieList = [];
                $scope.dates = {};
                $scope.imgList = [];
                $scope.imgFileList = [];

                $scope.projectForm = {
                    titre: "",
                    description: "",
                    expirationDate: moment(new Date()).add('1', 'month'),
                    objectifFinancier: null,
                    urlVideo: ""
                };

                $scope.init();

                // variable globale
                var projectG;

                // -------------------------------------------------

                function init() {

                    $scope.tempIdProject = createGuid();

                    initDatePicker();

                    DataService.getCategories()
                        .then(function (categories) {
                            $scope.categorieData = {
                                categories: categories,
                                categorieSelected: undefined
                            }
                        });
                }

                // PUBLIC
                // ----------------------------------------------------------------------------
                function addProject() {

                    var validProject = projectValid();
                    if (validProject.valid) {
                        var data = {
                            "titre": $scope.projectForm.titre,
                            "description": $scope.projectForm.description,
                            "dateCreation": new Date(),
                            "dateExpiration": $scope.projectForm.expirationDate,
                            "objectifFinancier": $scope.projectForm.objectifFinancier,
                            "sommeRecoltee": 0,
                            "estArchive": false,
                            "estMisEnAvant": false,
                            "urlVideo": $scope.projectForm.urlVideo,
                            "categorieId": $scope.categorieData.categorieSelected.id,
                            "compteProposeurId": UserService.getIdUser()
                        };
                        // add project
                        DataService.addProject(data)
                            .then(function (project) {

                                projectG = project;
                                // update project for urlPhotoPrincipal
                                return DataService.updateProject(project.id, {
                                    "urlPhotoPrincipal": apiServer + "/api/containers/" + project.id + "/download/" + getNamePicturePrincipal($scope.imgList)
                                });
                            })
                            .then(function () {
                                // get list of name of file
                                return FileService.getFiles($scope.tempIdProject);
                            })
                            .then(function (files) {
                                if (files.length != $scope.imgFileList.length) {
                                    console.log('[WARNING] Size different for files list and img list');
                                }
                                // create container and all file in it
                                return FileService.createContainerForFile({
                                    "name": JSON.stringify(projectG.id)
                                });
                            })
                            .then(function (container) {
                                var size = $scope.imgFileList.length,
                                    tabOfPromise = [];

                                // upload img in the right container
                                for (var i = 0; i < size; i++) {
                                    var uploadUrl = apiServer + "/api/containers/" + projectG.id + "/upload";
                                    tabOfPromise.push(FileService.uploadFileToUrl($scope.imgFileList[i], uploadUrl));
                                    tabOfPromise.push(FileService.addProjectPicture({
                                        "name": $scope.imgFileList[i].name,
                                        "projetId": projectG.id
                                    }));
                                }
                                return $q.all(tabOfPromise);
                            })
                            .then(function (imgCreated) {
                                // create contrepartie
                                var size = $scope.contrepartieList.length,
                                    tabOfPromise = [];
                                for (var i = 0; i < size; i++) {
                                    $scope.contrepartieList[i].projetId = projectG.id;
                                    tabOfPromise.push(DataService.createContrepartie($scope.contrepartieList[i]));
                                }
                                return $q.all(tabOfPromise);
                            })
                            .then(function (contrepartieTab) {
                                // create tag
                                var size = $scope.tagList.length,
                                    tabOfPromise = [];
                                for (var i = 0; i < size; i++) {
                                    tabOfPromise.push(DataService.createTagFromProject(projectG.id, {
                                        "label": $scope.tagList[i]
                                    }));
                                }
                                return $q.all(tabOfPromise);
                            })
                            .then(function () {
                                // delete temp container 
                                return FileService.deleteContainer($scope.tempIdProject);
                            })
                            .then(function (data) {
                                alertify.success("Projet crée avec succéss");
                                console.log('Projet crée');
                                $state.go('home');
                            })
                            .catch(function (err) {
                                alertify.error("Il y eu un problème lors de la création de votre projet, veuillez réessayer plus tard")
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
                        FileService.deleteFile($scope.tempIdProject, img.name);
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
                                FileService.getFiles($scope.tempIdProject)
                                    .then(function (files) {
                                        var fileExisted = fileExist($scope.file.name, files);
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
                        $scope.tagList.push(tagValue);
                    } else {
                        alertify.error("Vous ne pouvez pas ajouter 2 fois le même tag");
                    }
                }

                function deleteTag(tag) {
                    $scope.tagList = _.filter($scope.tagList, function (elem) {
                        return elem != tag;
                    });
                }

                function deleteContrepartie(contrepartieRemove) {
                    $scope.contrepartieList = _.filter($scope.contrepartieList, function (contrepartie) {
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
                        })
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
                    if (!$scope.projectForm.titre || $scope.projectForm.titre == "") {
                        return {
                            err: "Veuillez renseigner un titre",
                            valid: false
                        };
                    }
                    // description check
                    if (!$scope.projectForm.description || $scope.projectForm.description == "") {
                        return {
                            err: "Veuillez renseigner une description",
                            valid: false
                        };
                    }
                    // expirationDate check
                    var now = moment(new Date());
                    if ($scope.projectForm.expirationDate.isBefore(now)) {
                        return {
                            err: "Veuillez renseigner une date d'expiration ultérieur à la date d'aujourd'hui",
                            valid: false
                        };
                    }
                    // objectifFinancier check
                    var target = parseInt($scope.projectForm.objectifFinancier);
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

                function createGuid() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0,
                            v = c === 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
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

                function fileExist(fileName, fileList) {
                    var fileFound = false,
                        size = fileList.length;
                    for (var i = 0; i < size; i++) {
                        // check if containers exist
                        if (fileList[i].name == fileName) {
                            fileFound = true;
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