<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class CaseConversionFilter implements FilterInterface
{
    /**
     * Преобразование snake_case в camelCase для ответа
     */
    private function toCamelCase($data)
    {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                // Рекурсивно обрабатываем вложенные массивы
                if (is_array($value)) {
                    $value = $this->toCamelCase($value);
                }
                
                // Пропускаем числовые ключи (индексы массивов)
                if (is_numeric($key)) {
                    $result[$key] = $value;
                    continue;
                }
                
                // Преобразуем snake_case в camelCase
                // Например: smp_name -> smpName
                $camelKey = lcfirst(str_replace('_', '', ucwords($key, '_')));
                $result[$camelKey] = $value;
            }
            return $result;
        }
        return $data;
    }
    
    /**
     * Преобразование camelCase в snake_case для запроса
     */
    private function toSnakeCase($data)
    {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                // Рекурсивно обрабатываем вложенные массивы
                if (is_array($value)) {
                    $value = $this->toSnakeCase($value);
                }
                
                // Пропускаем числовые ключи
                if (is_numeric($key)) {
                    $result[$key] = $value;
                    continue;
                }
                
                // Преобразуем camelCase в snake_case
                // Например: smpName -> smp_name
                $snakeKey = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $key));
                $result[$snakeKey] = $value;
            }
            return $result;
        }
        return $data;
    }
    
    public function before(RequestInterface $request, $arguments = null)
    {
        // Проверяем что это JSON запрос
        $contentType = $request->getHeaderLine('Content-Type');
        $isJson = strpos($contentType, 'application/json') !== false;
        
        // Также проверяем POST данные
        $body = $request->getJSON(true);
        
        if ($body && is_array($body)) {
            log_message('debug', 'CaseConversion before - original: ' . json_encode($body));
            
            // Преобразуем ключи из camelCase в snake_case
            $convertedBody = $this->toSnakeCase($body);
            
            log_message('debug', 'CaseConversion before - converted: ' . json_encode($convertedBody));
            
            // Сохраняем преобразованные данные в request
            $request->setBody(json_encode($convertedBody));
            
            // Также сохраняем в _POST для совместимости
            $_POST = $convertedBody;
        }
        
        return $request;
    }
    
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Проверяем что ответ в формате JSON
        $contentType = $response->getHeaderLine('Content-Type');
        
        // Если заголовок не установлен, проверяем тело ответа
        $body = $response->getBody();
        $isJson = $contentType === 'application/json' || json_decode($body) !== null;
        
        if ($isJson && !empty($body)) {
            $data = json_decode($body, true);
            
            if ($data && is_array($data)) {
                log_message('debug', 'CaseConversion after - original: ' . json_encode($data));
                
                // Преобразуем ключи из snake_case в camelCase
                $convertedData = $this->toCamelCase($data);
                
                log_message('debug', 'CaseConversion after - converted: ' . json_encode($convertedData));
                
                // Устанавливаем преобразованный body
                $response->setBody(json_encode($convertedData, JSON_UNESCAPED_UNICODE));
                $response->setHeader('Content-Type', 'application/json');
            }
        }
        
        return $response;
    }
}