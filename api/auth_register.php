<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method tidak diizinkan"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$nama = trim($data['nama_lengkap'] ?? '');
$user = trim($data['username'] ?? '');
$pass = $data['password'] ?? '';
$shift = trim($data['shift'] ?? 'Pagi (07:00 - 15:00)');

if (empty($nama) || empty($user) || empty($pass)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Semua kolom wajib diisi."]);
    exit;
}

// Cek username unik
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$user]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(["status" => "error", "message" => "Username sudah digunakan."]);
    exit;
}

// Role dipaksa menjadi 'kasir' agar publik tidak bisa mendaftar sebagai owner/admin
$hash = password_hash($pass, PASSWORD_BCRYPT);
$insert = $conn->prepare("INSERT INTO users (nama_lengkap, username, password_hash, role, shift_default) VALUES (?, ?, ?, 'kasir', ?)");

if ($insert->execute([$nama, $user, $hash, $shift])) {
    echo json_encode(["status" => "success", "message" => "Registrasi akun kasir berhasil! Silakan login."]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal menyimpan data registrasi."]);
}
?>
