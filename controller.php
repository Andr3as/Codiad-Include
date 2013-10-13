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
                    $fileInfo   = pathinfo($one);
                    $path       = substr($one, strlen($file)+1);
                    if (isset($fileInfo['extension'])) {
                        if (isset($result[$fileInfo['extension']])) {
                            array_push($result[$fileInfo['extension']], $path);
                        } else {
                            $result[$fileInfo['extension']] = array($path);
                        }
                    } else {
                        $result["no-ext"] = array($path);
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
            if ($file != "." && $file != "..") {
                //check if $file is a folder
                $longPath   = $path."/".$file;
                if (is_dir($longPath)) {
                    //scan dir
                    $parsedArray    = scanProject($longPath);
                    $completeArray  = array_merge($completeArray, $parsedArray);
                } else {
                    $parsedArray    = array(0 => $longPath);
                    $completeArray  = array_merge($completeArray, $parsedArray);
                }
            }
        }
        return $completeArray;
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