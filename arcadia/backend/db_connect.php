<?php
// Database configuration
$host = "localhost";
$username = "root";
$password = "";
$database = "arcadia_db";

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Database Connection Failed: " . $conn->connect_error);
}
?>