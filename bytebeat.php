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
	<link rel="stylesheet" type="text/css" href="style.css?version=2024103000">
</head>
<body style="text-align: center;">
	<div style="display: inline-block; padding: 8px 0;">
		' . $message . '
	</div>
	<br>
	<hr>
	<a href="javascript: window.history.go(-1);">Return</a>
</body>
</html>');
}

// Login form
function showLoginPage() {
	return '<form name="form_login" method="post" action="?manage">
			<fieldset>
				<legend align="center">Enter an administrator password</legend>
				<input type="password" name="managepassword">
				<input type="submit" value="Log In">
			</fieldset>
		</form>';
}

// Logout
function logoutRequest() {
	$_SESSION['bytebeat'] = '';
	session_destroy();
	die('<meta http-equiv="refresh" content="0;url=' . basename($_SERVER['PHP_SELF']) . '?manage">');
}

// Form for adding a song to the database
function addSongForm() {
	return '<form name="form_login" method="post" action="?addsong">
			<fieldset style="display: flex; flex-direction: column; gap: 4px; width: 320px; text-align: start;">
				<legend align="center">Adding a song</legend>
				<input type="text" name="author" placeholder="Author">
				<input type="text" name="name" placeholder="Name">
				<textarea name="description" placeholder="Description"></textarea>
				<textarea name="url" placeholder="URL or [&quot;URL1&quot;,&quot;URL2&quot;,...]"></textarea>
				<input type="text" name="date" placeholder="Date yyyy-mm-dd">
				<div>
					<input type="text" name="samplerate" placeholder="Sample rate (Hz)">
					<label><input type="checkbox" name="stereo"> Stereo</label>
				</div>
				<select name="mode">
					<option value="Bytebeat">Bytebeat</option>
					<option value="Signed Bytebeat">Signed Bytebeat</option>
					<option value="Floatbeat">Floatbeat</option>
					<option value="Funcbeat">Funcbeat</option>
				</select>
				<div>
					<input type="text" name="remix[]" placeholder="For remix: Source song hash" style="width: 90%;">
					<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
				</div>
				<input type="text" name="cover_name" placeholder="Cover name">
				<input type="text" name="cover_url" placeholder="Cover URL">
				<textarea name="code" placeholder="Code original"></textarea>
				<textarea name="code_minified" placeholder="Code minified"></textarea>
				<textarea name="code_formatted" placeholder="Code formatted"></textarea>
				<select name="drawing_mode">
					<option value="">None</option>
					<option value="Points">Points</option>
					<option value="Waveform">Waveform</option>
					<option value="Diagram">Diagram</option>
					<option value="Combined">Combined</option>
				</select>
				<input type="text" name="drawing_scale" placeholder="Drawing scale 1=1/2, 2=1/4, 3=1/8, ...">
				<input type="text" name="tags" placeholder="Tag or [&quot;tag1&quot;,&quot;tag2&quot;,...]">
				<label>
					<select name="rating">
						<option value="0">No rating</option>
						<option value="1">Star</option>
						<option value="2">Yellow star</option>
					</select>
					Rating
				</label>
				<span><input type="submit" value="Submit"></span>
			</fieldset>
		</form>';
}

// Management panel
function managementRequest() {
	return '<fieldset style="display: flex;flex-direction: column;gap: 4px;">
			<legend align="center">Select an action to manage the library</legend>
			<a href="?addsong_request" class="control-button">Add a song</a>
			<a href="?migrate" class="control-button" onclick="return confirm(\'Are you sure to migrate to database?\')">Migrate to database</a>
			<a href="?make_json" class="control-button">Make .json files</a>
			<a href="?logout" class="control-button">Logout</a>
		</fieldset>';
}

