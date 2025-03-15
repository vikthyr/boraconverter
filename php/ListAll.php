<?php

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "https://api.vatcomply.com/currencies");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);

if($response === false) {
    echo json_encode(['error' => curl_error($ch)]);
} else {
    $responseData = json_decode($response, true);
    header('Content-Type: application/json');
    echo json_encode($responseData);
}

curl_close($ch);
?>