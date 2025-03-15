<?php
if (!isset($_GET['base'])) {
    header('Content-Type: application/json');
    throw new Exception("O parâmetro 'base' é obrigatório.");
}

$base = $_GET['base'];
$baseToUpper = strtoupper($base);

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "https://api.vatcomply.com/rates?base=".$baseToUpper);
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
