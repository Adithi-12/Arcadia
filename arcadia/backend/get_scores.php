<?php
include "db_connect.php";

// Fetch latest scores
$sql = "SELECT game_name, score, played_at 
        FROM scores 
        ORDER BY played_at DESC 
        LIMIT 10";

$result = $conn->query($sql);

$scores = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $scores[] = $row;
    }
}

// Return data as JSON
header('Content-Type: application/json');
echo json_encode($scores);

$conn->close();
?>