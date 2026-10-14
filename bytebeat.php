<?php
declare(strict_types=1);

// Uncomment to show debugging errors
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('log_errors', '1');
ini_set('error_log', '/dev/stderr');

// Store session cookie for 30 days
ini_set('session.gc_maxlifetime', 2592000); 
session_set_cookie_params(2592000); 
session_start();
setcookie(session_name(), session_id(), time() + 2592000);

ob_implicit_flush();
if (function_exists('ob_get_level')) {
	while (ob_get_level() > 0) {
		ob_end_flush();
	}
}

/* ==[ Utils ]============================================================================================= */

// A global error handler
// This function will work automatically for any uncaught error
set_exception_handler(function (Throwable $e) {
	$error = '[Bytebeat Error] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine();
	error_log($error);
	fancyDie(manageError($error));
});

// Delete the current session and cookie
function deleteSession(): void {
	session_unset();
	session_destroy();
	setcookie('bytebeat_access', '', time() - 3600, '/');
	unset($_COOKIE['bytebeat_access']);
}

// Database class for managing the connection and executing queries
class DB {
	private static ?PDO $instance = null;

	public static function exec(string $query): int {
		if (self::$instance === null) {
			throw new RuntimeException('Database connection is not initialized.');
		}
		return self::$instance->exec($query);
	}

	public static function init(string $host, string $db, string $user, string $pass): void {
		if (self::$instance === null) {
			self::$instance = new PDO(
				'mysql:host=' . $host . ';dbname=' . $db . ';charset=utf8mb4', $user, $pass, [
					PDO::ATTR_PERSISTENT => true, 
					PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
					PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
				]
			);
		}
	}

	public static function query(string $query, ?array $params = null): PDOStatement {
		if (self::$instance === null) {
			throw new RuntimeException('Database connection is not initialized.');
		}
		if ($params) {
			$statement = self::$instance->prepare($query);
			$statement->execute($params);
			return $statement;
		}
		return self::$instance->query($query);
	}

	// Transaction management methods
	public static function beginTransaction(): bool {
		if (self::$instance === null) {
			throw new RuntimeException('Database connection is not initialized.');
		}
		return self::$instance->beginTransaction();
	}

	public static function commit(): bool {
		if (self::$instance === null) {
			throw new RuntimeException('Database connection is not initialized.');
		}
		return self::$instance->commit();
	}

	public static function rollBack(): bool {
		if (self::$instance === null) {
			throw new RuntimeException('Database connection is not initialized.');
		}
		return self::$instance->rollBack();
	}
}

function formatTimestamp(int $time): string {
	if ($time === 0) {
		return 'Never';
	}
	$diff = time() - $time;
	if ($diff < 60) {
		return 'Just now';
	}
	if ($diff < 3600) {
		return (int)floor($diff / 60) . 'm ago';
	}
	if ($diff < 86400) {
		return (int)floor($diff / 3600) . 'h ago';
	}
	return date('d.m.Y H:i', $time);
}

/* ==[ User accounts functions ]=========================================================================== */

// Get user information from the database by username
function dbGetUser(string $userName): ?array {
	$result = DB::query(
		"SELECT username, password_hash, role FROM `users`
		WHERE username = ? LIMIT 1",
		[$userName]);
	return $result->fetch() ?: null;
}

