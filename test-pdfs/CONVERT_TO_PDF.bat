@echo off
echo ========================================
echo PDF Test Files Converter
echo ========================================
echo.
echo This script will open each HTML file in your default browser.
echo Use Ctrl+P and "Save as PDF" to convert each one.
echo.
echo Press any key to start...
pause >nul

echo.
echo Opening 1_simple_gst_invoice.html...
start 1_simple_gst_invoice.html
timeout /t 3 >nul

echo Opening 2_complex_multitax_invoice.html...
start 2_complex_multitax_invoice.html
timeout /t 3 >nul

echo Opening 3_service_invoice_tds.html...
start 3_service_invoice_tds.html
timeout /t 3 >nul

echo Opening 4_retail_discount_invoice.html...
start 4_retail_discount_invoice.html
timeout /t 3 >nul

echo Opening 5_legacy_terms_invoice.html...
start 5_legacy_terms_invoice.html

echo.
echo ========================================
echo All HTML files opened in browser!
echo.
echo For each tab:
echo 1. Press Ctrl+P
echo 2. Select "Save as PDF"
echo 3. Save with same name (change .html to .pdf)
echo ========================================
echo.
pause

