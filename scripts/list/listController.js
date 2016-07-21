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
                //we have to use a $timeout to modifie $scope variables into a watcher
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
        //todo: listener to save the state of the minify button
        $scope.$watch('minify', function(newVal) {
            if (newVal) {
                // TODO : call nedb to save the minify value
            }
        });



        /**
        * Exposed functions
        **/

        // function which simulate a click event on the "browse directory" button
        $scope.clickOnBrowseDirectory = function () {
            $timeout(function () {
                document.getElementById('browse-directory').click()
            });
        };

        // function called when a new directory is selected by the user
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

        // function called when the user change the language of the app
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
            if ($scope.valid) {
                $scope.loading = true;
                return listService.convertFiles($scope.files, $scope.outputFolderPath, $scope.minify)
                    .then(function(response) {
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
         * Function which display a notification in the app
         * @param message: string which contains the text to display in the notification
         * @param _type: optional string which can be equals to success-toast or error-toast
         * @param _delay: optional string which represents the time during when the notification will be displayed
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
