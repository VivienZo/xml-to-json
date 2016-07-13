(function () {
  'use strict';
  angular.module('app')
  .service('configService', ['$q', ConfigService]);

  function ConfigService($q) {
    console.log("> ConfigService()");

    /**
    * Variable declarations
    **/

    var db = new Nedb({ filename: 'datafile', autoload: true });

    /**
    * Exposed functions
    **/

    return {
        getLang: getLang,
        setLang: setLang,
        getMinify: getMinify,
        setMinify: setMinify,
        cleanDb: cleanDb
    };

    function cleanDb () {
      console.log("> ConfigService() >> cleanDb()");
      var deferred = $q.defer();
      db.find({}, function (err, docs) {
        console.log("> ConfigService() >> cleanDb() >>> before clean : ",docs);
        db.remove({}, { multi: true }, function (err, numRemoved) {
          console.log("> ConfigService() >> cleanDb() >>> "+numRemoved+" items has been removed.");
          db.find({}, function (err, docs) {
            console.log("> ConfigService() >> cleanDb() >>> after clean : ",docs);
            deferred.resolve({
              success: true
            });
          });
        });
      });
      return deferred.promise;
    }


    function getLang () {
      console.log("> ConfigService() >> getLang()");
      var deferred = $q.defer();
      // db.find({}, function (err, docs) {
      //   console.log("find all ",docs);
      // });
      db.findOne({config: 'userConfig'}, function (err, doc) {
        // console.log("=========> doc : ",doc);
        // console.log("=========> err : ",err);
        if (err) {
          deferred.resolve({
            success: false,
            lang: "en",
            message: err
          });
        } else if (!doc || !doc.lang) {
          deferred.resolve({
            success: false,
            lang: "en",
            message: "Lang not found."
          });
        } else {
          deferred.resolve({
            success: true,
            lang: doc.lang
          });
        }
      });
      return deferred.promise;
    }


    function setLang (_lang) {
      console.log("> ConfigService() >> setLang(lang)",_lang);
      var deferred = $q.defer();
      if (_lang && typeof _lang === 'string' && _lang.length) {
        db.update({ config: 'userConfig' }, { $set: { lang: _lang } }, { upsert: true }, function (err, numReplaced, upsert) {
          // console.log("=========> err : ",err);
          // console.log("=========> numReplaced : ",numReplaced);
          // console.log("=========> upsert : ",upsert);
          deferred.resolve({
            success: true,
            lang: _lang
          });
        });
      } else {
        deferred.resolve({
          success: false,
          lang: "en",
          message: "Invalid argument lang."
        });
      }
      return deferred.promise;
    }
    
    function getMinify () {
      console.log("> ConfigService() >> getMinify()");
      var deferred = $q.defer();
      db.findOne({config: 'userConfig'}, function (err, doc) {
        if (err) {
          deferred.resolve({
            success: false,
            minify: true,
            message: err
          });
        } else if (!doc || typeof doc.minify !== 'boolean') {
          deferred.resolve({
            success: false,
            minify: true,
            message: "Minify not found."
          });
        } else {
          deferred.resolve({
            success: true,
            minify: doc.minify
          });
        }
      });
      return deferred.promise;
    }


    function setMinify (_minify) {
      console.log("> ConfigService() >> setMinify(minify)",_minify);
      var deferred = $q.defer();
      if (typeof _minify === 'boolean') {
        db.update({ config: 'userConfig' }, { $set: { minify: _minify } }, { upsert: true }, function (err, numReplaced, upsert) {
          deferred.resolve({
            success: true,
            minify: _minify
          });
        });
      } else {
        deferred.resolve({
          success: false,
          minify: true,
          message: "Invalid argument minify."
        });
      }
      return deferred.promise;
    }

  }
})();
