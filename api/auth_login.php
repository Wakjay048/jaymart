<?php
session_start();
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method tidak diizinkan"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$user = trim($data['username'] ?? '');
$pass = $data['password'] ?? '';

if (empty($user) || empty($pass)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Username dan password wajib diisi."]);
    exit;
}

$stmt = $conn->prepare("SELECT id, nama_lengkap, username, password_hash, role, shift_default FROM users WHERE username = ?");
$stmt->execute([$user]);
$account = $stmt->fetch(PDO::FETCH_ASSOC);

if ($account && password_verify($pass, $account['password_hash'])) {
    $_SESSION['user_id'] = $account['id'];
    $_SESSION['role'] = $account['role'];
    unset($account['password_hash']);
    echo json_encode(["status" => "success", "user" => $account]);
} else {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Username atau password salah."]);
}
?>
