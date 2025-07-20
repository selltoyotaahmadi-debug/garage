<?php
// api.php - قرار دهید در پوشه public_html

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// مسیر فایل‌های JSON - در روت اصلی
$dataPath = './';  // فایل‌ها در دایرکتوری اصلی قرار دارند

// پاسخ به درخواست‌های preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// خواندن فایل JSON
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $file = isset($_GET['file']) ? $_GET['file'] : '';
    if (empty($file)) {
        http_response_code(400);
        echo json_encode(['error' => 'File parameter is required']);
        exit;
    }
    
    $filePath = $dataPath . $file . '.json';
    
    if (file_exists($filePath)) {
        echo file_get_contents($filePath);
    } else {
        // اگر فایل وجود نداشت، یک فایل خالی ایجاد کنید
        $defaultContent = '{}';
        
        // اگر فایل users.json بود، کاربر پیش‌فرض را اضافه کن
        if ($file === 'users') {
            $defaultContent = json_encode([
                'users' => [
                    [
                        'id' => '1',
                        'username' => 'admin',
                        'password' => '123456',
                        'name' => 'مدیر سیستم',
                        'role' => 'admin',
                        'isActive' => true,
                        'createdAt' => date('c')
                    ],
                    [
                        'id' => '2',
                        'username' => 'amir',
                        'password' => '123456',
                        'name' => 'امیر اسد پور',
                        'role' => 'mechanic',
                        'isActive' => true,
                        'createdAt' => date('c')
                    ],
                    [
                        'id' => '3',
                        'username' => 'mohammad',
                        'password' => '123456',
                        'name' => 'محمد ده ده بزرگی',
                        'role' => 'mechanic',
                        'isActive' => true,
                        'createdAt' => date('c')
                    ],
                    [
                        'id' => '4',
                        'username' => 'reza',
                        'password' => '123456',
                        'name' => 'رضا کرمی',
                        'role' => 'mechanic',
                        'isActive' => true,
                        'createdAt' => date('c')
                    ],
                    [
                        'id' => '5',
                        'username' => 'arian',
                        'password' => '123456',
                        'name' => 'آریان پیشرو',
                        'role' => 'warehouse',
                        'isActive' => true,
                        'createdAt' => date('c')
                    ],
                    [
                        'id' => '6',
                        'username' => 'sajad',
                        'password' => '123456',
                        'name' => 'سجاد کیوان شکوه',
                        'role' => 'warehouse',
                        'isActive' => true,
                        'createdAt' => date('c')
                    ]
                ]
            ]);
        } else if ($file === 'customers') {
            $defaultContent = json_encode(['customers' => []]);
        } else if ($file === 'vehicles') {
            $defaultContent = json_encode(['vehicles' => []]);
        } else if ($file === 'jobCards') {
            $defaultContent = json_encode(['jobCards' => []]);
        } else if ($file === 'inventory') {
            $defaultContent = json_encode(['inventory' => []]);
        } else if ($file === 'suppliers') {
            $defaultContent = json_encode(['suppliers' => []]);
        } else if ($file === 'partRequests') {
            $defaultContent = json_encode(['partRequests' => []]);
        } else if ($file === 'vehicleDamages') {
            $defaultContent = json_encode(['vehicleDamages' => []]);
        }
        
        file_put_contents($filePath, $defaultContent);
        echo $defaultContent;
    }
}

// نوشتن در فایل JSON
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $file = isset($_GET['file']) ? $_GET['file'] : '';
    if (empty($file)) {
        http_response_code(400);
        echo json_encode(['error' => 'File parameter is required']);
        exit;
    }
    
    $data = file_get_contents('php://input');
    if (empty($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'No data provided']);
        exit;
    }
    
    // بررسی معتبر بودن JSON
    $json = json_decode($data);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
        exit;
    }
    
    $filePath = $dataPath . $file . '.json';
    
    if (file_put_contents($filePath, $data)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to write file']);
    }
}
?>