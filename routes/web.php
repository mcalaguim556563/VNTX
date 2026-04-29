<?php

use Illuminate\Support\Facades\Route;

// Serve the React SPA for all routes — React Router handles client-side navigation
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
