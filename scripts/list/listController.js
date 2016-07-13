(function () {
    'use strict';
    angular.module('app')
    .controller('listController', ['configService', 'listService', '$timeout', '$translate', '$location', '$mdToast', '$q', '$http', '$scope', ListController]);

    function ListController(configService, listService, $timeout, $translate, $location, $mdToast, $q, $http, $scope) {
        console.log("> ListController()");

        /**
        * Variable declarations
        **/

        const shell = require('electron').shell;
        $scope.loading = false;
        $scope.valid = false;
        $scope.minify = false;
        $scope.query = {
            order: '',
            limit: 5
        };
        $scope.outputFolderPath = "";
        $scope.files = [];


        /**
         * Listeners
         */

        // remove unauthorized files from the list to convert
        $scope.$watch('files', function(receivedFiles) {
            if (receivedFiles && receivedFiles.length) {
                $timeout(function() {
                    try {
                        $scope.loading = true;
                        let filtredFiles = [];
                        receivedFiles.forEach(function (file) {
                            if (file.size > 0 && (
                                (file.name.endsWith('.xml') && file.type === 'text/xml')
                                || file.name.endsWith('.json') && (file.type === '' || file.type === 'application/json') ) ) {
                                    filtredFiles.push(file);
                                }
                        });
                        if ($scope.files.length !== filtredFiles.length) {
                            //we update the list of files to convert
                            $scope.files = filtredFiles;
                            //we define a default output folder if it is undefined
                        }
                        if (!$scope.outputFolderPath && $scope.files.length && $scope.files[0] && $scope.files[0].path) {
                            if ($scope.files[0].path.lastIndexOf('\\')) {
                                $scope.outputFolderPath = '' + $scope.files[0].path.substring(0, $scope.files[0].path.lastIndexOf('\\') + 1) + 'converted_files';
                            } else if ($scope.files[0].path.lastIndexOf('/')) {
                                $scope.outputFolderPath = '' + $scope.files[0].path.substring(0, $scope.files[0].path.lastIndexOf('/') + 1) + 'converted_files';
                            }

                        }
                        $scope.valid = ($scope.files.length && $scope.outputFolderPath);
                        $scope.query.limit = 5;
                        $scope.loading = false;
                    } catch (error) {
                        $scope.loading = false;
                    }
                });
            }
        });
        //todo: listener pour minify pour enregistrer sa nouvelle valeur avec nedb après changement
        $scope.$watch('minify', function(newVal) {
            if (newVal) {
                // TODO : call nedb to save the minify value
            }
        });



        /**
        * Exposed functions
        **/

        // fonction simulant un clic sur le bouton de choix d'un dossier
        $scope.clickOnBrowseDirectory = function () {
            $timeout(function () {
                document.getElementById('browse-directory').click()
            });
        };

        // fonction appelée lorsqu'un nouveau dossier est sélectionné par l'utilisateur
        $scope.browseDirectory = function (data) {
            try {
                if (data && data.length && data[0].name) {
                    $scope.$apply(function () {
                        $scope.outputFolderPath = data[0].path;
                        // TODO : call nedb to save the output path
                    });
                }
            } catch (error) {
                showErrorToast('Bad directory', 'error-toast');
            }
        };

        // fonction qui permet à l'utilisateur de changer la langue de l'application (français ou anglais)
        $scope.setLang = function (lang) {
            if (lang !== $scope.lang) {
                $scope.lang = lang;
                $translate.use(lang);
                // TODO : call nedb to save the chosen language
            }
        };

        // open the directory where the files have been converted 
        $scope.openOutputFolder = function () {
            if ($scope.convertedFolderPath) {
                shell.openExternal($scope.convertedFolderPath);
            }
        }

        // conversion function
        $scope.convertFiles = function () {
            // console.log('convertFiles()',$scope.files);
            if ($scope.valid) {
                $scope.loading = true;
                return listService.convertFiles($scope.files, $scope.outputFolderPath, $scope.minify)
                    .then(function(response) {
                        // console.log(response.message);
                        $scope.convertFinishedMessageCode = response.messageCode;
                        $scope.convertedFolderPath = $scope.outputFolderPath;
                        $scope.loading = false;
                        $scope.reset();
                    })
                    .catch(function(err) {
                        console.error("ERROR: ", err);
                        showErrorToast("Unable to convert files.", "error-toast");
                        $scope.loading = false;
                    });
            } else {
                if (!$scope.files.length) {
                    showErrorToast('No files to convert', 'error-toast');
                } else if (!$scope.outputFolderPath) {
                    showErrorToast('Set the output folder', 'error-toast');
                } else {
                    showErrorToast('An error occured', 'error-toast');
                }
            }
        };

        // reset the view
        $scope.reset = function () {
            $scope.loading = false;
            $scope.valid = false;
            $scope.query = {
                order: '',
                limit: 5
            };
            $scope.outputFolderPath = "";
            $scope.files = [];
        };



        /**
         * Fonction permettant d'afficher une notification à l'utilisateur
         * @param message: string contenant le message à afficher dans la notification
         * @param _type: string facultative qui peut prendre comme valeur success-toast ou error-toast
         * @param _delay: string facultative représentant le temps d'affichage de la notification à l'écran en ms
         */
        function showErrorToast (message, _type, _delay) {
            let delay = 3000;
            if (_delay && typeof _delay === 'number') delay = _delay;
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .hideDelay(delay)
                    .theme(_type)
                );
        }

    }

})();