// Move songs from library json files to 'songs' database table
function decodeJsonFile($dbLink, $libName) {
	$jsonPath = './data/json/';
	$songsPath = './data/songs/';
	$fileName = $jsonPath . $libName . '.json';

	// Check for a valid json file and get an array of songs
	if (!file_exists($fileName)) {
		fancyDie('File "' . $fileName . '" does not exist.');
	}
	$songssArr = json_decode(file_get_contents($fileName));
	if(json_last_error() !== JSON_ERROR_NONE) {
		fancyDie('File "' . $fileName . '" has an error: ' . json_last_error_msg());
	}

	// Write each song into database
	foreach ($songssArr as $authorObj) {
		$author = $authorObj->author;
		$songs = $authorObj->songs;
		foreach ($songs as $song) {
			$url = isset($song->url) ?
				(is_array($song->url) ? '["' . implode('","', $song->url) . '"]' : $song->url) : NULL;
			$codeOriginal = isset($song->code) ? $song->code : (isset($song->fileOrig) ?
				file_get_contents($songsPath . 'original/' . $song->hash . '.js') : NULL);
			$codeMinified = isset($song->codeMin) ? $song->codeMin : (isset($song->fileMin) ?
				file_get_contents($songsPath . 'minified/' . $song->hash . '.js') : NULL);
			$codeFormatted = isset($song->fileForm) ?
				file_get_contents($songsPath . 'formatted/' . $song->hash . '.js') : NULL;

			$query = 'INSERT INTO `songs` (hash' .
				($author !== '' ? ', author' : '') .
				(isset($song->name) ? ', name' : '') .
				(isset($song->description) ? ', description' : '') .
				(isset($url) ? ', url' : '') .
				(isset($song->date) ? ', date' : '') .
				', mode, samplerate' .
				(isset($song->stereo) ? ', stereo' : '') .
				(isset($codeOriginal) ? ', code' : '') .
				(isset($codeMinified) ? ', code_minified' : '') . '' .
				(isset($codeFormatted) ? ', code_formatted' : '') .
				(isset($song->coverName) ? ', cover_name' : '') .
				(isset($song->coverUrl) ? ', cover_url' : '') .
				(isset($song->drawing) ? ', drawing' : '') .
				', tags' .
				(isset($song->rating) ? ', rating' : '') .
			') VALUES ("' . $song->hash . '"' .
				($author !== '' ? ', "' . addslashes($author) . '"' : '') .
				(isset($song->name) ? ', "' . addslashes($song->name) . '"' : '') .
				(isset($song->description) ? ', "' . addslashes($song->description) . '"' : '') .
				(isset($url) ? ', "' . addslashes($url) . '"' : '') .
				(isset($song->date) ? ', "' . $song->date . '"' : '') .
				', "' . (isset($song->mode) ? $song->mode : 'Bytebeat') . '"' .
				', ' . (isset($song->sampleRate) ? $song->sampleRate : 8000) .
				(isset($song->stereo) ? ', 1' : '') .
				(isset($codeOriginal) ? ', "' . addslashes($codeOriginal) . '"' : '') .
				(isset($codeMinified) ? ', "' . addslashes($codeMinified) . '"' : '') .
				(isset($codeFormatted) ? ', "' . addslashes($codeFormatted) . '"' : '') .
				(isset($song->coverName) ? ', "' . addslashes($song->coverName) . '"' : '') .
				(isset($song->coverUrl) ? ', "' . $song->coverUrl . '"' : '') .
				(isset($song->drawing) ? ', "{\"mode\": \"' . $song->drawing->mode . '\", \"scale\": ' .
					$song->drawing->scale . '}"' : '') .
				', "' . addslashes('["' . implode('","', $song->tags) . '"]') . '"' .
				(isset($song->rating) ? ', ' . $song->rating : '') .
			');';

			// Write each song into the database
			mysqli_query($dbLink, $query);

			// Find remixes of songs and write to 'remixes' database table
			if (isset($song->remix)) {
				$remixes = $song->remix;
				foreach ($remixes as $remix) {
					mysqli_query($dbLink,
						'INSERT INTO `remixes` (song, source)
						VALUES ("' . $song->hash . '", "' . $remix->hash . '");');
				}
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

// Migration from .json library files to the database
function jsonToDatabase() {
	$message = '';
	$dbLink = getDBLink();

	// Create new databsaes if not exist
	if (mysqli_num_rows(mysqli_query($dbLink, 'SHOW TABLES LIKE "songs"')) === 0) {
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
				`rating` CHAR NULL,
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
		$message .= 'Databases `songs` and `remixes` created.<br>';
	} else {
		// Clear existed tables
		mysqli_query($dbLink, 'TRUNCATE TABLE songs;');
		mysqli_query($dbLink, 'TRUNCATE TABLE remixes;');
		$message .= 'Databases `songs` and `remixes` cleared.<br>';
	}

	// Copy songs from library json files to 'songs' and 'remixes' database tables
	decodeJsonFile($dbLink, 'all');
	$message .= 'JSON libraries copied to `songs` and `remixes` databases.<br>';

	// Close database
	mysqli_close($dbLink);
	return $message . 'Success!';
}

// Create JSON file on query from database
function makeJson($jsonFileName, $songsByHash, $qResult) {
	$songsArr = array();
	// Group songs by authors into arrays
	while ($song = mysqli_fetch_assoc($qResult)) {
		if (isset($song['author'])) {
			$songsArr[$song['author']][] = $song['hash'];
		} else {
			$songsArr[''][] = $song['hash'];
		}
	}
	// Make JSON file
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
	file_put_contents($jsonFileName, '[' . $outputStr . ']');
}

// Making .json libraries and big-js songs files from database
function databaseToJson() {
	$message = '';
	$dbLink = getDBLink();
	$pathJSON = './data/json/';
	$pathOriginal = './data/songs/original/';
	$pathMinified = './data/songs/minified/';
	$pathFormatted = './data/songs/formatted/';

	// Create/clear folders for large songs
	if (!is_dir($pathOriginal)) {
		mkdir($pathOriginal, 0755, true);
		$message .= $pathOriginal . ' created.<br>';
	} else {
		array_map('unlink', glob($pathOriginal . '/*.*'));
	}
	if (!is_dir($pathMinified)) {
		mkdir($pathMinified, 0755, true);
		$message .= $pathMinified . ' created.<br>';
	} else {
		array_map('unlink', glob($pathMinified . '/*.*'));
	}
	if (!is_dir($pathFormatted)) {
		mkdir($pathFormatted, 0755, true);
		$message .= $pathFormatted . ' created.<br>';
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
			`rating`
		FROM songs ORDER BY `author`, `date`, `id`;');

	// Create a json string for each song and put it into an associative array by hash
	$songsByHash = array();
	while ($song = mysqli_fetch_assoc($qResult)) {
		$fileMin = 0;
		$fileOrig = 0;
		$fileForm = 0;
		if (isset($song['code_minified']) && mb_strlen($song['code_minified']) > 1024) {
			// Save big minified code into file
			file_put_contents($pathMinified . $song['hash'] . '.js', $song['code_minified']);
			$fileMin = 1;
		}
		if (isset($song['code']) &&
			(substr_count($song['code'], PHP_EOL) > 4 || mb_strlen($song['code']) > 1024)
		) {
			// Save big original code into file
			file_put_contents($pathOriginal . $song['hash'] . '.js', $song['code']);
			$fileOrig = 1;
		}
		if (isset($song['code_formatted'])) {
			// Save formatted code into file
			file_put_contents($pathFormatted . $song['hash'] . '.js', $song['code_formatted']);
			$fileForm = 1;
		}
		// Finding remixes
		$remixStr = '';
		$sourcesArr = array();
		$qSources = mysqli_query($dbLink,
			"SELECT `source` FROM remixes
			WHERE `song` = '" . $song['hash'] . "';");
		if (mysqli_num_rows($qSources) !== 0) {
			while ($source = mysqli_fetch_assoc($qSources)) {
				$sourcesArr[] = $source['source'];
			}
		}
		// Finding sources for remixes
		foreach ($sourcesArr as $sourceHash) {
			$qSource = mysqli_query($dbLink,
				"SELECT `author`, `name`, `url` FROM songs
				WHERE `hash` = '" . $sourceHash . "';");
			if (mysqli_num_rows($qSource) !== 0) {
				while ($source = mysqli_fetch_assoc($qSource)) {
					$remixStr .= ($remixStr ? ',' : '') . '{"hash":"' . $sourceHash . '"' .
						(isset($source['author']) ? ', "author":' . json_encode($source['author']) : '') .
						(isset($source['name']) ? ', "name":' . json_encode($source['name']) : '') .
						(isset($source['url']) ? ', "url":' . json_encode($source['url']) : '') . '}';
				}
			}
		}
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
			(isset($song['rating']) ? ',"rating":' . $song['rating'] : '') .
		'}';
	}

	// Create/clear folder for JSON files
	if (!is_dir($pathJSON)) {
		mkdir($pathJSON, 0755, true);
		$message .= $pathJSON . ' created.<br>';
	} else {
		array_map('unlink', glob($pathJSON . '/*.*'));
	}

	// JSON file with all songs sorted by authors
	$jsonFileName = $pathJSON . 'all.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		'SELECT `hash`, `author` FROM songs
		ORDER BY `author`, `date`, `id`;'));
	$message .= '"' . $jsonFileName . '" file created.<br>';

	// JSON file with c-compatible songs
	$jsonFileName = $pathJSON . 'classic.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE `tags` LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= '"' . $jsonFileName . '" file created.<br>';

	// JSON file with JS songs under 256b
	$jsonFileName = $pathJSON . 'js-256.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE (mode = 'Bytebeat' OR mode = 'Signed Bytebeat')
			AND `tags` LIKE '%\"256\"%'
			AND `tags` NOT LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= '"' . $jsonFileName . '" file created.<br>';

	// JSON file with JS songs under 1k
	$jsonFileName = $pathJSON . 'js-1k.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE (mode = 'Bytebeat' OR mode = 'Signed Bytebeat')
			AND `tags` LIKE '%\"1k\"%'
			AND `tags` NOT LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= '"' . $jsonFileName . '" file created.<br>';

	// JSON file with big JS songs
	$jsonFileName = $pathJSON . 'js-big.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE (mode = 'Bytebeat' OR mode = 'Signed Bytebeat')
			AND `tags` NOT LIKE '%\"256\"%'
			AND `tags` NOT LIKE '%\"1k\"%'
			AND `tags` NOT LIKE '%\"c\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= '"' . $jsonFileName . '" file created.<br>';

	// JSON file with Floatbeat mode songs
	$jsonFileName = $pathJSON . 'floatbeat.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE mode = 'Floatbeat'
			AND `tags` NOT LIKE '%\"big\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= '"' . $jsonFileName . '" file created.<br>';

	// JSON file with Floatbeat mode songs
	$jsonFileName = $pathJSON . 'floatbeat-big.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE mode = 'Floatbeat'
			AND `tags` NOT LIKE '%\"256\"%'
			AND `tags` NOT LIKE '%\"1k\"%'
		ORDER BY `date`, `author`, `id`;"));
	$message .= '"' . $jsonFileName . '" file created.<br>';

	// JSON file with Funcbeat mode songs
	$jsonFileName = $pathJSON . 'funcbeat.json';
	makeJson($jsonFileName, $songsByHash, mysqli_query($dbLink,
		"SELECT `hash`, `author` FROM songs
		WHERE mode = 'Funcbeat'
		ORDER BY `date`, `author`, `id`;"));
	$message .= '"' . $jsonFileName . '" file created.<br>';

	// Close database
	mysqli_close($dbLink);
	return $message . 'Success!';
}

// Request to add a song to the database
function addSong() {
	$dbLink = getDBLink();

	$hash = bin2hex(random_bytes(16));
	$author = trim($_POST['author']);
	$name = trim($_POST['name']);
	$description = trim($_POST['description']);
	$url = trim($_POST['url']);
	$date = trim($_POST['date']);
	$coverName = trim($_POST['cover_name']);
	$coverUrl = trim($_POST['cover_url']);
	$drawingMode = $_POST['drawing_mode'];
	$drawingScale = trim($_POST['drawing_scale']);
	$isDrawing = $drawingMode || $drawingScale !== '';
	if ($drawingScale !== '' && !is_numeric($drawingScale)) {
		fancyDie('Error: Drawing Scale must be a nubmer!');
	}
	$sampleRate = trim($_POST['samplerate']);
	if (!is_numeric($sampleRate)) {
		fancyDie('Error: Sample Rate must be a nubmer!');
	}

	// Set tags field
	$tagsArr = array();
	$codeLen = $_POST['code'] ? strlen($_POST['code']) :
		($_POST['code_formatted'] ? strlen($_POST['code_formatted']) :
		($_POST['code_minified'] ? strlen($_POST['code_minified']) : 0));
	if ($codeLen) {
		if ($codeLen <= 256) {
			$tagsArr[] = '256';
		} else if ($codeLen <= 1024) {
			$tagsArr[] = '1k';
		} else {
			$tagsArr[] = 'big';
		}
	}
	if ($_POST['tags']) {
		$tags = json_decode($_POST['tags']);
		if (json_last_error() === JSON_ERROR_NONE && is_array($tags)) {
			foreach ($tags as $tag) {
				$tagsArr[] = $tag;
			}
		} else {
			$tagsArr[] = $_POST['tags'];
		}
	}

	// Adding song info into `songs` table
	$query = 'INSERT INTO `songs` (hash' .
		($author ? ', author' : '') .
		($name ? ', name' : '') .
		($description ? ', description' : '') .
		($url ? ', url' : '') .
		($date ? ', date' : '') .
		', mode, samplerate' .
		(isset($_POST['stereo']) ? ', stereo' : '') .
		($_POST['code'] ? ', code' : '') .
		($_POST['code_minified'] ? ', code_minified' : '') . '' .
		($_POST['code_formatted']  ? ', code_formatted' : '') .
		($coverName  ? ', cover_name' : '') .
		($coverUrl  ? ', cover_url' : '') .
		($isDrawing ? ', drawing' : '') .
		', tags' .
		($_POST['rating'] ? ', rating' : '') . ')
	VALUES ("' . $hash . '"' .
		($author ? ', "' . addslashes($author) . '"' : '') .
		($name ? ', "' . addslashes($name) . '"' : '') .
		($description ? ', "' . addslashes($description) . '"' : '') .
		($url ? ', "' . addslashes($url) . '"' : '') .
		($date ? ', "' . $date . '"' : '') .
		', "' . ($_POST['mode'] ? $_POST['mode'] : 'Bytebeat') . '"' .
		', ' . ($sampleRate ? $sampleRate : 8000) .
		(isset($_POST['stereo']) ? ', 1' : '') .
		($_POST['code'] ? ', "' . addslashes($_POST['code']) . '"' : '') .
		($_POST['code_minified']  ? ', "' . addslashes($_POST['code_minified'] ) . '"' : '') .
		($_POST['code_formatted'] ? ', "' . addslashes($_POST['code_formatted']) . '"' : '') .
		($coverName ? ', "' . addslashes($coverName) . '"' : '') .
		($coverUrl ? ', "' . addslashes($coverUrl) . '"' : '') .
		($isDrawing ? ', "' . addslashes('{' .
			($drawingMode ? '"mode":"' . $drawingMode . '"' : '') .
			($drawingScale !== '' ? ($drawingMode ? ',' : '') . '"scale":"' . $drawingScale . '"' : '') .
		'}') . '"' : '') .
		', "' . addslashes('["' . implode('","', $tagsArr) . '"]') . '"' .
		($_POST['rating'] ? ', ' . $_POST['rating'] : '') . ');';
	mysqli_query($dbLink, $query);

	// Adding sources for remixes into `remixes` table
	$sources = $_POST['remix'];
	foreach ($sources as $source) {
		if ($source) {
			mysqli_query($dbLink,
				'INSERT INTO `remixes` (song, source)
				VALUES ("' . $hash . '", "' . $source . '");');
		}
	}

	// Close database
	mysqli_close($dbLink);
	return 'Song added!';
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
if (BYTEBEAT_ADMINPASS == '') {
	fancyDie('settings.php: BYTEBEAT_ADMINPASS must be configured.');
}

// Checking authorization when trying to login
if (isset($_POST['managepassword'])) {
	if ($_POST['managepassword'] === BYTEBEAT_ADMINPASS) {
		$_SESSION['bytebeat'] = BYTEBEAT_ADMINPASS;
	} else {
		fancyDie('Login failed!');
	}
}

// Show login form if not logined yet
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

// Request to transfer songs from .json library files to the database
if (isset($_GET['migrate'])) {
	fancyDie(jsonToDatabase());
}

// Request to create .json libraries and big-js song files from database
if (isset($_GET['make_json'])) {
	fancyDie(databaseToJson());
}

// Request to call the form to add a song
if (isset($_GET['addsong_request'])) {
	fancyDie(addSongForm());
}

// Request to add a song to the database
if (isset($_GET['addsong'])) {
	fancyDie(addSong());
}

// Redirection to Bytebeat Player page
header('Location: index.html', true, 307);
exit();