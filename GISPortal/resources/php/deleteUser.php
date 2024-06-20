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

if($request == 'deleteUser'){
  
  $query = "DELETE FROM public.admin_users 	WHERE userid = '$uid'";
  $result = pg_query($con, $query);
  
  if($result){
    echo "User Deleted Successfully";
  }
}
