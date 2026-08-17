<?php
$url = "http://localhost/arcadia/backend/save_score.php";

$data = [
    'game_name' => 'Test Game',
    'score' => 50
];

$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded",
        'method'  => 'POST',
        'content' => http_build_query($data),
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo $result;
?>