<?php
// Include database connection
include "db_connect.php";

// Check if data is received
if (isset($_POST['game_name']) && isset($_POST['score'])) {

    $game_name = $_POST['game_name'];
    $score = $_POST['score'];

    // Prepare SQL query
    $stmt = $conn->prepare("INSERT INTO scores (game_name, score) VALUES (?, ?)");
    $stmt->bind_param("si", $game_name, $score);

    if ($stmt->execute()) {
        echo "Score saved successfully";
    } else {
        echo "Error saving score";
    }

    $stmt->close();
} else {
    echo "Invalid data";
}

$conn->close();
?>