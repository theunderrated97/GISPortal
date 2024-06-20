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

if (!$con) {
    die("Connection failed.");
}

$request = "";

if (isset($_POST['request'])) {
    $request = $_POST['request'];
    $searchTxt = $_POST['searchTxt'];
    $searchLayer = $_POST['searchLayer'];
    $searchAttribute = $_POST['searchAttribute'];
}

$searchLayers = explode(",", $searchLayer);
$searchAttributes = explode("|", $searchAttribute);

if ($request == 'liveSearch') {
    if (count($searchLayers) > 1) {
        $response = array();
        
        for ($x = 0; $x < count($searchLayers); $x++) {
            $res = array();
            $searchAttributeValues = explode(",", $searchAttributes[$x]);
            $query = "SELECT * FROM " . $searchLayers[$x] . " WHERE LOWER(" . $searchAttributeValues[0] . ") LIKE LOWER('%" . $searchTxt . "%') ORDER BY " . $searchAttributeValues[0] . " ASC LIMIT 10";

            $result = pg_query($con, $query);
            while ($row = pg_fetch_assoc($result)) {

                $value = $row[$searchAttributeValues[0]] . ", " . $row[$searchAttributeValues[1]];

                $res[] = array(
                    $searchAttributes[$x] => $value,
                );
            }
            array_push($response,$res);
        }
        echo json_encode($response);
        die;
    } else {
        $searchAttributeValues = explode(",", $searchAttribute, 2);
        $query = "SELECT * FROM " . $searchLayer . " WHERE LOWER(" . $searchAttributeValues[0] . ") LIKE LOWER('%" . $searchTxt . "%') ORDER BY " . $searchAttributeValues[0] . " ASC LIMIT 10";

        $result = pg_query($con, $query);

        $response = array();

        while ($row = pg_fetch_assoc($result)) {

            $value = $row[$searchAttributeValues[0]] . ", " . $row[$searchAttributeValues[1]];

            $response[] = array(
                $searchAttribute => $value,

            );
        }

        echo json_encode($response);
        die;
    }
}
