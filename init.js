/*
 * Copyright (c) Codiad & Andr3as, distributed
 * as-is and without warranty under the MIT License.
 * See http://opensource.org/licenses/MIT for more information.
 * This information must remain intact.
 */

(function(global, $){
    
    var codiad  = global.codiad,
        scripts = document.getElementsByTagName('script'),
        path    = scripts[scripts.length-1].src.split('?')[0],
        curpath = path.split('/').slice(0, -1).join('/')+'/';

    $(function() {
        codiad.Include.init();
    });

    codiad.Include = {
        
        path: curpath,
        files: null,
        cache: [],
        rules: [],
        
        //////////////////////////////////////////////////////////
        //
        //  Init - Subscribe to amplify publications
        //
        //////////////////////////////////////////////////////////
        init: function() {
            var _this = this;
            amplify.subscribe("active.onFocus", function(path){
                _this.updateFiles(path);
            });
            amplify.subscribe("Complete.Normal", function(obj){
                _this.getSuggestions(obj);
            });
            amplify.subscribe("Include.Callback", function(obj){
                _this.replacePrefix(obj);
            });
            //Load rules
            $.getJSON(this.path + 'rules.json', function(json){
                _this.rules = json;
            });
            //Check requirements
            setTimeout(function(){
                if (typeof(codiad.Complete) == 'undefined') {
                    codiad.modal.load(400,_this.path+"dialog.php");
                }
            }, 2000);
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Update file list of the project of the current focused file
        //
        //  Parameters:
        //
        //  path - {String} - Current focused file path
        //
        //////////////////////////////////////////////////////////
        updateFiles: function(path) {
            var _this   = this;
            var project;
            if (path.search("/") !== 0) {
                project = path.substring(0, path.indexOf("/"));
            } else {
                project = path.substring(0, path.lastIndexOf("/"));
            }
            var date = new Date().getTime();
            if (typeof(this.cache[project]) != 'undefined') {
                if (this.cache[project].time > date - 60000) {
                    _this.files = this.cache[project].files;
                    return;
                }
            }
            $.getJSON(this.path+"controller.php?action=getFiles&path="+project, function(data){
                _this.files = data;
                _this.cache[project] = {files: data, time: new Date().getTime()};
            });
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Get suggestion
        //
        //  Parameters:
        //
        //  obj - {Object} - CompletePlus publishing object
        //
        //////////////////////////////////////////////////////////
        getSuggestions: function(obj) {
            var text    = obj.before.replace(new RegExp(" ", "g"), "");
            text        = text.replace(new RegExp("\t", "g"), "");
            
            var rule = [];
            for (var i = 0; i < this.rules.length; i++) {
                rule = this.rules[i];
                if (rule.scope.indexOf(obj.syntax) !== -1) {
                    if (new RegExp(rule.regex).test(obj.before)) {
                        for (var j = 0; j < rule.ext.length; j++) {
                            console.log(rule.ext[j]);
                            this.sendSuggestion(rule.ext[j], obj.file);
                        }
                    }
                }
            }
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Commit suggestions to CompletePlus
        //
        //  Parameters:
        //
        //  ext - {String} - Extension of the files to commit
        //  curFile - {String} - File path of the current file
        //
        //////////////////////////////////////////////////////////
        sendSuggestion: function(ext, curFile) {
            if (typeof(this.files[ext]) == 'undefined') {
                return false;
            }
            var sugObj, file, buf = [];
            for (var i = 0; i < this.files[ext].length; i++) {
                //filter the current file
                file    = this.files[ext][i];
                if (file !== curFile.substring(curFile.indexOf("/")+1)) {
                    sugObj  = codiad.Complete.pluginParser(file, file, file, "Include.Callback");
                    buf.push(sugObj);
                }
            }
            if (buf.length !== 0) {
                codiad.Complete.pluginNormal(buf);
            }
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Test if item is at the end of string
        //
        //  Parameters:
        //
        //  string - {String} - String to search in
        //  item - {String} - Item to search for
        //
        //////////////////////////////////////////////////////////
        isAtEnd: function(string, item) {
            var pos = string.lastIndexOf(item);
            if (pos != -1) {
                var part = string.substring(pos);
                if (part === item) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Replace prefix with file path
        //
        //  Parameters:
        //
        //  obj - {Object} - Suggestion object
        //
        //////////////////////////////////////////////////////////
        replacePrefix: function(obj) {
            var path = prompt("Edit include path:", "/"+obj.suggestion);
            if (path === null) {
                return false;
            }
            codiad.Complete.replacePrefix(path);
            return true;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Switch to a certain target
        //
        //  Parameters:
        //
        //  target - {string} - Target to switch to
        //
        //////////////////////////////////////////////////////////
        goTo: function(target) {
            if (target == "github") {
                $.getJSON(this.path+"plugin.json", function(data){
                    codiad.modal.unload();
                    window.open(data[0].url, '_newtab');
                });
            } else {
                codiad.modal.unload();
                codiad.market.list();
            }
        }
    };
})(this, jQuery);