<?php
// To use: copy settings.default.php to settings.php and configure variables.

// Database hostname
define('BYTEBEAT_DBHOST', '');
// Database username
define('BYTEBEAT_DBUSERNAME', '');
// Database password
define('BYTEBEAT_DBPASSWORD', '');
// Database name
define('BYTEBEAT_DBNAME', '');
// Timezone
define('BYTEBEAT_TIMEZONE', 'UTC');
// Administartors
$bytebeat_admins = array(
	'Admin1' => 'Password1',
	'Admin1' => 'Password2'
);
// "Make database" button to fulfill the database from library files (1 = show, 0 = hide)
define('BYTEBEAT_DBMAKE', 0);
