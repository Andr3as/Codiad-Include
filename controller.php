<?php
/*
 * Copyright (c) Codiad & Andr3as, distributed
 * as-is and without warranty under the MIT License. 
 * See http://opensource.org/licenses/MIT for more information.
 * This information must remain intact.
 */
    error_reporting(0);
    
    require_once('../../common.php');
    checkSession();
    
    switch($_GET['action']) {
        
        case 'getFiles':
            if (isset($_GET['path'])) {
                $file   = getWorkspacePath($_GET['path']);
                $all    = scanProject($file);
                $result = array();
                foreach($all as $one) {
                    //Get file info
                    $ext        = getExtension($one);
                    $path       = substr($one, strlen($file)+1);
                    if (isset($result[$ext])) {
                        array_push($result[$ext], $path);
                    } else {
                        $result[$ext] = array($path);
                    }
                }
                echo json_encode($result);
            } else {
                echo '{"status":"error","message":"Missing Parameter"}';
            }
            break;
        
        default:
            echo '{"status":"error","message":"No Type"}';
            break;
    }
    
    //////////////////////////////////////////////////////////
    //
    //  Scan folder
    //
    //  @param {string} $path Path of the file or project
    //  @returns {array} Array of files, recursivly
    //
    //////////////////////////////////////////////////////////
    function scanProject($path) {
        $completeArray = array();
        $files  = scandir($path);
        foreach ($files as $file) {
            //filter . and ..
            $longPath   = $path."/".$file;
            if ($file != "." && $file != ".." && !is_link($longPath)) {
                //check if $file is a folder
                if (is_dir($longPath)) {
                    //scan dir
                    $parsedArray    = scanProject($longPath);
                    $completeArray  = array_merge($completeArray, $parsedArray);
                } else {
                    array_push($completeArray, $longPath);
                }
            }
        }
        return $completeArray;
    }
    
    //////////////////////////////////////////////////////////
    //
    //  Get extension of file
    //
    //  @param {string} $path Path of file
    //  @returns {string} Extension of file
    //
    //////////////////////////////////////////////////////////
    function getExtension($path) {
        $name = basename($path);
        $pos = strrpos($name, '.');
        if ($pos !== false) {
            return substr($name, $pos + 1);
        } else {
            return "no-ext";
        }
    }
    
    //////////////////////////////////////////////////////////
    //
    //  Get path of file or project
    //
    //  @param {string} $path Info of the file or project
    //  @returns {string} Path of file or project
    //
    //////////////////////////////////////////////////////////
    function getWorkspacePath($path) {
		//Security check
		if (!Common::checkPath($path)) {
			die('{"status":"error","message":"Invalid path"}');
		}
        if (strpos($path, "/") === 0) {
            //Unix absolute path
            return $path;
        }
        if (strpos($path, ":/") !== false) {
            //Windows absolute path
            return $path;
        }
        if (strpos($path, ":\\") !== false) {
            //Windows absolute path
            return $path;
        }
        return "../../workspace/".$path;
    }
?>