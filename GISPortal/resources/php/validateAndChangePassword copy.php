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
  $uname = $_POST['uname'];
  $psw = $_POST['existingPsw'];
  $newPsw = $_POST['newPsw'];
}

// Fetch all records
if($request == 'validateAndChangePassword'){

  $query = "SELECT * FROM public.users WHERE LOWER(userid) = LOWER('$uname') ORDER BY userid ASC LIMIT 1";
  $result = pg_query($con, $query);
  
  if($result){
    $response = array();
    $row = pg_fetch_assoc($result);
    if($row){
      if ($row['password'] == $psw) {
        $updatequery = "UPDATE public.users SET password =  '$newPsw' WHERE LOWER(userid) = LOWER('$uname') RETURNING *";
        $updateresult = pg_query($con, $updatequery);

        if($updateresult) {
          echo "Password Changed Successfully";
        }
        die;
      } else {
        echo "Wrong Password";
        die;
      }
    } else {
      echo "User not found";
      die;
    }
  }
}

?>