// Get all users from the database
function dbGetAllUsers(): array {
	$result = DB::query(
		"SELECT id, username, role, last_login FROM `users`
		ORDER BY role ASC, last_login DESC");
	return $result->fetchAll() ?: [];
}

// Add a new user to the database
function dbAddUser(string $userName, string $passw, string $role): bool {
	try {
		DB::query(
			"INSERT INTO `users`
			(username, password_hash, role)
			VALUES (?, ?, ?)",
			[trim($userName), password_hash($passw, PASSWORD_DEFAULT), $role]);
		return true; 
	} catch (PDOException $e) {
		// Unique key conflict - user already exists
		if ($e->getCode() == 1062 || $e->errorInfo[1] == 1062 || $e->errorInfo[0] === '23000') {
			return false;
		}
		throw $e;
	}
}

// Delete a user by ID from the database
function dbDeleteUser(int $id): void {
	DB::query(
		"DELETE FROM `users`
		WHERE id = ? AND role != 'admin'",
		[$id]);
}

// Update the last login timestamp for a user in the database
function dbUpdateUserLogin(string $username): void {
	DB::query(
		"UPDATE `users` SET last_login = ?
		WHERE username = ?",
		[time(), $username]);
}

// Change a user's password in the database
function dbChangeUserPassword(string $userName, string $passw): void {
	DB::query(
		"UPDATE `users`
		SET password_hash = ?
		WHERE username = ?",
		[password_hash($passw, PASSWORD_DEFAULT), $userName]);
}

// Checking authorization when trying to login
function checkLogin(): string {
	// Checking for login attempt
	if (isset($_POST['manage_password'])) {
		// If no users in the database, create the temporary admin
		if (empty(dbGetAllUsers())) {
			if ($_POST['manage_password'] === BYTEBEAT_ADMINPASS && BYTEBEAT_ADMINPASS !== '') {
				$_SESSION['bytebeat_user'] = 'TemporaryAdmin';
				$_SESSION['bytebeat_role'] = 'admin';
			}
		} else {
			// If provided user is available, check the password hash
			$users = dbGetUser($_POST['manage_user'] ?? '');
			if ($users && password_verify($_POST['manage_password'], $users['password_hash'])) {
				$userName = $users['username'];
				$_SESSION['bytebeat_user'] = $userName;
				$_SESSION['bytebeat_role'] = $users['role'];
				dbUpdateUserLogin($userName);
			}
		}

		// Generate the CSRF token as a single block for all successful logins
		if (isset($_SESSION['bytebeat_role']) && $_SESSION['bytebeat_role'] !== 'disabled' &&
			empty($_SESSION['bytebeat_token'])
		) {
			$_SESSION['bytebeat_token'] = bin2hex(random_bytes(32));
		}
	}

	// Session update
	$loginStatus = $_SESSION['bytebeat_role'] ?? 'disabled';
	if ($loginStatus === 'disabled') {
		setcookie('bytebeat_access', '', time() - 3600, '/');
		unset($_COOKIE['bytebeat_access']);
	} else {
		setcookie('bytebeat_access', '1', time() + 2592000, '/'); // 30 days
	}
	return $loginStatus;
}

// Generating the login form
function makeLoginPage(): string {
	return '<h2>Login</h2>
		<form name="form_login" method="post" action="?manage">
			<div class="form-container">
				<div class="form-row">
					<div class="form-row-label">Username:</div>
					<input type="text" name="manage_user" required>
				</div>
				<div class="form-row">
					<div class="form-row-label">Password:</div>
					<input type="password" name="manage_password" required>
				</div>
				<input type="submit" class="link-button form-submit" value="Log In">
			</div>
		</form>';
}

// Generating the form for creating a new admin account during initial setup
function makeNewAdminForm(): string {
	$token = $_SESSION['bytebeat_token'] ?? '';
	return '<h2>Initial Setup: Create admin account</h2>
		<form method="post" action="?manage">
			<input type="hidden" name="token" value="' . $token . '">
			<div class="form-container">
				<div class="form-row">
					<div class="form-row-label">Admin username:</div>
					<input type="text" name="new_admin_user" required>
				</div>
				<div class="form-row">
					<div class="form-row-label">Admin password:</div>
					<input type="password" name="new_admin_pass" required>
				</div>
				<input class="link-button" type="submit" value="Create account">
			</div>
			<div class="form-notes">
				Don\' forget to erase BYTEBEAT_ADMINPASS with empty string in settings.php<br>
				after you create the administrator account.
			</div>
		</form>';
}

// Generating the form for changing the password of the current user
function makeChangePasswForm(): string {
	$token = $_SESSION['bytebeat_token'] ?? '';
	return '<h2>Change password (' . htmlspecialchars($_SESSION['bytebeat_user']) . ')</h2>
		<form method="post" action="?">
			<input type="hidden" name="token" value="' . $token . '">
			<input type="hidden" name="user_change_pass">
			<div class="form-container">
				<div class="form-row">
					<div class="form-row-label">Old password:</div>
					<input type="password" name="old_pass" required>
				</div>
				<div class="form-row">
					<div class="form-row-label">New password:</div>
					<input type="password" name="new_pass" required>
				</div>
				<div class="form-row">
					<div class="form-row-label">Confirm password:</div>
					<input type="password" name="confirm_pass" required>
				</div>
				<input class="link-button" type="submit" value="Confirm change">
			</div>
			<div class="form-notes">
				The password must be at least 8 characters long.
			</div>
		</form>';
}

// Generating the user management panel for admins
function makeUsersManager(): string {
	$token = $_SESSION['bytebeat_token'] ?? '';
	$html = '<h2>Add new user</h2>
		<form method="post" action="?">
			<input type="hidden" name="token" value="' . $token . '">
			<div class="form-container">
				<div class="form-row">
					<div class="form-row-label">Username:</div>
					<input type="text" name="user_add" required autocomplete="off">
				</div>
				<div class="form-row">
					<div class="form-row-label">Password:</div>
					<input type="password" name="add_pass" required>
				</div>
				<input type="submit" class="link-button form-submit" value="Create account">
			</div>
		</form>
		<hr>
		<h2>Users Management</h2>
		<table class="table"><thead>
			<tr>
				<th>ID</th>
				<th>Username</th>
				<th>Role</th>
				<th>Last Login</th>
				<th>Action</th>
			</tr></thead><tbody>';
	$users = dbGetAllUsers();
	foreach ($users as $person) {
		$lastLogin = (int)$person['last_login'];
		$username = htmlspecialchars($person['username']);
		$html .= '
			<tr>
				<td>' . $person['id'] . '</td>
				<td>' . $username . '</td>
				<td>' . ucfirst($person['role']) . '</td>
				<td title="' . date('Y-m-d H:i:s', $lastLogin) . '">' . formatTimestamp($lastLogin) . '</td>
				<td>' . (
					$person['role'] === 'admin' ? '---' : '
					<form method="post" action="?">
						<input type="hidden" name="token" value="' . $token . '">
						<input type="hidden" name="user_delete" value="' . $person['id'] . '">
						<input type="submit" class="link-button" value="Delete user"' .
							' onsubmit="return confirm(\'Delete ' . $username . '?\')">
					</form>
				') . '</td>
			</tr>';
	}
	$html .= '
		</tbody></table>';
	return $html;
}

// Request to add a new user
function addUser(): void {
	if (isset($_POST['user_add'], $_POST['add_pass'])) {
		$role = 'moderator';
		if (dbAddUser($_POST['user_add'], $_POST['add_pass'], $role)) {
			fancyDie(manageInfo('User account added for user "' .
				htmlspecialchars($_POST['user_add']) . '" with "' . $role . '" role.') . '
		' . makeUsersManager());
		} else {
			fancyDie(manageError('Adding user error: User "' .
				htmlspecialchars($_POST['user_add']) . '" already exists!') . '
		' . makeUsersManager());
		}
	}
}

// Request to delete a user
function deleteUser(): void {
	if (is_numeric($_POST['user_delete'] ?? null)) {
		dbDeleteUser((int)$_POST['user_delete']);
		fancyDie(manageInfo('User account with ID ' . $_POST['user_delete'] . ' has been deleted.') . '
		' . makeUsersManager());
	}
}

// Request to change the password of the current user
function changePassw(): void {
	if (isset($_POST['old_pass'], $_POST['new_pass'], $_POST['confirm_pass'])) {
		$newPassw = $_POST['new_pass'];
		if ($newPassw === $_POST['confirm_pass']) {
			if (strlen($newPassw) >= 8) {
				$userName = $_SESSION['bytebeat_user'];
				$user = dbGetUser($userName);
				if ($user && password_verify($_POST['old_pass'], $user['password_hash'])) {
					dbChangeUserPassword($userName, $newPassw);
					deleteSession();
					fancyDie(manageInfo(
						'Password changed successfully!<br>Please log in with new credentials.') . '
		' . makeLoginPage());
				} else {
					fancyDie(manageError('Changing password error: Old password is incorrect!') . '
		' . makeChangePasswForm());
				}
			} else {
				fancyDie(manageError(
					'Changing password error: New password must be at least 8 characters long!') . '
		' . makeChangePasswForm());
			}
		} else {
			fancyDie(manageError('Changing password error: New password and confirmation do not match!') . '
		' . makeChangePasswForm());
		}
	}
}

/* ==[ Functions ]========================================================================================= */

// Page display
function fancyDie(string $message): void {
	$referer = isset($_SERVER['HTTP_REFERER']) ? htmlspecialchars($_SERVER['HTTP_REFERER']) : '';
	header('Content-Type: text/html; charset=utf-8');
	die('<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Bytebeat management</title>
	<link rel="shortcut icon" href="favicon.png">
	<link rel="stylesheet" type="text/css" href="style.css?version=2026081500">
	<script src="./build/theme.js?version=2026081500"></script>
</head>
<body>
	<main class="wrapper">
		<h1 class="page-title">Bytebeat management</h1>
		<hr>
		' . $message . '
		<hr>
		<div class="panel-navigation">
			<a class="link-button" href="?manage">Management</a>
			<a class="link-button" href="https://github.com/SthephanShinkufag/bytebeat-composer/wiki/Library-moderation-instructions">Instructions</a>
			<a class="link-button" href="./">Go to player</a>
			<a class="link-button" href="' .
				($referer ?: 'javascript:history.back();') . '" title="Return to board">Return</a>
		</div>
	</main>
</body>
</html>');
}

// Info message
function manageInfo(string $text): string {
	return '<div class="manage-info">' . $text . '</div>';
}

// Error message
function manageError(string $text): string {
	return '<div class="manage-error">' . $text . '</div>';
}

// Generating the main management panel
function makeManagementPanel(): string {
	global $loginStatus, $isAdmin;
	$token = $_SESSION['bytebeat_token'] ?? '';
	return '<h2>Select an action (' . $loginStatus . ')</h2>
		<div class="form-container">
			<form method="post" action="?">
				<input type="hidden" name="token" value="' . $token . '">
				<input type="hidden" name="song_add_form">
				<button type="submit" class="link-button form-submit">Add a song</button>
			</form>' .
			(!$isAdmin ? '' : '
			<form method="post" action="?">
				<input type="hidden" name="token" value="' . $token . '">
				<input type="hidden" name="db_to_files">
				<button type="submit" class="link-button form-submit">Make library files</button>
			</form>
			<form method="post" action="?">
				<input type="hidden" name="token" value="' . $token . '">
				<input type="hidden" name="files_to_db">
				<button type="submit" class="link-button form-submit"' .
					' onclick="return confirm(\'Are you sure to copy songs from library files into the database?\')">Make database</button>
			</form>
			<form method="post" action="?">
				<input type="hidden" name="token" value="' . $token . '">
				<input type="hidden" name="users_manage">
				<button type="submit" class="link-button form-submit">Manage users</button>
			</form>') . '
			<form method="post" action="?">
				<input type="hidden" name="token" value="' . $token . '">
				<input type="hidden" name="user_change_pass_form">
				<button type="submit" class="link-button form-submit">Change password</button>
			</form>
			<a href="?logout" class="link-button form-submit">Logout</a>
		</div>';
}

// Generating the form for adding/editing a song to the database
function makeManageSongForm(): string {
	$token = $_SESSION['bytebeat_token'] ?? '';
	return '<h2>Adding a song</h2>
		<form name="form_song_add" method="post" action="?">
			<input type="hidden" name="token" value="' . $token . '">
			<input type="hidden" name="song_add">
			<div class="form-container">
				<div class="form-row">
					<div class="form-row-label">Author, date:</div>
					<div class="form-row-added">
						<input type="text" name="author" placeholder="Author">
						<input type="date" name="date" placeholder="yyyy-mm-dd">
					</div>
				</div>
				<div class="form-row">
					<div class="form-row-label">Song name:</div>
					<input type="text" name="name" placeholder="Name">
				</div>
				<div class="form-row">
					<div class="form-row-label">URLs:</div>
					<div class="form-row-added">
						<input type="text" name="url[]" placeholder="URL">
						<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more URLs">+</button>
					</div>
				</div>
				<div class="form-row">
					<div class="form-row-label">Description:</div>
					<textarea name="description" rows="3"></textarea>
				</div>
				<div class="form-row">
					<div class="form-row-label">Mode:</div>
					<div class="form-row-added">
						<select name="mode">
							<option value="Bytebeat">Bytebeat</option>
							<option value="Signed Bytebeat">Signed Bytebeat</option>
							<option value="Floatbeat">Floatbeat</option>
							<option value="Funcbeat">Funcbeat</option>
						</select>
						<input type="text" name="samplerate" placeholder="Sample rate (Hz)">
						<label style="white-space: nowrap;"><input type="checkbox" name="stereo"> Stereo</label>
					</div>
				</div>
				<div class="form-row">
					<div class="form-row-label">Remix sources:</div>
					<div class="form-row-added">
						<input type="text" name="remix[]" placeholder="Remix source song hash">
						<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more hashes">+</button>
					</div>
				</div>
				<div class="form-row">
					<div class="form-row-label">Cover source:</div>
					<input type="text" name="cover_name" placeholder="Cover source name">
					<input type="text" name="cover_url" placeholder="Cover source URL">
				</div>
				<div class="form-row">
					<div class="form-row-label">Original code:</div>
					<textarea name="code" rows="5"></textarea>
				</div>
				<div class="form-row">
					<div class="form-row-label">Minified code:</div>
					<textarea name="code_minified" rows="5"></textarea>
				</div>
				<div class="form-row">
					<div class="form-row-label">Formatted code:</div>
					<textarea name="code_formatted" rows="5"></textarea>
				</div>
				<div class="form-row">
					<div class="form-row-label">Draw mode and scale:</div>
					<div class="form-row-added">
						<select name="drawing_mode">
							<option value="">None</option>
							<option value="Points">Points</option>
							<option value="Waveform">Waveform</option>
							<option value="Diagram">Diagram</option>
							<option value="Combined">Combined</option>
						</select>
						<input type="text" name="drawing_scale" placeholder="1=1/2, 2=1/4, 3=1/8 ...">
					</div>
				</div>
				<div class="form-row">
					<div class="form-row-label">Tags:</div>
					<div class="form-row-added">
						<input type="text" name="tags[]" placeholder="Tag">
						<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more tags">+</button>
					</div>
				</div>
				<input type="submit" class="link-button form-submit" value="Submit">
			</div>
		</form>';
}

// Generating the form to call the CSRF form to edit a song in the database
function makeEditSongCall(): string {
	$token = $_SESSION['bytebeat_token'] ?? '';
	if(!isset($_GET['hash'])) {
		fancyDie(manageError('Song with hash = "" not found!'));
	}
	return '<h2>Song hash ' . $_GET['hash'] . '</h2>
		<div class="form-container">
			<form method="post" action="?">
				<input type="hidden" name="token" value="' . $token . '">
				<input type="hidden" name="song_edit_form">
				<input type="hidden" name="hash" value="' . $_GET['hash'] . '">
				<button type="submit" class="link-button form-submit">Continue to edit</button>
			</form>
		</div>';
}

// Generating the form to edit a song in the database
function makeEditSongForm(): string {
	if (!isset($_POST['hash'])) {
		return manageError('Song with hash = "" not found!');
	}
	$hash = $_POST['hash'];

	// Get a song by hash from the database
	$song = DB::query(
		"SELECT * FROM `songs`
		WHERE `hash` = ? LIMIT 1",
		[$hash]
	)->fetch();
	if (!$song) {
		return manageError('Song with hash = "' . $hash . '" not found!');
	}

	// Make URL fields
	$urlStr = '';
	$url = $song['url'];
	if (isset($url) && str_starts_with($url, '["')) {
		$urlArr = json_decode($url);
		if (json_last_error() === JSON_ERROR_NONE && is_array($urlArr)) {
			foreach ($urlArr as $url_) {
				$urlStr .= '<div class="form-row-added">
					<input type="text" name="url[]" placeholder="URL" value="' . $url_ . '">
					<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more URLs">+</button>
				</div>';
			}
		}
	} else {
		$urlStr .= '<div class="form-row-added">
					<input type="text" name="url[]" placeholder="URL" value="' . $url . '">
					<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more URLs">+</button>
				</div>';
	}

	// Make tags fields
	$tagsStr = '';
	$tags = json_decode($song['tags']);
	if (json_last_error() === JSON_ERROR_NONE && is_array($tags)) {
		foreach ($tags as $tag) {
			$tagsStr .= '<div class="form-row-added">
					<input type="text" name="tags[]" placeholder="Tag" value="' . $tag . '">
					<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more tags">+</button>
				</div>';
		}
	}

	// Find if the song is a remix then get sources hashes
	$remixStr = '';
	$remixSources = DB::query(
		"SELECT * FROM `remixes`
		WHERE `song` = ?",
		[$hash]
	)->fetchAll() ?: [];
	if (!empty($remixSources)) {
		foreach ($remixSources as $source) {
			$remixStr .= '<div class="form-row-added">
					<input type="text" name="remix[]" placeholder="Remix source song hash" value="' .
						$source['source'] . '">
					<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more hashes">+</button>
				</div>';
		}
	} else {
		$remixStr = '<div class="form-row-added">
					<input type="text" name="remix[]" placeholder="Remix source song hash">
					<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more hashes">+</button>
				</div>';
	}

	// Parsing the drawing mode
	$drawing_mode = '';
	if (isset($song['drawing'])) {
		$drawing = json_decode($song['drawing']);
		if (json_last_error() === JSON_ERROR_NONE) {
			$drawing_mode = $drawing->mode;
			$drawing_scale = $drawing->scale;
		}
	}

	// Form generation
	$token = $_SESSION['bytebeat_token'] ?? '';
	return '<h2>Editing a song</h2>
	<form name="form_song_edit" method="post" action="?">
		<input type="hidden" name="token" value="' . $token . '">
		<input type="hidden" name="song_edit">
		<div class="form-container">
			<div class="form-row">
				<div class="form-row-label">Hash</div>
				<input type="text" name="hash" value="' . $hash . '" readonly>
			</div>
			<div class="form-row">
				<div class="form-row-label">Author, date</div>
				<div class="form-row-added">
					<input type="text" name="author" value="' .
						(isset($song['author']) ? htmlspecialchars($song['author']) : '') . '">
					<input type="date" name="date" placeholder="yyyy-mm-dd" value="' . $song['date'] . '">
				</div>
			</div>
			<div class="form-row">
				<div class="form-row-label">Name</div>
				<input type="text" name="name" value="' .
					(isset($song['name']) ? htmlspecialchars($song['name']) : '') . '">
			</div>
			<div class="form-row">
				<div class="form-row-label">URLs</div>
				' . $urlStr . '
			</div>
			<div class="form-row">
				<div class="form-row-label">Description</div>
				<textarea name="description" rows="3">' .
					(isset($song['description']) ? htmlspecialchars($song['description']) : '') .
					'</textarea>
			</div>
			<div class="form-row">
				<div class="form-row-label">Mode</div>
				<div class="form-row-added">
					<select name="mode">
						<option value="Bytebeat"' .
							($song['mode'] === 'Bytebeat' ? ' selected' : '') . '>Bytebeat</option>
						<option value="Signed Bytebeat"' .
							($song['mode'] === 'Signed Bytebeat' ? ' selected' : '') .
							'>Signed Bytebeat</option>
						<option value="Floatbeat"' .
							($song['mode'] === 'Floatbeat' ? ' selected' : '') . '>Floatbeat</option>
						<option value="Funcbeat"' .
							($song['mode'] === 'Funcbeat' ? ' selected' : '') . '>Funcbeat</option>
					</select>
					<input type="text" name="samplerate" value="' .
						$song['samplerate'] . '" placeholder="Sample rate (Hz)">
					<label style="white-space: nowrap;"><input type="checkbox" name="stereo"' .
						($song['stereo'] ? ' checked' : '') . '> Stereo</label>
				</div>
			</div>
			<div class="form-row">
				<div class="form-row-label">Remix sources</div>
				' . $remixStr . '
			</div>
			<div class="form-row">
			<div class="form-row-label">Cover source</div>
				<input type="text" name="cover_name" value="' .
					(isset($song['cover_name']) ? htmlspecialchars($song['cover_name']) : '') .
					'" placeholder="Cover source name">
				<input type="text" name="cover_url" value="' .
					$song['cover_url'] . '" placeholder="Cover source URL">
			</div>
			<div class="form-row">
				<div class="form-row-label">Original code</div>
				<textarea name="code" rows="5">' . $song['code'] . '</textarea>
			</div>
			<div class="form-row">
				<div class="form-row-label">Minified code</div>
				<textarea name="code_minified" rows="5">' . $song['code_minified'] . '</textarea>
			</div>
			<div class="form-row">
				<div class="form-row-label">Formatted code</div>
				<textarea name="code_formatted" rows="5">' . $song['code_formatted'] . '</textarea>
			</div>
			<div class="form-row">
				<div class="form-row-label">Draw mode/scale</div>
				<div class="form-row-added">
					<select name="drawing_mode">
						<option value=""' . ($drawing_mode ? ' selected' : '') . '>None</option>
						<option value="Points"' .
							($drawing_mode === 'Points' ? ' selected' : '') . '>Points</option>
						<option value="Waveform"' .
							($drawing_mode === 'Waveform' ? ' selected' : '') . '>Waveform</option>
						<option value="Diagram"' .
							($drawing_mode === 'Diagram' ? ' selected' : '') . '>Diagram</option>
						<option value="Combined"' .
							($drawing_mode === 'Combined' ? ' selected' : '') . '>Combined</option>
					</select>
					<input type="text" name="drawing_scale" placeholder="1=1/2, 2=1/4, 3=1/8, ..." value="' .
						(isset($drawing_scale) ? $drawing_scale : '' ) . '">
				</div>
			</div>
			<div class="form-row">
				<div class="form-row-label">Tags</div>
				' . $tagsStr .'
			</div>
			<input type="submit" class="link-button form-submit" value="Submit changes">
		</div>
	</form>
	<hr>
	<h2>Deleting a song</h2>
	<form name="form_song_delete" method="post" action="?">
		<input type="hidden" name="token" value="' . $token . '">
		<input type="hidden" name="song_delete">
		<input type="hidden" name="hash" value="' . $hash . '">
		<div class="form-container">
			<div class="form-row">
				<input type="submit" class="link-button form-submit" value="Delete song"' .
					' onclick="return confirm(\'Are you sure to delete this song?\')">
			</div>
		</div>
	</form>';
}

// Copy songs from library files into 'songs' and 'remixes' database tables
function decodeLibraryFile(string $libName): void {
	$songsPath = './data/songs/';
	$libFileName = './data/library/' . $libName . '.gz';

	if (!file_exists($libFileName)) {
		fancyDie(manageError('File "' . $libFileName . '" does not exist.'));
	}

	// Get an array of songs from the library file
	$songsArr = json_decode(gzdecode(file_get_contents($libFileName)));
	if (json_last_error() !== JSON_ERROR_NONE) {
		fancyDie(manageError('File "' . $libFileName . '" has an error: ' . json_last_error_msg()));
	}

	// Start a database transaction to ensure atomicity
	DB::beginTransaction();

	try {
		foreach ($songsArr as $authorObj) {
			$author = $authorObj->author !== '' ? $authorObj->author : null;
			$songs = $authorObj->songs;
			foreach ($songs as $song) {
				$url = isset($song->url) ? (is_array($song->url) ? json_encode($song->url,
					JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : $song->url) : null;
				$codeOriginal = isset($song->code) ? $song->code : (isset($song->fileOrig) ?
					file_get_contents($songsPath . 'original/' . $song->hash . '.js') : null);
				$codeMinified = isset($song->codeMin) ? $song->codeMin : (isset($song->fileMin) ?
					file_get_contents($songsPath . 'minified/' . $song->hash . '.js') : null);
				$codeFormatted = isset($song->fileForm) ?
					file_get_contents($songsPath . 'formatted/' . $song->hash . '.js') : null;
				$drawing = isset($song->drawing) ? json_encode([
					'mode' => $song->drawing->mode,
					'scale' => $song->drawing->scale
				]) : null;
				$tags = isset($song->tags) ? json_encode($song->tags,
					JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;

				// Write the song into 'songs' table
				$sql = "INSERT INTO `songs` (
					`hash`, `author`, `name`, `description`, `url`, `date`, `mode`, `samplerate`, `stereo`, 
					`code`, `code_minified`, `code_formatted`, `cover_name`, `cover_url`, `drawing`, `tags`, 
					`date_added`, `date_edited`
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
				DB::query($sql, [
					$song->hash,
					$author,
					$song->name ?? null,
					$song->description ?? null,
					$url,
					$song->date ?? null,
					$song->mode ?? 'Bytebeat',
					$song->sampleRate ?? 8000,
					isset($song->stereo) ? 1 : 0,
					$codeOriginal,
					$codeMinified,
					$codeFormatted,
					$song->coverName ?? null,
					$song->coverUrl ?? null,
					$drawing,
					$tags,
					$song->date_added ?? null,
					$song->date_edited ?? null]);

				// Write hashes of song remixes into 'remixes' table
				if (isset($song->remix)) {
					foreach ($song->remix as $remix) {
						DB::query(
							"INSERT INTO `remixes` (`song`, `source`) VALUES (?, ?)",
							[$song->hash, $remix->hash]);
					}
				}
			}
		}

		// If everything went well, commit the transaction to save changes
		DB::commit();

	} catch (Exception $e) {
		// If an error occurs, roll back the transaction to avoid partial updates
		DB::rollBack();
		// Re-throw the exception to be handled by the global handler
		throw $e;
	}
}

// Fullfill the database with songs from library files
function filesToDatabase(): string {
	$message = '';
	DB::exec("TRUNCATE TABLE `songs`");
	DB::exec("TRUNCATE TABLE `remixes`");
	$message .= 'Database tables `songs` and `remixes` are cleared.<br>';
	decodeLibraryFile('all');
	$message .= 'Libraries are copied into the `songs` and `remixes` database tables.<br>';
	return manageInfo($message . 'Success!');
}

// Make a gzipped JSON library file from an array of songs
function makeLibraryFile(string $fileName, array $songsByHash, array $songs): void {
	$songsArr = array();

	// Group songs by authors into arrays
	foreach ($songs as $song) {
		$author = isset($song['author']) ? (string)$song['author'] : '';
		if (isset($songsByHash[$song['hash']])) {
			$songsArr[$author][] = $songsByHash[$song['hash']];
		}
	}

	// Make an array of authors and their songs
	$outputData = array();
	foreach ($songsArr as $author => $songsListData) {
		$outputData[] = ['author' => (string)$author, 'songs' => $songsListData];
	}

	// Compress the JSON data into the GZIP file
	file_put_contents($fileName, gzencode(json_encode($outputData,
		JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)));
}

// Making gzipped JSON libraries and big-js songs files from database
function databaseToFiles(): string {
	$message = '';
	$pathLibrary = './data/library/';
	$pathOriginal = './data/songs/original/';
	$pathMinified = './data/songs/minified/';
	$pathFormatted = './data/songs/formatted/';

	// Check and create folders for heavy code files
	$paths = [$pathOriginal, $pathMinified, $pathFormatted];
	foreach ($paths as $path) {
		if (!is_dir($path)) {
			mkdir($path, 0755, true);
			$message .= '"' . $path . '" folder created.<br>';
		}
	}

	// Get all remixes in a single query (JOIN) instead of thousands of queries in a loop
	$remixesRaw = DB::query(
		"SELECT r.song AS song_hash, r.source AS source_hash, s.author, s.name, s.url 
		 FROM remixes r
		 LEFT JOIN songs s ON r.source = s.hash"
	)->fetchAll() ?: [];

	// Group remixes by song hash for fast access
	$remixesBySong = array();
	foreach ($remixesRaw as $row) {
		$remixesBySong[$row['song_hash']][] = [
			'hash' => $row['source_hash'],
			'author' => isset($row['author']) ? (string)$row['author'] : null,
			'name' => $row['name'] ?? null,
			'url' => isset($row['url']) ?
				(str_starts_with($row['url'], '[') ? json_decode($row['url'], true) : $row['url']) : null];
	}
	unset($remixesRaw); // Clear the memory immediately

	// Get all songs from the database (default sorting for the frontend)
	// Streaming read: Request data, but do not call fetchAll()
	// The query() method returns a PDOStatement object that acts as a cursor
	$statement = DB::query("SELECT * FROM `songs` ORDER BY `author`, `date`, `id`");

	$songsByHash = array(); // An array for each song
	$activeHashes = []; // Array for tracking current hashes
	$songsMetadataList = []; // Array containing only metadata (for makeLibraryFile)
	$previewLimit = 512; // Byte limit for song (it will be saved to a file upon exceeding the limit)
	$rowLimit = 8; // Code lines count limit

	// Make an array for each song, save heavy code into files, and prepare data for JSON structure
	// Read the database line by line. Memory is allocated for only a single current record.
	while ($song = $statement->fetch()) {
		$fileMin = 0;
		$fileOrig = 0;
		$fileForm = 0;
		$hash = $song['hash'];
		$songData = ['hash' => $hash];
		$activeHashes[$hash] = true; // Remembering that this song is alive

		// Minified code
		$hasMinified = isset($song['code_minified']) && $song['code_minified'] !== '';
		if ($hasMinified) {
			$codeMinLen = strlen($song['code_minified']);
			$songData['codeMinLen'] = $codeMinLen;
			// If the code exceeds the preview limit, save the file to disk
			if ($codeMinLen > $previewLimit) {
				$fileMinPath = $pathMinified . $hash . '.js';
				// Write to the disk only if the file does not exist or the code has changed
				if (!file_exists($fileMinPath) ||
					file_get_contents($fileMinPath) !== $song['code_minified']
				) {
					file_put_contents($fileMinPath, $song['code_minified']);
				}
				$fileMin = 1;
			} else {
				// Short code — write directly in JSON
				$songData['codeMin'] = $song['code_minified'];
			}
		}

		// Original code
		$hasOriginal = isset($song['code']) && $song['code'] !== '';
		if ($hasOriginal) {
			$codeLen = strlen($song['code']);
			$songData['codeLen'] = $codeLen;
			// If the code exceeds the preview limit OR is multi-line, save the file to disk
			if ($codeLen > $previewLimit || substr_count($song['code'], PHP_EOL) > $rowLimit) {
				$fileOrigPath = $pathOriginal . $hash . '.js';
				// Write to the disk only if the file does not exist or the code has changed
				if (!file_exists($fileOrigPath) || file_get_contents($fileOrigPath) !== $song['code']) {
					file_put_contents($fileOrigPath, $song['code']);
				}
				$fileOrig = 1;
			} else {
				// Shortcode — write directly in JSON
				$songData['code'] = $song['code'];
			}
		}

		// Formatted code (always write it to disk in its entirety)
		if (isset($song['code_formatted']) && $song['code_formatted'] !== '') {
			$fileFormPath = $pathFormatted . $hash . '.js';
			if (!file_exists($fileFormPath) || file_get_contents($fileFormPath) !== $song['code_formatted']) {
				file_put_contents($fileFormPath, $song['code_formatted']);
			}
			$fileForm = 1;
			$songData['codeFormLen'] = strlen($song['code_formatted']);
		}

		// Set flags for external files
		if ($fileOrig) {
			$songData['fileOrig'] = 1;
		}
		if ($fileMin) {
			$songData['fileMin'] = 1;
		}
		if ($fileForm) {
			$songData['fileForm'] = 1;
		}

		// Generate a cropped preview in all.gz for large songs
		// If the song is large or vertical, or has only formatted code (which is always on disk)
		if ($fileMin || $fileOrig || $fileForm) {
			$targetCode = $song['code_minified'] ?? $song['code'] ?? $song['code_formatted'] ?? '';
			// Checking the row count limit
			$lines = explode("\n", $targetCode);
			if (count($lines) > $rowLimit) {
				$previewText = implode("\n", array_slice($lines, 0, $rowLimit));
			} else {
				$previewText = $targetCode;
			}

			// Check the character length limit (in case the strings are long)
			if (strlen($previewText) > $previewLimit) {
				$songData['codeText'] = mb_substr($previewText, 0, $previewLimit);
			} else {
				$songData['codeText'] = $previewText;
			}
			$songData['isTruncated'] = 1;
		}

		// Construct the rest JSON metadata for the song
		$author = isset($song['author']) && $song['author'] !== '' ? (string)$song['author'] : null;
		if ($author !== null) {
			$songData['author'] = $author;
		}
		if (isset($song['name'])) {
			$songData['name'] = $song['name'];
		}
		if (isset($song['description'])) {
			$songData['description'] = $song['description'];
		}
		if (isset($song['url'])) {
			$songData['url'] = str_starts_with($song['url'], '[') ?
				json_decode($song['url'], true) : $song['url'];
		}
		if (isset($song['date'])) {
			$songData['date'] = $song['date'];
		}
		if ($song['mode'] !== 'Bytebeat') {
			$songData['mode'] = $song['mode'];
		}
		$songData['sampleRate'] = (float)$song['samplerate'];
		if (!empty($song['stereo'])) {
			$songData['stereo'] = 1;
		}
		if (isset($remixesBySong[$hash])) {
			$songData['remix'] = $remixesBySong[$hash];
		}
		if (isset($song['cover_name'])) {
			$songData['coverName'] = $song['cover_name'];
		}
		if (isset($song['cover_url'])) {
			$songData['coverUrl'] = $song['cover_url'];
		}
		if (isset($song['drawing'])) {
			$songData['drawing'] = json_decode($song['drawing'], true);
		}
		if (isset($song['tags'])) {
			$songData['tags'] = json_decode($song['tags'], true);
		}
		if (isset($song['date_added'])) {
			$songData['date_added'] = $song['date_added'];
		}
		if (isset($song['date_edited'])) {
			$songData['date_edited'] = $song['date_edited'];
		}

		// Save the song to cache
		$songsByHash[$hash] = $songData;
		// Write a flat structure here, solely for passing to the makeLibraryFile function
		$songsMetadataList[] = ['hash' => $hash, 'author' => $author];
		// Destroy the current iteration variable so that PHP frees up the memory immediately
		unset($song);
	}
	unset($remixesBySong); // Memory is no longer needed

	// Cleanup: remove from the disk only those files that are no longer in the database
	foreach ($paths as $path) {
		$files = glob($path . '/*.js');
		foreach ($files as $file) {
			$filename = basename($file, '.js'); // Get a hash from the file name
			if (!isset($activeHashes[$filename])) {
				unlink($file); // Removing, as this song is no longer in the database
			}
		}
	}
	unset($activeHashes);

	// Create a folder for library files
	if (!is_dir($pathLibrary)) {
		mkdir($pathLibrary, 0755, true);
		$message .= '"' . $pathLibrary . '" folder created.<br>';
	}

	// Generate a single library file with all songs sorted by authors
	$fileName = $pathLibrary . 'all.gz';
	makeLibraryFile($fileName, $songsByHash, $songsMetadataList);

	return manageInfo($message . '"' . $fileName . '" file created.<br>Success!');
}

// Request to add or edit a song in the database
function manageSong(bool $isEdit): string {
	$hash = $isEdit ? $_POST['hash'] : bin2hex(random_bytes(16));
	$author = isset($_POST['author']) ? trim($_POST['author']) : null;
	$author = $author !== '' ? $author : null;
	$name = isset($_POST['name']) ? trim($_POST['name']) : null;
	$name = $name !== '' ? $name : null;
	$description = isset($_POST['description']) ? trim($_POST['description']) : null;
	$description = $description !== '' ? $description : null;
	$date = isset($_POST['date']) ? trim($_POST['date']) : null;
	$date = $date !== '' ? $date : null;
	$mode = $_POST['mode'] ?? 'Bytebeat';
	$sampleRate = trim($_POST['samplerate'] ?? '');
	$sampleRate = $sampleRate && is_numeric($sampleRate) ? (int)$sampleRate : 8000;
	$codeRaw = isset($_POST['code']) ? str_replace("\r", '', $_POST['code']) : '';
	$code = $codeRaw !== '' ? $codeRaw : null;
	$codeMinRaw = isset($_POST['code_minified']) ? str_replace("\r", '', $_POST['code_minified']) : '';
	$codeMinified = $codeMinRaw !== '' ? $codeMinRaw : null;
	$codeFormRaw = isset($_POST['code_formatted']) ? str_replace("\r", '', $_POST['code_formatted']) : '';
	$codeFormatted = $codeFormRaw !== '' ? $codeFormRaw : null;
	$coverName = isset($_POST['cover_name']) ? trim($_POST['cover_name']) : '';
	$coverName = $coverName !== '' ? $coverName : null;
	$coverUrl = isset($_POST['cover_url']) ? trim($_POST['cover_url']) : '';
	$coverUrl = $coverUrl !== '' ? $coverUrl : null;
	$user = $_SESSION['bytebeat_user'] ?? 'System';
	$currentDate = date('Y-m-d');
	$stereo = isset($_POST['stereo']) ? 1 : null;

	// Forming JSON for URLs
	$urlInput = isset($_POST['url']) ? array_filter($_POST['url']) : [];
	$urlStr = null;
	if (!empty($urlInput)) {
		$urlInput = array_values($urlInput); // Сбрасываем ключи массива
		$urlStr = count($urlInput) > 1 ?
			json_encode($urlInput, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : trim($urlInput[0]);
	}

	// Forming JSON for Drawing
	$drawingMode = $_POST['drawing_mode'] ?? '';
	$drawingScale = isset($_POST['drawing_scale']) && is_numeric($_POST['drawing_scale']) ?
		$_POST['drawing_scale'] : null;
	$drawing = null;
	if ($drawingMode || $drawingScale !== null) {
		$drawingData = [];
		if ($drawingMode) {
			$drawingData['mode'] = $drawingMode;
		}
		if ($drawingScale !== null) {
			$drawingData['scale'] = (int)$drawingScale;
		}
		$drawing = json_encode($drawingData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
	}

	// Forming JSON for Tags
	$tagsArr = array();
	$rawCode = isset($_POST['code']) ? $_POST['code'] :
		(isset($_POST['code_formatted']) ? $_POST['code_formatted'] :
		(isset($_POST['code_minified']) ? $_POST['code_minified'] : ''));
	$codeLen = strlen($rawCode);
	if ($codeLen > 0) {
		if ($codeLen <= 256) {
			$tagsArr[] = '256';
		} elseif ($codeLen <= 1024) {
			$tagsArr[] = '1k';
		} else {
			$tagsArr[] = 'big';
		}
	}
	$inputTags = isset($_POST['tags']) ? array_filter($_POST['tags']) : [];
	foreach ($inputTags as $tag) {
		$tagsArr[] = $tag;
	}
	$tagsStr = json_encode(array_values(array_unique($tagsArr)),
		JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

	// Insert or update the song in the database
	if ($isEdit) {
		// Update existed song
		$sql = "UPDATE `songs` SET
			`author` = ?, `name` = ?, `description` = ?, `url` = ?, `date` = ?, `mode` = ?, `sampleRate` = ?,
			`stereo` = ?, `code` = ?, `code_minified` = ?, `code_formatted` = ?, `cover_name` = ?,
			`cover_url` = ?, `drawing` = ?, `tags` = ?, `user_edited` = ?, `date_edited` = ?
		WHERE `hash` = ?";
		DB::query($sql, [
			$author, $name, $description, $urlStr, $date, $mode, $sampleRate, $stereo, $code, $codeMinified, 
			$codeFormatted, $coverName, $coverUrl, $drawing, $tagsStr, $user, $currentDate, $hash]);
	} else {
		// Adding a new song
		$sql = "INSERT INTO `songs` (
			`hash`, `author`, `name`, `description`, `url`, `date`, `mode`, `samplerate`, `stereo`, `code`,
			`code_minified`, `code_formatted`, `cover_name`, `cover_url`, `drawing`, `tags`, `user_added`,
			`date_added`
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		DB::query($sql, [
			$hash, $author, $name, $description, $urlStr, $date, $mode, $sampleRate, $stereo, $code,
			$codeMinified, $codeFormatted, $coverName, $coverUrl, $drawing, $tagsStr, $user, $currentDate]);
	}

	// Handle remixes
	$sources = isset($_POST['remix']) ? array_filter($_POST['remix']) : [];
	// Delete existing remixes for this song
	DB::query("DELETE FROM `remixes` WHERE `song` = ?", [$hash]);
	// Adding sources for remixes into `remixes` table
	foreach ($sources as $source) {
		if ($source) {
			DB::query("INSERT INTO `remixes` (`song`, `source`) VALUES (?, ?)", [$hash, $source]);
		}
	}

	// Return a success message and management panel
	return manageInfo('Song ' . ($isEdit ? 'edited' : 'added') . ' successfully!') . '
		' . makeManagementPanel();
}

// Request to delete a song from the database
function deleteSong(): string {
	$hash = $_POST['hash'];
	DB::query(
		"DELETE FROM `songs`
		WHERE `hash` = ?",
		[$hash]);
	DB::query(
		"DELETE FROM `remixes`
		WHERE `song` = ?",
		[$hash]);
	return manageInfo('Song deleted!') . '
		' . makeManagementPanel();
}

/* ==[ Main ]============================================================================================== */

// Settings initialization
if (!file_exists('settings.php')) {
	fancyDie(manageError('Please copy the file settings.default.php to settings.php'));
}
require 'settings.php';
if (BYTEBEAT_TIMEZONE != '') {
	date_default_timezone_set(BYTEBEAT_TIMEZONE);
}

// Database connection
DB::init(BYTEBEAT_DBHOST, BYTEBEAT_DBNAME, BYTEBEAT_DBUSERNAME, BYTEBEAT_DBPASSWORD);

// Create songs table if not exist
DB::exec("CREATE TABLE IF NOT EXISTS `songs` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`hash` CHAR(32) NOT NULL,
	`author` VARCHAR(255) NULL,
	`name` VARCHAR(255) NULL,
	`description` TEXT NULL,
	`url` TEXT NULL,
	`date` VARCHAR(10) NULL,
	`mode` VARCHAR(20) NULL,
	`samplerate` DOUBLE NULL,
	`stereo` BOOL NULL,
	`code` MEDIUMTEXT NULL,
	`code_minified` MEDIUMTEXT NULL,
	`code_formatted` MEDIUMTEXT NULL,
	`cover_name` VARCHAR(255) NULL,
	`cover_url` TEXT NULL,
	`drawing` VARCHAR(50) NULL,
	`tags` VARCHAR(255) NULL,
	`user_added` VARCHAR(255) NULL,
	`date_added` VARCHAR(10) NULL,
	`user_edited` VARCHAR(255) NULL,
	`date_edited` VARCHAR(10) NULL,
	UNIQUE KEY `hash_idx` (`hash`), -- Instant hash-based search and linking to remixes
	INDEX `sorting_author_date_idx` (`author`, `date`, `id`) -- Speeds up export: ORDER BY author, date, id
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Create remixes table if not exist
DB::exec("CREATE TABLE IF NOT EXISTS `remixes` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`song` CHAR(32) NOT NULL,
	`source` CHAR(32) NOT NULL,
	INDEX `song_idx` (`song`), -- Speeds up DELETE and SELECT when searching for song remixes
	INDEX `source_idx` (`source`) -- Speeds up the search for original tracks
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Create users table if not exist
DB::exec("CREATE TABLE IF NOT EXISTS `users` (
	`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`username` VARCHAR(50) NOT NULL,
	`password_hash` VARCHAR(255) NOT NULL,
	`role` VARCHAR(20) NOT NULL,
	`last_login` BIGINT NOT NULL DEFAULT 0,
	UNIQUE KEY `username_unique` (`username`),
	INDEX `role_username_idx` (`role`, `username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Checking authorization when trying to login
$loginStatus = checkLogin();
$isAdmin = $loginStatus === 'admin';

// CSRF checking for all POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	if (!isset($_POST['manage_password'])) {
		$token = $_SESSION['bytebeat_token'] ?? '';
		if (empty($token) || !hash_equals($token, $_POST['token'] ?? '')) {
			fancyDie(manageError(
				'Security error: Invalid CSRF token.<br>Try refreshing the page or re-logging in.'));
		}
	}
}

// Display the login form if the user is not logged in
if ($loginStatus === 'disabled') {
	fancyDie(makeLoginPage());
}

// Create an admin account if logged in with a temporary password
if ($isAdmin && isset($_SESSION['bytebeat_user']) && $_SESSION['bytebeat_user'] === 'TemporaryAdmin') {
	if (isset($_POST['new_admin_user'], $_POST['new_admin_pass'])) {
		dbAddUser($_POST['new_admin_user'], $_POST['new_admin_pass'], 'admin');
		unset($_SESSION['bytebeat_user']); 
		unset($_SESSION['bytebeat_role']);
		unset($_SESSION['bytebeat_token']); 
		fancyDie(manageInfo('Admin account created!<br>Please log in with new credentials.') . '
		' . makeLoginPage());
	}
	fancyDie(manageError('No admins found in the database.') . '
		' . makeNewAdminForm());
}

// Request to show the main management panel
if (isset($_GET['manage'])) {
	fancyDie(makeManagementPanel());
}

// Logout request
if (isset($_GET['logout'])) {
	deleteSession();
	die('<meta http-equiv="refresh" content="0;url=' . basename($_SERVER['PHP_SELF']) . '?manage">');
}

// Request to show the users manager panel for admin
if (isset($_POST['users_manage']) && $isAdmin) {
	fancyDie(makeUsersManager());
}

// Request to add a new user
if (isset($_POST['user_add']) && $isAdmin) {
	addUser();
}

// Request to delete a user
if (isset($_POST['user_delete']) && $isAdmin) {
	deleteUser();
}

// Request to show the form to change a user's password
if (isset($_POST['user_change_pass_form'])) {
	fancyDie(makeChangePasswForm());
}

// Request to change a user's password
if (isset($_POST['user_change_pass'])) {
	changePassw();
}

// Request to fullfill the database with songs from library files
if (isset($_POST['files_to_db']) && $isAdmin) {
	fancyDie(filesToDatabase());
}

// Request to create library files from database
if (isset($_POST['db_to_files']) && $isAdmin) {
	fancyDie(databaseToFiles());
}

// Request to show the form to add a song
if (isset($_POST['song_add_form'])) {
	fancyDie(makeManageSongForm());
}

// Request to add a song to the database
if (isset($_POST['song_add'])) {
	$resultMessage = manageSong(false); // Save the song to the database
	databaseToFiles(); // Automatically regenerate all.gz
	fancyDie($resultMessage);
}

// Request to call the CSRF request to show form to edit a song
if (isset($_GET['song_edit_call'])) {
	fancyDie(makeEditSongCall());
}

// Request to show the form to edit a song
if (isset($_POST['song_edit_form'])) {
	fancyDie(makeEditSongForm());
}

// Request to edit a song in the database
if (isset($_POST['song_edit'])) {
	$resultMessage = manageSong(true); // Update the song in the database
	databaseToFiles(); // Automatically regenerate all.gz
	fancyDie($resultMessage);
}

// Request to delete a song from the database
if (isset($_POST['song_delete'])) {
	$resultMessage = deleteSong(); // Remove the song from the database
	databaseToFiles(); // Automatically cleaning up files for this song
	fancyDie($resultMessage);
}

// Redirection to Bytebeat Player page
header('Location: index.html', true, 303);
exit();
