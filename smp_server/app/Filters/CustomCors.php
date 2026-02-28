<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class CustomCors implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Устанавливаем заголовки CORS для всех ответов
        $this->setCorsHeaders();
        
        // Обработка preflight OPTIONS запросов
        if ($request->getMethod() === 'options') {
            $response = service('response');
            $response->setStatusCode(200);
            $this->setCorsHeaders($response);
            $response->setBody(''); // Пустое тело для OPTIONS
            
            // НЕМЕДЛЕННО отправляем ответ и завершаем выполнение
            $response->send();
            exit;
        }
        
        return $request;
    }
    
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        $this->setCorsHeaders($response);
        return $response;
    }
    
    private function setCorsHeaders(?ResponseInterface &$response = null): void
    {
        if ($response === null) {
            $response = service('response');
        }
        
        // Разрешаем конкретный origin
        $response->setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
        
        // Разрешаем все методы
        $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        
        // Разрешаем заголовки
        $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
        
        // Разрешаем credentials (куки, сессии)
        $response->setHeader('Access-Control-Allow-Credentials', 'true');
        
        // Кеширование preflight запросов на 24 часа
        $response->setHeader('Access-Control-Max-Age', '86400');
        
        // Явно указываем Vary header для кеширования
        $response->setHeader('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    }
}