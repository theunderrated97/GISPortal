<?php

// include "http://10.96.4.34/TPLGIS/resources/custom/config.php";

header('Access-Control-Allow-Origin: *'); 
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Max-Age: 86400');
header('Access-Control-Allow-Headers: *');
// header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token,  Accept, Authorization, X-Requested-With');

$host = "10.96.4.34";
$user = "postgres";
$password = "postgres";
$dbname = "GIS";

$con = pg_connect("host=$host dbname=$dbname user=$user password=$password");

if(!$con){
    die("Connection failed.");
}

$request = "";

if(isset($_POST['request'])){
  $request = $_POST['request'];
  $searchTxt = $_POST['searchTxt'];
  $searchLayer = $_POST['searchLayer'];
  $searchAttribute = $_POST['searchAttribute'];
}

$searchAttributeValues = explode(",",$searchAttribute,2);

// Fetch all records
if($request == 'liveSearch'){

  // $query = "SELECT * FROM public.mspanno WHERE LOWER(fl) LIKE LOWER('%$searchTxt%') ORDER BY fl ASC LIMIT 10";
  $query = "SELECT * FROM $searchLayer WHERE LOWER($searchAttributeValues[0]) LIKE LOWER('%$searchTxt%') OR LOWER($searchAttributeValues[1]) LIKE LOWER('%$searchTxt%') ORDER BY $searchAttribute ASC LIMIT 10";

  $result = pg_query($con, $query);

  $response = array();

  while ($row = pg_fetch_assoc($result) ){

     $value = $row[$searchAttributeValues[0]] . ", " . $row[$searchAttributeValues[1]] ;


     $response[] = array(
      $searchAttribute => $value,

     );
  }

  echo json_encode($response);
  die;
}

?>