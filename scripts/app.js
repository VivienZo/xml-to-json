(function() {
    'use strict';

    angular
        .module('app', [
            'ngRoute',
            'ngMaterial',
            'ngAnimate',
            'ngMessages',
            'ngMdIcons',
            'md.data.table',
            'pascalprecht.translate',
            'ngFileUpload',
            'ngWebworker'
        ])
        .config(routeConfig)
        .config(themeConfig)
        .config(translateConfig);

        routeConfig.$inject = ['$routeProvider'];
        function routeConfig($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: './scripts/list/list.html',
                    title: 'list'
                })
                .otherwise({
                    redirectTo: '/'
                });
        }

        themeConfig.$inject = ['$mdThemingProvider'];
        function themeConfig($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .accentPalette('red')
                .warnPalette('amber')
                .backgroundPalette('grey');
            $mdThemingProvider.theme("success-toast");
            $mdThemingProvider.theme("error-toast");
        }

        translateConfig.$inject = ['$translateProvider'];
        function translateConfig($translateProvider) {
            $translateProvider.translations('en', {
                LANGUAGE: 'Language',
                CONVERT_OK: 'All files have been converted with success.',
                CONVERT_PARTIAL_OK: ' files were not able to be converted.',
                CONVERT_KO_1: 'Unable to convert provided files.',
                CONVERT_KO_2: 'An error occured during the creation of the output directory.',
                OPEN_OUTPUT_FOLDER: 'Open the output folder',
                CARD_INSTRUCTION: 'Convert your XML files into JSON files and vice versa:',
                DROP_INSTRUCTION: 'Drag and drop XML or JSON files here',
                TABLE_COLUMN_NAME: 'Name',
                TABLE_COLUMN_SIZE: 'Size',
                TABLE_COLUMN_STATUS: 'Status',
                KB: 'KB',
                TABLE_DISPLAY_ALL: 'Display all files...',
                BROWSE_FOLDER: 'Browse folder',
                OUTPUT_FOLDER: 'Output directory',
                RUN: 'Run the conversion',
                MINIFY: 'Minify the converted files'
            });
            $translateProvider.translations('fr', {
                LANGUAGE: 'Langue',
                CONVERT_OK: 'Tous les fichiers ont été convertis avec succès.',
                CONVERT_PARTIAL_OK: ' fichiers n\'ont pas pu être convertis.',
                CONVERT_KO_1: 'Impossible de convertir les fichiers fournis.',
                CONVERT_KO_2: 'Impossible de créer le dossier cible.',
                OPEN_OUTPUT_FOLDER: 'Ouvrir le dossier de sortie',
                CARD_INSTRUCTION: 'Convertissez vos fichiers XML en fichiers JSON et vice versa :',
                DROP_INSTRUCTION: 'Déposez vos fichiers XML ou JSON dans le cadre',
                TABLE_COLUMN_NAME: 'Nom',
                TABLE_COLUMN_SIZE: 'Taille',
                TABLE_COLUMN_STATUS: 'Statut',
                KB: 'ko',
                TABLE_DISPLAY_ALL: 'Afficher tous les fichiers...',
                BROWSE_FOLDER: 'Choisir un dossier',
                OUTPUT_FOLDER: 'Dossier de sortie',
                RUN: 'Convertir',
                MINIFY: 'Minifier les fichiers convertis'
            });
            $translateProvider.preferredLanguage('en');
        }

})();