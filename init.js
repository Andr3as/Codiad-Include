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
            switch (obj.syntax) {
                case "c_cpp":
                    //Include statement
                    if (this.isAtEnd(text, "#include\"")) {
                        this.sendSuggestion("c", obj.file);
                        this.sendSuggestion("cpp", obj.file);
                        this.sendSuggestion("h", obj.file);
                        this.sendSuggestion("hpp", obj.file);
                    }
                    break;
                case "csharp":
                    //Comes later
                    break;
                case "php":
                    //include
                    if (this.isAtEnd(text, "include\""+obj.prefix)) {
                        this.sendSuggestion("php", obj.file);
                    }
                    //include_once
                    if (this.isAtEnd(text, "include_once\""+obj.prefix)) {
                        this.sendSuggestion("php", obj.file);
                    }
                    //require
                    if (this.isAtEnd(text, "require\""+obj.prefix)) {
                        this.sendSuggestion("php", obj.file);
                    }
                    //require_once
                    if (this.isAtEnd(text, "require_once\""+obj.prefix)) {
                        this.sendSuggestion("php", obj.file);
                    }
                    //include
                    if (this.isAtEnd(text, "include(\""+obj.prefix)) {
                        this.sendSuggestion("php", obj.file);
                    }
                    //include_once
                    if (this.isAtEnd(text, "include_once(\""+obj.prefix)) {
                        this.sendSuggestion("php", obj.file);
                    }
                    //require
                    if (this.isAtEnd(text, "require(\""+obj.prefix)) {
                        this.sendSuggestion("php", obj.file);
                    }
                    //require_once
                    if (this.isAtEnd(text, "require_once(\""+obj.prefix)) {
                        this.sendSuggestion("php", obj.file);
                    }
                case "html":
                    //Script
                    if ((text.lastIndexOf("<script") > text.lastIndexOf(">")) && this.isAtEnd(text, "src=\""+obj.prefix)) {
                        this.sendSuggestion("js", obj.file);
                    }
                    //CSS, favicon, touch-icon
                    if ((text.lastIndexOf("<link") > text.lastIndexOf(">")) && this.isAtEnd(text, "href=\""+obj.prefix)) {
                        this.sendSuggestion("css", obj.file);
                        this.sendSuggestion("ico", obj.file);
                        this.sendSuggestion("png", obj.file);
                    }
                    //<a href=""></a>
                    if ((text.lastIndexOf("<a") > text.lastIndexOf(">")) && this.isAtEnd(text, "href=\""+obj.prefix)) {
                        this.sendSuggestion("html", obj.file);
                        this.sendSuggestion("htm", obj.file);
                        this.sendSuggestion("php", obj.file);
                    }
                    //<img src="">
                    if ((text.lastIndexOf("<img") > text.lastIndexOf(">")) && this.isAtEnd(text, "src=\""+obj.prefix)) {
                        this.sendSuggestion("jpg", obj.file);
                        this.sendSuggestion("jpeg", obj.file);
                        this.sendSuggestion("gif", obj.file);
                        this.sendSuggestion("png", obj.file);
                        this.sendSuggestion("bmp", obj.file);
                        this.sendSuggestion("pcx", obj.file);
                        this.sendSuggestion("tif", obj.file);
                        this.sendSuggestion("tiff", obj.file);
                    }
                case "javascript":
                    //$.get
                    if (this.isAtEnd(text, "$.get(\""+obj.prefix)) {
                        this.sendSuggestion("html", obj.file);
                        this.sendSuggestion("htm", obj.file);
                        this.sendSuggestion("php", obj.file);
                    }
                    //$.post
                    if (this.isAtEnd(text, "$.post(\""+obj.prefix)) {
                        this.sendSuggestion("php", obj.file);
                    }
                    //$.getJSON
                    if (this.isAtEnd(text, "$.getJSON(\""+obj.prefix)) {
                        this.sendSuggestion("php", obj.file);
                        this.sendSuggestion("json", obj.file);
                    }
                    //$.getScript
                    if (this.isAtEnd(text, "$.getScript(\""+obj.prefix)) {
                        this.sendSuggestion("js", obj.file);
                    }
                    //Support integrated files
                    if (obj.syntax == "javascript") {
                        break;
                    }
                case "css":
                    //Import
                    if (this.isAtEnd(text, "@importurl("+obj.prefix)) {
                        this.sendSuggestion("css", obj.file);
                    } else if (this.isAtEnd(text, "background-image:url(")) {  //background-image
                        this.sendSuggestion("jpg", obj.file);
                        this.sendSuggestion("jpeg", obj.file);
                        this.sendSuggestion("gif", obj.file);
                        this.sendSuggestion("png", obj.file);
                    }
                    break;
                case "twig":
                    if(this.isAtEnd(text, "{%include\""+obj.prefix)) {
                        this.sendSuggestion("twig", obj.file);
                        this.sendSuggestion("html", obj.file);
                    }
                    break; 
                default:
                    break;
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