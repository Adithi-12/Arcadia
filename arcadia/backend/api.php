<?php
// api.php
// Main API Handler for Arcadia Gaming Platform

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for CORS and JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database configuration
require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Create database connection
$database = new Database();
$db = $database->getConnection();

// Check if connection was successful
if ($db === null) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit();
}

// Get the action from URL parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Route to appropriate function based on action
switch($action) {
    case 'save_score':
        saveScore($db);
        break;
    case 'get_leaderboard':
        getLeaderboard($db);
        break;
    case 'get_games':
        getGames($db);
        break;
    case 'get_user_history':
        getUserHistory($db);
        break;
    case 'test':
        echo json_encode([
            "success" => true,
            "message" => "API is working!",
            "timestamp" => date('Y-m-d H:i:s')
        ]);
        break;
    default:
        echo json_encode([
            "success" => false,
            "message" => "Invalid action. Available actions: save_score, get_leaderboard, get_games, get_user_history, test"
        ]);
        break;
}

// ==================== FUNCTION: Save Score ====================
function saveScore($db) {
    // Get POST data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields
    if (!empty($data->game_id) && isset($data->score)) {
        try {
            $user_id = isset($data->user_id) ? $data->user_id : 1; // Default to guest user
            $duration = isset($data->duration) ? $data->duration : 0;
            
            // Call stored procedure
            $stmt = $db->prepare("CALL save_game_score(?, ?, ?, ?)");
            $stmt->execute([
                $user_id,
                $data->game_id,
                $data->score,
                $duration
            ]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                "success" => true,
                "message" => "Score saved successfully",
                "data" => $result
            ]);
            
        } catch(PDOException $e) {
            echo json_encode([
                "success" => false,
                "message" => "Failed to save score",
                "error" => $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Incomplete data. Required: game_id, score"
        ]);
    }
}

// ==================== FUNCTION: Get Leaderboard ====================
function getLeaderboard($db) {
    $game_id = isset($_GET['game_id']) ? $_GET['game_id'] : null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    
    try {
        if ($game_id) {
            // Get leaderboard for specific game
            $stmt = $db->prepare("CALL get_top_scores(?, ?)");
            $stmt->execute([$game_id, $limit]);
        } else {
            // Get overall leaderboard
            $query = "SELECT 
                        g.game_name,
                        COALESCE(u.username, 'Guest') as username,
                        s.score,
                        DATE_FORMAT(s.score_date, '%Y-%m-%d %H:%i') as score_date
                      FROM scores s
                      JOIN games g ON s.game_id = g.game_id
                      LEFT JOIN users u ON s.user_id = u.user_id
                      ORDER BY s.score DESC, s.score_date ASC
                      LIMIT :limit";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
            $stmt->execute();
        }
        
        $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "count" => count($scores),
            "data" => $scores
        ]);
        
    } catch(PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error fetching leaderboard",
            "error" => $e->getMessage()
        ]);
    }
}

// ==================== FUNCTION: Get Available Games ====================
function getGames($db) {
    try {
        $query = "SELECT 
                    game_id, 
                    game_name, 
                    game_slug, 
                    description, 
                    category 
                  FROM games 
                  WHERE is_active = 1 
                  ORDER BY game_name";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $games = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "count" => count($games),
            "data" => $games
        ]);
        
    } catch(PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error fetching games",
            "error" => $e->getMessage()
        ]);
    }
}

// ==================== FUNCTION: Get User Game History ====================
function getUserHistory($db) {
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : 1;
    $game_id = isset($_GET['game_id']) ? $_GET['game_id'] : null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
    
    try {
        if ($game_id) {
            // Get history for specific game
            $query = "SELECT 
                        s.score,
                        DATE_FORMAT(s.score_date, '%Y-%m-%d %H:%i') as score_date,
                        gs.duration_seconds
                      FROM scores s
                      JOIN game_sessions gs ON s.session_id = gs.session_id
                      WHERE s.user_id = ? AND s.game_id = ?
                      ORDER BY s.score_date DESC
                      LIMIT ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$user_id, $game_id, $limit]);
        } else {
            // Get overall history
            $query = "SELECT 
                        g.game_name,
                        s.score,
                        DATE_FORMAT(s.score_date, '%Y-%m-%d %H:%i') as score_date
                      FROM scores s
                      JOIN games g ON s.game_id = g.game_id
                      WHERE s.user_id = ?
                      ORDER BY s.score_date DESC
                      LIMIT ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$user_id, $limit]);
        }
        
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "count" => count($history),
            "data" => $history
        ]);
        
    } catch(PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error fetching user history",
            "error" => $e->getMessage()
        ]);
    }
}
?>