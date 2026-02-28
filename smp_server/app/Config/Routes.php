<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 * 
 * // Реестр проверок
 */
$routes->group('api', ['namespace' => 'App\Controllers'], function($routes) {
    $routes->get('inspections', 'InspectionsController::getPaginated');
    $routes->post('inspections', 'InspectionsController::create');
    $routes->patch('inspections/(:num)', 'InspectionsController::update/$1');
    $routes->delete('inspections/(:num)', 'InspectionsController::delete/$1');
});

// Справочник СМП
$routes->group('api', ['namespace' => 'App\Controllers'], function($routes) {
    $routes->get('smp/list', 'SmpController::list');
    $routes->post('smp', 'SmpController::create');
    $routes->patch('smp/(:num)', 'SmpController::update/$1');
});

// Контролирующий орган
$routes->group('api', ['namespace' => 'App\Controllers'], function($routes) {
    $routes->get('authority', 'AuthorityController::list');
    $routes->post('authority', 'AuthorityController::create');
});
