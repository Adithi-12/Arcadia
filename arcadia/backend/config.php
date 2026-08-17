<?php
// config.php
// Database Configuration File

class Database {
    // Database credentials
    private $host = "localhost";
    private $db_name = "arcadia_games";
    private $username = "root";
    private $password = "";  // Default XAMPP password is empty
    public $conn;

    // Get database connection
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection Error: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}
?>