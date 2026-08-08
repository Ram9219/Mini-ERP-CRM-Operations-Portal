Set-Location 'E:\Mini-ERM_Assignment\backend'
if (Test-Path 'hash_passwords.js') { Remove-Item 'hash_passwords.js' -Force }
$env:SESSION_SECRET = 'test'
node -e "require('./src/app'); console.log('app loaded');"
