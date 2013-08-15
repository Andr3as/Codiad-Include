<?php
/*
 * Copyright (c) Codiad & Andr3as, distributed
 * as-is and without warranty under the MIT License. 
 * See [root]/license.md for more information. This information must remain intact.
 */

    require_once('../../common.php');
    
    checkSession();
    error_reporting(0);
    
    $localPath = "../../workspace/";
    
    switch($_GET['action']) {
        
        case 'getFiles':
            if (isset($_GET['path'])) {
                $all = scanProject($localPath.$_GET['path']);
                $result = array();
                foreach($all as $one) {
                    //Get file info
                    $fileInfo   = pathinfo($one);
                    $path       = substr($one, strlen($localPath.$_GET['path'])+1);
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
?>