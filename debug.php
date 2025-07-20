<?php
// debug.php - فایل عیب‌یابی برای بررسی دسترسی به فایل‌ها
header('Content-Type: application/json');

// مسیر فایل‌های JSON - در روت اصلی
$dataPath = './';
$filePath = $dataPath . 'users.json';

$response = [
    'file_exists' => file_exists($filePath),
    'file_readable' => is_readable($filePath),
    'file_writable' => is_writable($filePath),
    'data_path' => $dataPath,
    'file_path' => $filePath,
    'php_version' => phpversion(),
    'server_info' => $_SERVER,
    'all_files' => scandir($dataPath)
];

if (file_exists($filePath)) {
    $response['file_content'] = json_decode(file_get_contents($filePath), true);
} else {
    $response['error'] = 'File does not exist';
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>