(function () {
    'use strict';
    angular.module('app')
    .service('listService', ['configService', '$q', '$location', 'Webworker', ListService]);

    function ListService(configService, $q, $location, Webworker) {
        console.log("> ListService()");

        let fs = require('fs');
        let x2js = new X2JS({useDoubleQuotes: true});

        // Exposed functions
        return {
            convertFiles: convertFiles
        };



        /**
         * Convert provided files and place it in the provided output folder
         */

        function convertFiles(files, outputFolder, minify) {

            let deferred = $q.defer(),
                outputDirectoryDeferred = $q.defer(),
                promises = [];

            // demo of a web worker use in angular
            hardWorkInAnotherThread(files)
                .then(function (response) {
                    console.log('hardWorkInAnotherThread successed: ' + response);
                })
                .catch(function () {
                    console.log('hardWorkInAnotherThread errored.');
                });

            // we check if the path exists and if it is a directory
            fs.stat(outputFolder, function (err, stats) {
                if (err || !stats) {
                    if (err.code === 'ENOENT') {
                        // the path does not exist so we create it
                        fs.mkdir(outputFolder, function (err) {
                            if (err) {
                                console.error("Unable to create the provided output directory. ", err);
                                outputDirectoryDeferred.reject(err);
                            } else {
                                outputDirectoryDeferred.resolve();
                            }
                        });
                    } else {
                        console.error("Unable to access to the provided output directory. ", err);
                        outputDirectoryDeferred.reject(err);
                    }
                } else {
                    // the path exists 
                    if (!stats.isDirectory()) {
                        // the path exists but is a file
                        fs.mkdir(outputFolder, function (err) {
                            if (err) {
                                console.error("Unable to create the provided output directory. ", err);
                                outputDirectoryDeferred.reject(err);
                            } else {
                                outputDirectoryDeferred.resolve();
                            }
                        });
                    } else {
                        // the output directory is ready
                        outputDirectoryDeferred.resolve();
                    }
                }
            });

            outputDirectoryDeferred.promise
                .then(function () {

                    // conversion of the files
                    files.forEach(function (file) {
                        if (outputFolder && file.path && file.name.endsWith('.xml')) {
                            let xmlToJsonPromise = xmlToJson(file.name, file.path, outputFolder, minify);
                            promises.push(xmlToJsonPromise);
                        } else if (outputFolder && file.path && file.name.endsWith('.json')) {
                            let jsonToXmlPromise = jsonToXml(file.name, file.path, outputFolder, minify);
                            promises.push(jsonToXmlPromise);
                        } else {
                            // invalid file ignored
                        }
                    });

                    // we wait for the conversion of all the files
                    $q.all(promises)
                        .then(function () {
                            if (promises.length !== files.length) {
                                console.info((files.length - promises.length) + ' invalid files ignored.');
                                deferred.resolve({
                                    messageCode: 'CONVERT_PARTIAL_OK',
                                    message: 'Files partialy converted: ' + (files.length - promises.length) + ' invalid files ignored.',
                                    numberIgnored: files.length - promises.length
                                });
                            } else {
                                deferred.resolve({
                                    messageCode: 'CONVERT_OK',
                                    message: 'All files have been converted with success.'
                                });
                            }
                        })
                        .catch(function (err) {
                            console.error("Unable to convert provided files. ", err);
                            deferred.reject({
                                messageCode: 'CONVERT_KO_1',
                                message: 'Unable to convert provided files.',
                                error: err
                            });
                        });

                })
                .catch(function (err) {
                    console.error("An error occured during the creation of the output directory. ", err);
                    deferred.reject({
                        messageCode: 'CONVERT_KO_2',
                        message: 'An error occured during the creation of the output directory.',
                        error: err
                    });
                });

            return deferred.promise;

        }



        /**
         * Conversion functions
         */

        function xmlToJson (fileName, filePath, outputPath, minify) {
            let deferred = $q.defer();

            fs.readFile(
                filePath,
                function (err, data) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        if (minify) {
                            fs.writeFile(
                                outputPath + '/' + fileName.substring(0, fileName.lastIndexOf('.xml')) + ".json", 
                                vkbeautify.jsonmin(JSON.stringify(x2js.xml_str2json(data))),
                                function (err) {
                                    if (err) {
                                        deferred.reject(err);
                                    } else {
                                        // console.log("min xmlToJson saved");
                                        deferred.resolve();
                                    }
                                });
                        } else {
                            fs.writeFile(
                                outputPath + '/' + fileName.substring(0, fileName.lastIndexOf('.xml')) + ".json", 
                                vkbeautify.json(JSON.stringify(x2js.xml_str2json(data))),
                                function (err) {
                                    if (err) {
                                        deferred.reject(err);
                                    } else {
                                        // console.log("pretty xmlToJson saved");
                                        deferred.resolve();
                                    }
                                });
                        }
                    }
                });

            return deferred.promise;
        }

        function jsonToXml (fileName, filePath, outputPath, minify) {
            let deferred = $q.defer();

            fs.readFile(
                filePath,
                function (err, data) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        let xmlText = '<?xml version="1.0" encoding="UTF-8" ?> ';
                        xmlText += x2js.json2xml_str(JSON.parse(data));
                        let beautyXml = vkbeautify.xml(xmlText);
                        let miniXml = vkbeautify.xmlmin(xmlText);
                        if (minify) {
                            fs.writeFile(
                                outputPath + '/' + fileName.substring(0, fileName.lastIndexOf('.json')) + ".xml", 
                                miniXml,
                                function (err) {
                                    if (err) {
                                        deferred.reject(err);
                                    } else {
                                        // console.log("min xmlToJson saved");
                                        deferred.resolve();
                                    }
                                });
                        } else {
                            fs.writeFile(
                                outputPath + '/' + fileName.substring(0, fileName.lastIndexOf('.json')) + ".xml", 
                                beautyXml,
                                function (err) {
                                    if (err) {
                                        deferred.reject(err);
                                    } else {
                                        // console.log("pretty xmlToJson saved");
                                        deferred.resolve();
                                    }
                                });
                        }
                    }
                });

            return deferred.promise;

        }



        /**
         * Web Worker demo
         */

        function hardWorkInAnotherThread (files) {

            let deferred = $q.defer();

            //we initialize the web worker (https://github.com/mattslocum/ng-webworker)
            let myWorker = Webworker.create(workerConvertFiles, {async: true });

            //we run the web worker with received arguments
            myWorker.run(files)
                .then(function (response) {
                    if (response) {
                        console.log('Hard work result: ',response);
                        deferred.resolve(response);
                    } else {
                        console.error('No response received from the worker.');
                        deferred.reject();
                    }
                }, null, function (progress) {
                    //promise has a notification
                    // console.log('==> ' + progress);
                });
            
            // this function is totally isolated
            function workerConvertFiles (_files) {
                let promises = [];
                try {
                    // here we can make hard work in vanilla JS without libraries
                    _files.forEach(function (file, index) {
                        notify('Message ' + index + ': I asynchronously work hard on the ' + file.name + ' file!');
                        if (file.name.endsWith('.xml')) {
                            let xmlPromise = new Promise(function(resolve, reject) {
                                // some asynchronous tasks
                                setTimeout(function() {
                                    resolve();
                                }, Math.floor(Math.random() * 1000));
                            });
                            promises.push(xmlPromise);
                        } else {
                            let jsonPromise = new Promise(function(resolve, reject) {
                                // some asynchronous tasks
                                setTimeout(function() {
                                    reject();
                                }, Math.floor(Math.random() * 1000));
                            });
                            promises.push(jsonPromise);
                        }
                    });
                } catch (error) {
                    notify('Err. An error occured: ' + error);
                }
                
                // when all the hard work is finished, we return the response
                Promise.all(promises)
                    .then(function () {
                        complete('Only XML.');
                    })
                    .catch(function (err) {
                        notify('Err. Promise all catch error: ' + err);
                        complete('Not only XML.');
                    });

            }

            return deferred.promise;

        }



    }
})();
