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

// $searchAttributeValues = explode(",",$searchAttribute);

// Fetch all records
if($request == 'createUser'){
  $query = "INSERT INTO public.admin_users(userid, username, password, layers, applications) VALUES ('$uid', '$uname', 'gis@1234', '$layers', '$apps')";
  $result = pg_query($con, $query);
  
  if($result){
    // echo $result;
    echo "User Created Successfully";
    // $response = array();
    // $row = pg_fetch_assoc($result);
    // if($row){
    //   if ($row['password'] == $psw) {
    //     $value = $row[$searchAttributeValues[0]] . "," . $row[$searchAttributeValues[1]] . "," . $row[$searchAttributeValues[2]] . "," . $row[$searchAttributeValues[3]] ;
    //     $response[] = array(
    //       $searchAttribute => $value,
    //     );
    //     echo json_encode($response);
    //     die;
    //   } else {
    //     echo "Wrong Password";
    //     die;
    //   }
    // } else {
    //   echo "User not found";
    //   die;
    // }
  }
}
