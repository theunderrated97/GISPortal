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
}

// $searchAttributeValues = explode(",",$searchAttribute);

// Fetch all records
if($request == 'fetchUserIDs'){
  $query = "SELECT * FROM public.admin_users ORDER BY userid ASC";
  $result = pg_query($con, $query);
  
  if($result){
    $response = array();
    $row = pg_fetch_all($result);
    if($row){
      echo json_encode($row);
      // if ($row['password'] == $psw) {
      //   $value = $row[$searchAttributeValues[0]] . "," . $row[$searchAttributeValues[1]] . "," . $row[$searchAttributeValues[2]] . "," . $row[$searchAttributeValues[3]] ;
      //   $response[] = array(
      //     $searchAttribute => $value,
      //   );
      //   echo json_encode($response);
      //   die;
      // } else {
      //   echo "Wrong Password";
      //   die;
      // }
    } else {
      echo "Data not found";
      die;
    }
  }
}
