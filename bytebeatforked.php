<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Session initialization
ini_set('session.gc_maxlifetime', 2592000); // 30 days
session_set_cookie_params(2592000); // store session cookie for 30 days
session_start();
setcookie(session_name(), session_id(), ['expires' => time() + 2592000, 'samesite' => 'Strict']);
ob_implicit_flush();
if (function_exists('ob_get_level')) {
	while (ob_get_level() > 0) {
		ob_end_flush();
	}
}

/* ==[ Functions ]========================================================================================= */

// Displaying messages
function fancyDie($message) {
	die('<!DOCTYPE html>

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Bytebeat management</title>
	<link rel="canonical" href="https://dollchan.net/bytebeat/">
	<link rel="shortcut icon" href="favicon.png">
	<link rel="stylesheet" type="text/css" href="style.css?version=2025120400">
</head>
<body style="text-align: center;">
	<div style="display: inline-block; padding: 8px 0;">
		' . $message . '
	</div>
	<br>
	<hr>
	[<a href="https://github.com/SthephanShinkufag/bytebeat-composer/wiki/Library-moderation-instructions">Instructions</a>]
	[<a href="./">Go to player</a>]
	[<a href="javascript: window.history.go(-1);">Return</a>]
</body>
</html>');
}

// Login form
function showLoginPage() {
	return '<fieldset>
			<legend align="center">Enter an administrator password</legend>
			<form name="form_login" method="post" action="?manage">
				<input type="password" name="managepassword">
				<input type="submit" value="Log In">
			</form>
		</fieldset>';
}

// Logout
function logoutRequest() {
	setcookie('bytebeat_access', '', time() - 3600, '/');
	unset($_COOKIE['bytebeat_access']);
	$_SESSION['bytebeat'] = '';
	session_destroy();
	die('<meta http-equiv="refresh" content="0;url=' . basename($_SERVER['PHP_SELF']) . '?manage">');
}

// Management panel
function managementRequest() {
	return '<fieldset style="display: flex; flex-direction: column;gap: 4px;">
			<legend align="center">Select an action to manage the library</legend>
			<a href="?addsong_request" class="control-button">Add a song</a>' .
			(!BYTEBEAT_DBMAKE ? '' : '
			<a href="?files_to_db" class="control-button" onclick="return confirm(\'Are you sure to copy songs from library files into the database?\')">Make database</a>') . '
			<a href="?db_to_files" class="control-button">Make library files</a>
			<a href="?logout" class="control-button">Logout</a>
		</fieldset>';
}

// Generating the form for adding/editing a song to the database
function addSongForm() {
	return '<fieldset>
			<legend align="center">Adding a song</legend>
			<form name="form_addsong" method="post" action="?addsong">
				<table class="table-form"><tbody>
					<tr>
						<th>Author, date</th>
						<td>
							<input type="text" name="author">
							<input type="date" name="date" placeholder="yyyy-mm-dd">
						</td>
					</tr>
					<tr>
						<th>Name</th>
						<td><input type="text" name="name"></td>
					</tr>
					<tr>
						<th>URL</th>
						<td class="table-form-added"><div>
							<input type="text" name="url[]" placeholder="URL">
							<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
						</div></td>
					</tr>
					<tr>
						<th>Description</th>
						<td><textarea name="description"></textarea></td>
					</tr>
					<tr>
						<th>Mode</th>
						<td>
							<select name="mode">
								<option value="Bytebeat">Bytebeat</option>
								<option value="Signed Bytebeat">Signed Bytebeat</option>
								<option value="Floatbeat">Floatbeat</option>
								<option value="Funcbeat">Funcbeat</option>
							</select>
							<input type="text" name="samplerate" placeholder="Sample rate (Hz)">
							<label style="white-space: nowrap;"><input type="checkbox" name="stereo"> Stereo</label>
						</td>
					</tr>
					<tr>
						<th>Remix source</th>
						<td class="table-form-added"><div>
							<input type="text" name="remix[]" placeholder="Remix source song hash">
							<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
						</div></td>
					</tr>
					<tr>
						<th>Cover source</th>
						<td>
							<input type="text" name="cover_name" placeholder="Cover source name">
							<input type="text" name="cover_url" placeholder="Cover source URL">
						</td>
					</tr>
					<tr>
						<th>Original code</th>
						<td><textarea name="code"></textarea></td>
					</tr>
					<tr>
						<th>Minified code</th>
						<td><textarea name="code_minified"></textarea></td>
					</tr>
					<tr>
						<th>Formatted code</th>
						<td><textarea name="code_formatted"></textarea></td>
					</tr>
					<tr>
						<th>Draw mode/scale</th>
						<td style="display: flex; gap: 4px;">
							<select name="drawing_mode">
								<option value="">None</option>
								<option value="Points">Points</option>
								<option value="Waveform">Waveform</option>
								<option value="Diagram">Diagram</option>
								<option value="Combined">Combined</option>
							</select>
							<input type="text" name="drawing_scale" placeholder="1=1/2, 2=1/4, 3=1/8 ...">
						</td>
					</tr>
					<tr>
						<th>Tags</th>
						<td class="table-form-added"><div>
							<input type="text" name="tags[]" placeholder="Tag">
							<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
						</div></td>
					</tr>
					<tr><td><input type="submit" value="Submit"></td><td></td></tr>
				</tbody></table>
			</form>
		</fieldset>';
}

// Generating the form to edit a song in the database
function editSongForm() {
	$dbLink = getDBLink();
	if (!isset($_GET['hash'])) {
		return 'Song with hash = "" not found!';
	}
	$hash = trim($_GET['hash']);
	
	// Validate hash format (32 hex characters)
	if (!preg_match('/^[a-f0-9]{32}$/i', $hash)) {
		return 'Invalid hash format!';
	}

	// Get a song by hash from the database using prepared statement
	$stmt = $dbLink->prepare('SELECT * FROM `songs` WHERE `hash` = ? LIMIT 1');
	if (!$stmt) {
		return 'Database error: ' . $dbLink->error;
	}
	$stmt->bind_param('s', $hash);
	$stmt->execute();
	$songs = $stmt->get_result();
	
	if ($songs->num_rows === 0) {
		return 'Song with hash = "' . htmlspecialchars($hash) . '" not found!';
	}
	
	while ($song = $songs->fetch_assoc()) {
		// Make URL fields
		$urlStr = '';
		$url = $song['url'];
		if (isset($url) && str_starts_with($url, '["')) {
			$urlArr = json_decode($url);
			if (json_last_error() === JSON_ERROR_NONE && is_array($urlArr)) {
				foreach ($urlArr as $url_) {
					$urlStr .= '<div>
							<input type="text" name="url[]" placeholder="URL" value="' . htmlspecialchars($url_) . '">
							<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
						</div>';
				}
			}
		} else {
			$urlStr .= '<div>
							<input type="text" name="url[]" placeholder="URL" value="' . htmlspecialchars($url) . '">
							<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
						</div>';
		}

		// Make tags fields
		$tagsStr = '';
		$tags = json_decode($song['tags']);
		if (json_last_error() === JSON_ERROR_NONE && is_array($tags)) {
			foreach ($tags as $tag) {
				$tagsStr .= '<div>
							<input type="text" name="tags[]" placeholder="Tag" value="' . htmlspecialchars($tag) . '">
							<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
						</div>';
			}
		}

		// Find if the song is a remix then get sources hashes using prepared statement
		$remixStr = '';
		$stmtRemix = $dbLink->prepare('SELECT * FROM `remixes` WHERE `song` = ?');
		$stmtRemix->bind_param('s', $hash);
		$stmtRemix->execute();
		$remixResult = $stmtRemix->get_result();
		
		if ($remixResult->num_rows !== 0) {
			while ($remixSource = $remixResult->fetch_assoc()) {
				$remixStr .= '<div>
							<input type="text" name="remix[]" placeholder="Remix source song hash" value="' .
								htmlspecialchars($remixSource['source']) . '">
							<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
						</div>';
			}
		} else {
			$remixStr = '<div>
							<input type="text" name="remix[]" placeholder="Remix source song hash">
							<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
						</div>';
		}

		// Parsing the drawing mode
		$drawing_mode = '';
		$drawing_scale = '';
		if (isset($song['drawing'])) {
			$drawing = json_decode($song['drawing']);
			if (json_last_error() === JSON_ERROR_NONE) {
				$drawing_mode = $drawing->mode ?? '';
				$drawing_scale = $drawing->scale ?? '';
			}
		}

		// Form generation
		return '<fieldset>
			<legend align="center">Editing a song</legend>
			<form name="form_editsong" method="post" action="?editsong">
				<table class="table-form"><tbody>
					<tr>
						<th>Hash</th>
						<td><input type="text" name="hash" value="' . htmlspecialchars($hash) . '" readonly></td>
					</tr>
					<tr>
						<th>Author, date</th>
						<td>
							<input type="text" name="author" value="' .
								(isset($song['author']) ? htmlspecialchars($song['author']) : '') . '">
							<input type="date" name="date" placeholder="yyyy-mm-dd" value="' .
								htmlspecialchars($song['date']) . '">
						</td>
					</tr>
					<tr>
						<th>Name</th>
						<td><input type="text" name="name" value="' .
							(isset($song['name']) ? htmlspecialchars($song['name']) : '') . '"></td>
					</tr>
					<tr>
						<th>URL</th>
						<td class="table-form-added">' . $urlStr . '</td>
					</tr>
					<tr>
						<th>Description</th>
						<td><textarea name="description">' .
							(isset($song['description']) ? htmlspecialchars($song['description']) : '') .
							'</textarea></td>
					</tr>
					<tr>
						<th>Mode</th>
						<td>
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
								htmlspecialchars($song['samplerate']) . '" placeholder="Sample rate (Hz)">
							<label style="white-space: nowrap;"><input type="checkbox" name="stereo"' .
								($song['stereo'] ? ' checked' : '') . '> Stereo</label>
						</td>
					</tr>
					<tr>
						<th>Remix source</th>
						<td class="table-form-added">' . $remixStr .  '</td>
					</tr>
					<tr>
						<th>Cover source</th>
						<td>
							<input type="text" name="cover_name" value="' .
								(isset($song['cover_name']) ? htmlspecialchars($song['cover_name']) : '') .
								'" placeholder="Cover source name">
							<input type="text" name="cover_url" value="' .
								htmlspecialchars($song['cover_url']) . '" placeholder="Cover source URL">
						</td>
					</tr>
					<tr>
						<th>Original code</th>
						<td><textarea name="code">' . htmlspecialchars($song['code']) . '</textarea></td>
					</tr>
					<tr>
						<th>Minified code</th>
						<td><textarea name="code_minified">' . htmlspecialchars($song['code_minified']) . '</textarea></td>
					</tr>
					<tr>
						<th>Formatted code</th>
						<td><textarea name="code_formatted">' . htmlspecialchars($song['code_formatted']) . '</textarea></td>
					</tr>
					<tr>
						<th>Draw mode/scale</th>
						<td>
							<select name="drawing_mode">
								<option value=""' . (!$drawing_mode ? ' selected' : '') . '>None</option>
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
								htmlspecialchars($drawing_scale) . '">
						</td>
					</tr>
					<tr>
						<th>Tags</th>
						<td class="table-form-added">' . $tagsStr .'</td>
					</tr>
				</tbody></table>
				<input type="submit" value="Submit changes" style="float: left; margin: 2px;">
			</form>
			<form name="form_deletesong" method="post" action="?deletesong">
				<input type="hidden" name="hash" value="' . htmlspecialchars($hash) . '">
				<input type="submit" value="Delete song" style="float: left; margin: 2px;" onclick="return confirm(\'Are you sure to delete this song?\')">
			</form>
		</fieldset>';
	}
}

// Copy songs from library files into 'songs' and 'remixes' database tables
function decodeLibraryFile($dbLink, $libName) {
	$songsPath = './data/songs/';
	$libFileName = './data/library/' . preg_replace('/[^a-z0-9_-]/', '', $libName) . '.gz';

	// Check for a valid JSON string from GZIP file and get an array of songs
	if (!file_exists($libFileName)) {
		fancyDie('File "' . htmlspecialchars($libFileName) . '" does not exist.');
	}
	$songssArr = json_decode(gzdecode(file_get_contents($libFileName)));
	if (json_last_error() !== JSON_ERROR_NONE) {
		fancyDie('File "' . htmlspecialchars($libFileName) . '" has an error: ' . json_last_error_msg());
	}

	// Write each song into database using prepared statements
	foreach ($songssArr as $authorObj) {
		$author = $authorObj->author;
		$songs = $authorObj->songs;
		foreach ($songs as $song) {
			$url = isset($song->url) ?
				(is_array($song->url) ? '["' . implode('","', array_map('addslashes', $song->url)) . '"]' : $song->url) : NULL;
			$codeOriginal = isset($song->code) ? $song->code : (isset($song->fileOrig) ?
				file_get_contents($songsPath . 'original/' . $song->hash . '.js') : NULL);
			$codeMinified = isset($song->codeMin) ? $song->codeMin : (isset($song->fileMin) ?
				file_get_contents($songsPath . 'minified/' . $song->hash . '.js') : NULL);
			$codeFormatted = isset($song->fileForm) ?
				file_get_contents($songsPath . 'formatted/' . $song->hash . '.js') : NULL;

			// Prepare values
			$hash = $song->hash;
			$name = $song->name ?? NULL;
			$description = $song->description ?? NULL;
			$date = $song->date ?? NULL;
			$mode = $song->mode ?? 'Bytebeat';
			$samplerate = $song->sampleRate ?? 8000;
			$stereo = $song->stereo ?? 0;
			$coverName = $song->coverName ?? NULL;
			$coverUrl = $song->coverUrl ?? NULL;
			$drawing = isset($song->drawing) ? json_encode($song->drawing) : NULL;
			$tags = json_encode($song->tags ?? []);
			$dateAdded = $song->date_added ?? NULL;
			$dateEdited = $song->date_edited ?? NULL;

			// Insert using prepared statement
			$stmt = $dbLink->prepare(
				'INSERT INTO `songs` (hash, author, name, description, url, date, mode, samplerate, stereo, code, code_minified, code_formatted, cover_name, cover_url, drawing, tags, date_added, date_edited)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
			);
			
			$stmt->bind_param(
				'sssssssdisssssss',
				$hash, $author, $name, $description, $url, $date, $mode, $samplerate, $stereo,
				$codeOriginal, $codeMinified, $codeFormatted, $coverName, $coverUrl, $drawing, $tags, $dateAdded, $dateEdited
			);
			
			$stmt->execute();

			// Find remixes of songs and write to 'remixes' database table
			if (isset($song->remix)) {
				$remixes = $song->remix;
				$stmtRemix = $dbLink->prepare('INSERT INTO `remixes` (song, source) VALUES (?, ?)');
				foreach ($remixes as $remix) {
					$remixHash = $remix->hash;
					$stmtRemix->bind_param('ss', $hash, $remixHash);
					$stmtRemix->execute();
				}
				$stmtRemix->close();
			}
		}
	}
}

// Access to the database
function getDBLink() {
	if (!function_exists('mysqli_connect')) {
		fancyDie('MySQLi library is not installed');
	}
	$dbLink = @mysqli_connect(BYTEBEAT_DBHOST, BYTEBEAT_DBUSERNAME, BYTEBEAT_DBPASSWORD, BYTEBEAT_DBNAME);
	if (!$dbLink) {
		fancyDie('Could not connect to database: ' . (is_object($dbLink) ? mysqli_error($dbLink) :
			(($dbLinkError = mysqli_connect_error()) ? $dbLinkError : '(unknown error)')));
	}
	return $dbLink;
}

// Copy songs from library files into the database
function filesToDatabase() {
	$message = '';
	$dbLink = getDBLink();

	// Create new databases if not exist
	if (mysqli_num_rows(mysqli_query($dbLink, 'SHOW TABLES LIKE "songs";')) === 0) {
		mysqli_query($dbLink,
			'CREATE TABLE songs (
				`id` INT(10) UNSIGNED auto_increment NOT NULL,
				`hash` CHAR(32) NULL,
				`author` TEXT NULL,
				`name` VARCHAR(255) NULL,
				`description` TEXT NULL,
				`url` TEXT NULL,
				`date` VARCHAR(10) NULL,
				`mode` VARCHAR(20) NULL,
				`samplerate` DOUBLE NULL,
				`stereo` BOOL NULL,
				`code` MEDIUMTEXT NULL,
				`code_minified` TEXT NULL,
				`code_formatted` MEDIUMTEXT NULL,
				`cover_name` VARCHAR(255) NULL,
				`cover_url` TEXT NULL,
				`drawing` VARCHAR(50) NULL,
				`tags` VARCHAR(255) NULL,
				`user_added` VARCHAR(255) NULL,
				`date_added` VARCHAR(10) NULL,
				`user_edited` VARCHAR(255) NULL,
				`date_edited` VARCHAR(10) NULL,
				PRIMARY KEY (id),
				KEY `hash` (hash)
			)
			DEFAULT CHARSET = utf8mb4
			COLLATE = utf8mb4_0900_ai_ci;');
		mysqli_query($dbLink,
			'CREATE TABLE remixes (
				`id` INT(10) UNSIGNED auto_increment NOT NULL,
				`song` CHAR(32) NOT NULL,
				`source` CHAR(32) NOT NULL,
				PRIMARY KEY (id)
			)
			DEFAULT CHARSET = utf8mb4
			COLLATE = utf8mb4_0900_ai_ci;');
		$message .= 'Database tables `songs` and `remixes` created.<br>';
	} else {
		// Clear existed tables
		mysqli_query($dbLink, 'TRUNCATE TABLE songs;');
		mysqli_query($dbLink, 'TRUNCATE TABLE remixes;');
		$message .= 'Database tables `songs` and `remixes` are cleared.<br>';
	}

	// Copy songs from library files into 'songs' and 'remixes' database tables
	decodeLibraryFile($dbLink, 'all');
	$message .= 'Libraries are copied into the `songs` and `remixes` database tables.<br>';

	mysqli_close($dbLink);
	return $message . 'Success!';
}

// Create gzipped JSON file on query from database
function makeLibraryFile($fileName, $songsByHash, $qResult) {
	$songsArr = array();
	// Group songs by authors into arrays
	while ($song = mysqli_fetch_assoc($qResult)) {
		if (isset($song['author'])) {
			$songsArr[$song['author']][] = $song['hash'];
		} else {
			$songsArr[''][] = $song['hash'];
		}
	}
	// Make JSON string
	$outputStr = '';
	foreach ($songsArr as $author => $hashes) {
		$songsStr = '';
		foreach ($hashes as $hash) {
			$songsStr .= ($songsStr ? ',' : '') . $songsByHash[$hash];
		}
		// Making an object for author and all of his songs
		$outputStr .= ($outputStr ? ',' : '') .
			'{"author":' . json_encode($author) . ',"songs":[' . $songsStr . ']}';
	}
	// Compress the JSON string into the GZIP file
	file_put_contents($fileName, gzencode('[' . $outputStr . ']'));
}

// Making gzipped JSON libraries and big-js songs files from database
function databaseToFiles() {
	$message = '';
	$dbLink = getDBLink();
	$pathLibrary = './data/library/';
	$pathOriginal = './data/songs/original/';
	$pathMinified = './data/songs/minified/';
	$pathFormatted = './data/songs/formatted/';

	// Create/clear folders for large songs
	if (!is_dir($pathOriginal)) {
		mkdir($pathOriginal, 0755, true);
		$message .= '"' . htmlspecialchars($pathOriginal) . '" folder created.<br>';
	} else {
		array_map('unlink', glob($pathOriginal . '/*.*'));
	}
	if (!is_dir($pathMinified)) {
		mkdir($pathMinified, 0755, true);
		$message .= '"' . htmlspecialchars($pathMinified) . '" folder created.<br>';
	} else {
		array_map('unlink', glob($pathMinified . '/*.*'));
	}
	if (!is_dir($pathFormatted)) {
		mkdir($pathFormatted, 0755, true);
		$message .= '"' . htmlspecialchars($pathFormatted) . '" folder created.<br>';
	} else {
		array_map('unlink', glob($pathFormatted . '/*.*'));
	}

	// Get songs from database
	$qResult = mysqli_query($dbLink,
		'SELECT
			`hash`,
			`author`,
			`name`,
			`description`,
			`url`,
			`date`,
			`mode`,
			`samplerate`,
			`stereo`,
			`code`,
			`code_minified`,
			`code_formatted`,
			`cover_name`,
			`cover_url`,
			`drawing`,
			`tags`,
			`user_added`,
			`date_added`,
			`user_edited`,
			`date_edited`
		FROM songs ORDER BY `author`, `date`, `id`;');

	// Create a json string for each song and put it into an associative array by hash
	$songsByHash = array();
	while ($song = mysqli_fetch_assoc($qResult)) {
		$fileMin = 0;
		$fileOrig = 0;
		$fileForm = 0;
		if (isset($song['code_minified']) && mb_strlen($song['code_minified']) > 1024) {
			// Save minified larger than 1024 bytes code into file
			file_put_contents($pathMinified . $song['hash'] . '.js', $song['code_minified']);
			$fileMin = 1;
		}
		if (isset($song['code']) &&
			(substr_count($song['code'], PHP_EOL) > 8 || mb_strlen($song['code']) > 1024)
		) {
			// Save original code larger than 1024 bytes or 8 lines into file
			file_put_contents($pathOriginal . $song['hash'] . '.js', $song['code']);
			$fileOrig = 1;
		}
		if (isset($song['code_formatted'])) {
			// Save formatted code into file
			file_put_contents($pathFormatted . $song['hash'] . '.js', $song['code_formatted']);
			$fileForm = 1;
		}
		// Finding remixes using prepared statement
		$remixStr = '';
		$sourcesArr = array();
		$hash = $song['hash'];
		$stmtSources = $dbLink->prepare('SELECT `source` FROM remixes WHERE `song` = ?');
		$stmtSources->bind_param('s', $hash);
		$stmtSources->execute();
		$qSources = $stmtSources->get_result();
		
		if ($qSources->num_rows !== 0) {
			while ($source = $qSources->fetch_assoc()) {
				$sourcesArr[] = $source['source'];
			}
		}
		// Finding sources for remixes
		foreach ($sourcesArr as $sourceHash) {
			$stmtSource = $dbLink->prepare('SELECT `author`, `name`, `url` FROM songs WHERE `hash` = ?');
			$stmtSource->bind_param('s', $sourceHash);
			$stmtSource->execute();
			$qSource = $stmtSource->get_result();
			
			if ($qSource->num_rows !== 0) {
				while ($source = $qSource->fetch_assoc()) {
					$remixStr .= ($remixStr ? ',' : '') . '{"hash":"' . $sourceHash . '"' .
						(isset($source['author']) ? ', "author":' . json_encode($source['author']) : '') .
						(isset($source['name']) ? ', "name":' . json_encode($source['name']) : '') .
						(isset($source['url']) ? ', "url":' . json_encode($source['url']) : '') . '}';
				}
			}
			$stmtSource->close();
		}
		$stmtSources->close();
		
		// Making a json string for a song
		$songsByHash[$song['hash']] = '{"hash":"' . $song['hash'] . '"' .
			(isset($song['name']) ? ',"name":' . json_encode($song['name']) : '') .
			(isset($song['description']) ? ',"description":' . json_encode($song['description']) : '') .
			(isset($song['url']) ? ',"url":' . (str_starts_with($song['url'], '[') ?
				$song['url'] : '"' . $song['url'] . '"') : '') .
			(isset($song['date']) ? ',"date":"' . $song['date'] . '"' : '') .
			($song['mode'] !== 'Bytebeat' ? ',"mode":"' . $song['mode'] . '"' : '') .
			',"sampleRate":' . $song['samplerate'] .
			(isset($song['stereo']) ? ',"stereo":1' : '') .
			($fileOrig ? ',"fileOrig":1' :
				(isset($song['code']) ? ',"code":' . json_encode($song['code']) : '')) .
			(isset($song['code']) ? ',"codeLen":' . strlen($song['code']) : '') .
			($fileMin ? ',"fileMin":1' : (isset($song['code_minified']) ?
				',"codeMin":' . json_encode($song['code_minified']) : '')) .
			(isset($song['code_minified']) ? ',"codeMinLen":' . strlen($song['code_minified']): '') .
			($fileForm ? ',"fileForm":1,"codeFormLen":' . strlen($song['code_formatted']) : '') .
			($remixStr ? ',"remix":[' . $remixStr . ']' : '') .
			(isset($song['cover_name']) ? ',"coverName":' . json_encode($song['cover_name']) : '') .
			(isset($song['cover_url']) ? ',"coverUrl":"' . $song['cover_url'] . '"' : '') .
			(isset($song['drawing']) ? ',"drawing":' . $song['drawing'] : '') .
			(isset($song['tags']) ? ',"tags":' . $song['tags'] : '') .
			(isset($song['date_added']) ? ',"date_added": "' . $song['date_added'] . '"' : '') .
			(isset($song['date_edited']) ? ',"date_edited": "' . $song['date_edited'] . '"' : '') .
		'}';
	}

	// Create/clear folder for library files
	if (!is_dir($pathLibrary)) {
		mkdir($pathLibrary, 0755, true);
		$message .= '"' . htmlspecialchars($pathLibrary) . '" folder created.<br>';
	} else {
		array_map('unlink', glob($pathLibrary . '/*.*'));
	}

	// Library file with all songs sorted by authors
	$fileName = $pathLibrary . 'all.gz';
	makeLibraryFile($fileName, $songsByHash, mysqli_query($dbLink,
		'SELECT `hash`, `author` FROM songs
		ORDER BY `author`, `date`, `id`;'));

	// Library file with recently added songs sorted by authors
	$fileName = $pathLibrary . 'recent.gz';
	makeLibraryFile($fileName, $songsByHash, mysqli_query($dbLink,
		'SELECT `hash`, `author` FROM songs
		WHERE `date_added` IS NOT NULL
		ORDER BY `author`, `date`, `id`;'));

	// Library file with c-compatible songs
	$fileName = $pathLibrary . 'classic.gz';
	makeLibraryFile($fileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE `tags` LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));

	// Library file with JS songs under 256b
	$fileName = $pathLibrary . 'js-256.gz';
	makeLibraryFile($fileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE (`mode` = 'Bytebeat' OR `mode` = 'Signed Bytebeat')
			AND `tags` LIKE '%\"256\"%'
			AND `tags` NOT LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));

	// Library file with JS songs under 1k
	$fileName = $pathLibrary . 'js-1k.gz';
	makeLibraryFile($fileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE (`mode` = 'Bytebeat' OR `mode` = 'Signed Bytebeat')
			AND `tags` LIKE '%\"1k\"%'
			AND `tags` NOT LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));

	// Library file with big JS songs
	$fileName = $pathLibrary . 'js-big.gz';
	makeLibraryFile($fileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE (`mode` = 'Bytebeat' OR `mode` = 'Signed Bytebeat')
			AND `tags` NOT LIKE '%\"256\"%'
			AND `tags` NOT LIKE '%\"1k\"%'
			AND `tags` NOT LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));

	// Library file with Floatbeat mode songs
	$fileName = $pathLibrary . 'floatbeat.gz';
	makeLibraryFile($fileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE `mode` = 'Floatbeat'
			AND `tags` NOT LIKE '%\"big\"%'
		ORDER BY `date`, `author`, `id`;"));

	// Library file with Floatbeat mode songs (big)
	$fileName = $pathLibrary . 'floatbeat-big.gz';
	makeLibraryFile($fileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE `mode` = 'Floatbeat'
			AND `tags` NOT LIKE '%\"256\"%'
			AND `tags` NOT LIKE '%\"1k\"%'
		ORDER BY `date`, `author`, `id`;"));

	// Library file with Funcbeat mode songs
	$fileName = $pathLibrary . 'funcbeat.gz';
	makeLibraryFile($fileName, $songsByHash, mysqli_query($dbLink,
		'SELECT `hash`, `author` FROM songs
		WHERE `mode` = "Funcbeat"
		ORDER BY `date`, `author`, `id`;'));

	mysqli_close($dbLink);
	return $message . '"' . htmlspecialchars($pathLibrary) . '*.gz" files created.<br>Success!';
}

// Request to add a song to the database
function addSong($isEdit) {
	global $bytebeat_admins;
	$dbLink = getDBLink();

	// Validate and sanitize inputs
	$hash = $isEdit ? trim($_POST['hash']) : bin2hex(random_bytes(16));
	
	if ($isEdit && !preg_match('/^[a-f0-9]{32}$/i', $hash)) {
		return 'Invalid hash format!';
	}

	$author = trim($_POST['author'] ?? '');
	$name = trim($_POST['name'] ?? '');
	$description = trim($_POST['description'] ?? '');
	$url = array_filter($_POST['url'] ?? []);
	$date = trim($_POST['date'] ?? '');
	$mode = $_POST['mode'] ?? 'Bytebeat';
	$sampleRate = trim($_POST['samplerate'] ?? '8000');
	$sampleRate = is_numeric($sampleRate) ? floatval($sampleRate) : 8000;
	$code = str_replace("\r", '', $_POST['code'] ?? '');
	$codeMinified = str_replace("\r", '', $_POST['code_minified'] ?? '');
	$codeFormatted = str_replace("\r", '', $_POST['code_formatted'] ?? '');
	$coverName = trim($_POST['cover_name'] ?? '');
	$coverUrl = trim($_POST['cover_url'] ?? '');
	$stereo = isset($_POST['stereo']) ? 1 : 0;
	$user = array_search($_SESSION['bytebeat'], $bytebeat_admins, true);
	$dateEdited = date('Y-m-d');

	// Process URLs
	$urlStr = NULL;
	if (!empty($url)) {
		$urlStr = count($url) > 1 ? '["' . implode('","', array_map(function($u) { return trim($u); }, $url)) . '"]' : trim($url[0]);
	}

	// Drawing
	$drawingMode = $_POST['drawing_mode'] ?? '';
	$drawingScale = trim($_POST['drawing_scale'] ?? '');
	$drawingScale = is_numeric($drawingScale) ? $drawingScale : NULL;
	$drawing = NULL;
	if ($drawingMode || isset($drawingScale)) {
		$drawing = json_encode([
			'mode' => $drawingMode ?: null,
			'scale' => $drawingScale
		]);
	}

	// Set tags field
	$tagsArr = array();
	$codeLen = strlen($code) ?: (strlen($codeFormatted) ?: strlen($codeMinified));
	if ($codeLen) {
		if ($codeLen <= 256) {
			$tagsArr[] = '256';
		} elseif ($codeLen <= 1024) {
			$tagsArr[] = '1k';
		} else {
			$tagsArr[] = 'big';
		}
	}
	$tags = array_filter($_POST['tags'] ?? []);
	foreach ($tags as $tag) {
		$tagsArr[] = trim($tag);
	}
	$tagsStr = json_encode(array_unique($tagsArr));

	// Validate mode
	$validModes = ['Bytebeat', 'Signed Bytebeat', 'Floatbeat', 'Funcbeat'];
	if (!in_array($mode, $validModes)) {
		return 'Invalid mode!';
	}

	if ($isEdit) {
		// Update existed song
		$stmt = $dbLink->prepare(
			'UPDATE `songs` SET
				`author` = ?,
				`name` = ?,
				`description` = ?,
				`url` = ?,
				`date` = ?,
				`mode` = ?,
				`samplerate` = ?,
				`stereo` = ?,
				`code` = ?,
				`code_minified` = ?,
				`code_formatted` = ?,
				`cover_name` = ?,
				`cover_url` = ?,
				`drawing` = ?,
				`tags` = ?,
				`user_edited` = ?,
				`date_edited` = ?
			WHERE `hash` = ?'
		);
		
		if (!$stmt) {
			return 'Database error: ' . $dbLink->error;
		}
		
		$stmt->bind_param(
			'ssssssdisssssss',
			$author, $name, $description, $urlStr, $date, $mode, $sampleRate, $stereo,
			$code, $codeMinified, $codeFormatted, $coverName, $coverUrl, $drawing, $tagsStr, $user, $dateEdited, $hash
		);
		$stmt->execute();
		$stmt->close();
	} else {
		// Adding a new song
		$stmt = $dbLink->prepare(
			'INSERT INTO `songs` (
				`hash`, `author`, `name`, `description`, `url`, `date`, `mode`, `samplerate`, `stereo`,
				`code`, `code_minified`, `code_formatted`, `cover_name`, `cover_url`, `drawing`, `tags`,
				`user_added`, `date_added`
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
		);
		
		if (!$stmt) {
			return 'Database error: ' . $dbLink->error;
		}
		
		$stmt->bind_param(
			'ssssssdisssssss',
			$hash, $author, $name, $description, $urlStr, $date, $mode, $sampleRate, $stereo,
			$code, $codeMinified, $codeFormatted, $coverName, $coverUrl, $drawing, $tagsStr, $user, $dateEdited
		);
		$stmt->execute();
		$stmt->close();
	}

	// Handle remix sources
	$stmtDelete = $dbLink->prepare('DELETE FROM `remixes` WHERE `song` = ?');
	$stmtDelete->bind_param('s', $hash);
	$stmtDelete->execute();
	$stmtDelete->close();

	$sources = $_POST['remix'] ?? [];
	$stmtInsertRemix = $dbLink->prepare('INSERT INTO `remixes` (song, source) VALUES (?, ?)');
	
	foreach ($sources as $source) {
		$source = trim($source);
		if ($source && preg_match('/^[a-f0-9]{32}$/i', $source)) {
			$stmtInsertRemix->bind_param('ss', $hash, $source);
			$stmtInsertRemix->execute();
		}
	}
	$stmtInsertRemix->close();

	mysqli_close($dbLink);
	return 'Song ' . ($isEdit ? 'edited' : 'added') . ' successfully!<br>' . managementRequest();
}

// Request to delete a song from the database
function deleteSong() {
	$dbLink = getDBLink();
	$hash = trim($_POST['hash'] ?? '');
	
	// Validate hash format
	if (!preg_match('/^[a-f0-9]{32}$/i', $hash)) {
		return 'Invalid hash format!';
	}
	
	$stmt = $dbLink->prepare('DELETE FROM `songs` WHERE `hash` = ?');
	$stmt->bind_param('s', $hash);
	$stmt->execute();
	$stmt->close();
	
	$stmtRemix = $dbLink->prepare('DELETE FROM `remixes` WHERE `song` = ?');
	$stmtRemix->bind_param('s', $hash);
	$stmtRemix->execute();
	$stmtRemix->close();
	
	mysqli_close($dbLink);
	return 'Song deleted!<br>' . managementRequest();
}

/* ==[ Main ]============================================================================================== */

// Settings initialization
if (!file_exists('settings.php')) {
	fancyDie('Please copy the file settings.default.php to settings.php');
}
require 'settings.php';
if (BYTEBEAT_TIMEZONE != '') {
	date_default_timezone_set(BYTEBEAT_TIMEZONE);
}
global $bytebeat_admins;
if (!isset($bytebeat_admins) || !is_array($bytebeat_admins) || !count($bytebeat_admins)) {
	fancyDie('settings.php: $bytebeat_admins array must be configured.');
}

// Checking authorization when trying to login
if (isset($_POST['managepassword'])) {
	$providedPassword = $_POST['managepassword'];
	$providedName = array_search($providedPassword, $bytebeat_admins, true);
	if ($providedName) {
		setcookie('bytebeat_access', '1', time() + 2592000, '/'); // 30 days
		$_SESSION['bytebeat'] = $bytebeat_admins[$providedName];
	} else {
		fancyDie('Login failed!');
	}
}

// Show login form if not logged in yet
if (!isset($_SESSION['bytebeat'])) {
	fancyDie(showLoginPage());
}

// Management request
if (isset($_GET['manage'])) {
	fancyDie(managementRequest());
}

// Logout request
if (isset($_GET['logout'])) {
	logoutRequest();
}

// Request to copy songs from library files into the database
if (isset($_GET['files_to_db']) && BYTEBEAT_DBMAKE) {
	fancyDie(filesToDatabase());
}

// Request to create library files from database
if (isset($_GET['db_to_files'])) {
	fancyDie(databaseToFiles());
}

// Request to call the form to add a song
if (isset($_GET['addsong_request'])) {
	fancyDie(addSongForm());
}

// Request to call the form to edit a song
if (isset($_GET['editsong_request'])) {
	fancyDie(editSongForm());
}

// Request to add a song to the database
if (isset($_GET['addsong'])) {
	fancyDie(addSong(false));
}

// Request to edit a song in the database
if (isset($_GET['editsong'])) {
	fancyDie(addSong(true));
}

// Request to delete a song from the database
if (isset($_GET['deletesong'])) {
	fancyDie(deleteSong());
}

// Redirection to Bytebeat Player page
header('Location: index.html', true, 307);
exit();
?>
