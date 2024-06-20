<?php

header('Access-Control-Allow-Origin: *'); 
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Max-Age: 86400');
header('Access-Control-Allow-Headers: *');

$host = "localhost";
$user = "postgres";
$password = "postgres";
$dbname = "gis";

$con = pg_connect("host=$host dbname=$dbname user=$user password=$password");

if(!$con){
    die("Connection failed.");
}

$request = "";

if(isset($_POST['request'])){
  $request = $_POST['request'];
  $uid = $_POST['uid'];
  $uname = $_POST['uname'];
  $layers = $_POST['layers'];
  $apps = $_POST['apps'];
}

if($request == 'modifyUser'){
  
  $query = "UPDATE public.admin_users SET username='$uname', password='gis@1234', layers='$layers', applications='$apps' WHERE userid = '$uid' RETURNING *";
  $result = pg_query($con, $query);
  
  if($result){
    $response = array();
    $row = pg_fetch_all($result);
    if(count($row) == 1){
      // echo json_encode($row);
      echo "User Modified Successfully";
    } else {
      echo "User not modified";
      die;
    }
  }
  
}
if($request == 'passwordReset'){
  
  $query = "UPDATE public.admin_users SET password='gis@1234'WHERE userid = '$uid' RETURNING *";
  $result = pg_query($con, $query);
  
  if($result){
    $response = array();
    $row = pg_fetch_all($result);
    if(count($row) == 1){
      // echo json_encode($row);
      echo "Password Reset Successfully";
    } else {
      echo "Password not reset";
      die;
    }
  }
  
}
