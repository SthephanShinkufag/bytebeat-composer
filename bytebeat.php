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
	unset($_COOKIE['atom_access']);
	$_SESSION['bytebeat'] = '';
	session_destroy();
	die('<meta http-equiv="refresh" content="0;url=' . basename($_SERVER['PHP_SELF']) . '?manage">');
}

// Management panel
function managementRequest() {
	return '<fieldset style="display: flex;flex-direction: column;gap: 4px;">
			<legend align="center">Select an action to manage the library</legend>
			<a href="?addsong_request" class="control-button">Add a song</a>
			<a href="?files_to_db" class="control-button" onclick="return confirm(\'Are you sure to copy songs from library files into the database?\')">Migrate to database</a>
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
						<th>Author</th>
						<td><input type="text" name="author"></td>
					</tr>
					<tr>
						<th>Name</th>
						<td><input type="text" name="name"></td>
					</tr>
					<tr>
						<th>Description</th>
						<td><textarea name="description"></textarea></td>
					</tr>
					<tr>
						<th>URL</th>
						<td><textarea name="url" placeholder="URL or [&quot;URL1&quot;,&quot;URL2&quot;,...]"></textarea></td>
					</tr>
					<tr>
						<th>Date</th>
						<td><input type="text" name="date" placeholder="yyyy-mm-dd"></td>
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
							<label><input type="checkbox" name="stereo"> Stereo</label>
						</td>
					</tr>
					<tr>
						<th>Sample rate (Hz)</th>
						<td><input type="text" name="samplerate"></td>
					</tr>
					<tr>
						<th>Remix</th>
						<td><div>
							<input type="text" name="remix[]" placeholder="Source song hash" style="width: 88%;">
							<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
						</div></td>
					</tr>
					<tr>
						<th>Cover name</th>
						<td><input type="text" name="cover_name"></td>
					</tr>
					<tr>
						<th>Cover URL</th>
						<td><input type="text" name="cover_url"></td>
					</tr>
					<tr>
						<th>Code original</th>
						<td><textarea name="code"></textarea></td>
					</tr>
					<tr>
						<th>Code minified</th>
						<td><textarea name="code_minified"></textarea></td>
					</tr>
					<tr>
						<th>Code formatted</th>
						<td><textarea name="code_formatted"></textarea></td>
					</tr>
					<tr>
						<th>Drawing mode</th>
						<td><select name="drawing_mode">
							<option value="">None</option>
							<option value="Points">Points</option>
							<option value="Waveform">Waveform</option>
							<option value="Diagram">Diagram</option>
							<option value="Combined">Combined</option>
						</select></td>
					</tr>
					<tr>
						<th>Drawing scale</th>
						<td><input type="text" name="drawing_scale" placeholder="1=1/2, 2=1/4, 3=1/8, 4=1/16 ..."></td>
					</tr>
					<tr>
						<th>Tags</th>
						<td><input type="text" name="tags" placeholder="Tag or [&quot;tag1&quot;,&quot;tag2&quot;,...]"></td>
					</tr>
					<tr>
						<th>Rating</th>
						<td><select name="rating">
							<option value="0">No rating</option>
							<option value="1">Star</option>
							<option value="2">Yellow star</option>
						</select></td>
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
	$hash = $_GET['hash'];

	// Get a song by hash from the database
	$songs = mysqli_query($dbLink,
		'SELECT * FROM `songs`
		WHERE `hash` = "' . $hash . '" LIMIT 1;');
	if (mysqli_num_rows($songs) === 0) {
		return 'Song with hash = "' . $hash . '" not found!';
	}
	while ($song = mysqli_fetch_assoc($songs)) {
		// Find if the song is a remix then get sources hashes
		$remixStr = '';
		$remixResult = mysqli_query($dbLink,
			'SELECT * FROM `remixes`
			WHERE `song` = "' . $hash . '";');
		if (mysqli_num_rows($remixResult) !== 0) {
			while ($remixSource = mysqli_fetch_assoc($remixResult)) {
				$remixStr .= '<div>
							<input type="text" name="remix[]" placeholder="Source song hash" value="' . 
								$remixSource['source'] . '" style="width: 88%;">
							<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
						</div>';
			}
		} else {
			$remixStr = '<div>
							<input type="text" name="remix[]" placeholder="Source song hash" style="width: 88%;">
							<button onclick="this.parentNode.insertAdjacentHTML(\'afterend\', this.parentNode.outerHTML); event.preventDefault();" title="Click to add more sources.">+</button>
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
		return '<fieldset>
			<legend align="center">Editing a song</legend>
			<form name="form_editsong" method="post" action="?editsong">
				<table class="table-form"><tbody>
					<tr>
						<th>Hash</th>
						<td><input type="text" name="hash" value="' . $hash . '" readonly></td>
					</tr>
					<tr>
						<th>Author</th>
						<td><input type="text" name="author" value="' . $song['author'] . '"></td>
					</tr>
					<tr>
						<th>Name</th>
						<td><input type="text" name="name" value="' . $song['name'] . '"></td>
					</tr>
					<tr>
						<th>Description</th>
						<td><textarea name="description">' . $song['description'] . '</textarea></td>
					</tr>
					<tr>
						<th>URL</th>
						<td><textarea name="url" placeholder="URL or [&quot;URL1&quot;,&quot;URL2&quot;,...]">' .
							$song['url'] . '</textarea></td>
					</tr>
					<tr>
						<th>Date</th>
						<td><input type="text" name="date" placeholder="yyyy-mm-dd" value="' .
							$song['date'] . '"></td>
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
							<label><input type="checkbox" name="stereo"' .
								($song['stereo'] ? ' checked' : '') . '> Stereo</label>
						</td>
					</tr>
					<tr>
						<th>Sample rate (Hz)</th>
						<td><input type="text" name="samplerate" value="' .
							$song['samplerate'] . '"></td>
					</tr>
					<tr>
						<th>Remix source</th>
						<td>' . $remixStr .  '</td>
					</tr>
					<tr>
						<th>Cover source name</th>
						<td><input type="text" name="cover_name" value="' . $song['cover_name'] . '"></td>
					</tr>
					<tr>
						<th>Cover source URL</th>
						<td><input type="text" name="cover_url" value="' . $song['cover_url'] . '"></td>
					</tr>
					<tr>
						<th>Code original</th>
						<td><textarea name="code">' . $song['code'] . '</textarea></td>
					</tr>
					<tr>
						<th>Code minified</th>
						<td><textarea name="code_minified">' . $song['code_minified'] . '</textarea></td>
					</tr>
					<tr>
						<th>Code formatted</th>
						<td><textarea name="code_formatted">' . $song['code_formatted'] . '</textarea></td>
					</tr>
					<tr>
						<th>Drawing mode, scale</th>
						<td>
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
							(isset($drawing_scale) ? $drawing_scale : '' ) . '" style="width: auto;">
						</td>
					</tr>
					<tr>
						<th>Tags</th>
						<td><input type="text" name="tags" placeholder="Tag or [&quot;tag1&quot;,&quot;tag2&quot;,...]" value="' .
							htmlspecialchars($song['tags']) . '"></td>
					</tr>
					<tr>
						<th>Rating</th>
						<td><select name="rating">
							<option value="0"' .
								($song['rating'] === '0' ? ' selected' : '') . '>No rating</option>
							<option value="1"' .
								($song['rating'] === '1' ? ' selected' : '') . '>Star</option>
							<option value="2"' .
								($song['rating'] === '2' ? ' selected' : '') . '>Yellow star</option>
						</select></td>
					</tr>
				</tbody></table>
				<input type="submit" value="Submit changes" style="float: left; margin: 2px;">
			</form>
			<form name="form_deletesong" method="post" action="?deletesong">
				<input type="hidden" name="hash" value="' . $hash . '">
				<input type="submit" value="Delete song" style="float: left; margin: 2px;" onclick="return confirm(\'Are you sure to delete this song?\')">
			</form>
		</fieldset>';
	}
}

// Copy songs from library files into 'songs' and 'remixes' database tables
function decodeLibraryFile($dbLink, $libName) {
	$songsPath = './data/songs/';
	$libFileName = './data/library/' . $libName . '.gz';

	// Check for a valid JSON string from GZIP file and get an array of songs
	if (!file_exists($libFileName)) {
		fancyDie('File "' . $libFileName . '" does not exist.');
	}
	$songssArr = json_decode(gzdecode(file_get_contents($libFileName)));
	if (json_last_error() !== JSON_ERROR_NONE) {
		fancyDie('File "' . $libFileName . '" has an error: ' . json_last_error_msg());
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

			// Write each song into 'songs' database table
			mysqli_query($dbLink, 'INSERT INTO `songs` (hash' .
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
			');');

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

// Copy songs from library files into the database
function filesToDatabase() {
	$message = '';
	$dbLink = getDBLink();

	// Create new databsaes if not exist
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
		$message .= '"' . $pathOriginal . '" folder created.<br>';
	} else {
		array_map('unlink', glob($pathOriginal . '/*.*'));
	}
	if (!is_dir($pathMinified)) {
		mkdir($pathMinified, 0755, true);
		$message .= '"' . $pathMinified . '" folder created.<br>';
	} else {
		array_map('unlink', glob($pathMinified . '/*.*'));
	}
	if (!is_dir($pathFormatted)) {
		mkdir($pathFormatted, 0755, true);
		$message .= '"' . $pathFormatted . '" folder created.<br>';
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
			'SELECT `source` FROM remixes
			WHERE `song` = "' . $song['hash'] . '";');
		if (mysqli_num_rows($qSources) !== 0) {
			while ($source = mysqli_fetch_assoc($qSources)) {
				$sourcesArr[] = $source['source'];
			}
		}
		// Finding sources for remixes
		foreach ($sourcesArr as $sourceHash) {
			$qSource = mysqli_query($dbLink,
				'SELECT `author`, `name`, `url` FROM songs
				WHERE `hash` = "' . $sourceHash . '";');
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

	// Create/clear folder for library files
	if (!is_dir($pathLibrary)) {
		mkdir($pathLibrary, 0755, true);
		$message .= '"' . $pathLibrary . '" folder created.<br>';
	} else {
		array_map('unlink', glob($pathLibrary . '/*.*'));
	}

	// Library file with all songs sorted by authors
	$fileName = $pathLibrary . 'all.gz';
	makeLibraryFile($fileName, $songsByHash, mysqli_query($dbLink,
		'SELECT `hash`, `author` FROM songs
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

	// Library file with Floatbeat mode songs
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
	return $message . '"' . $pathLibrary . '*.gz" files created.<br>Success!';
}

// Request to add a song to the database
function addSong($isEdit) {
	$dbLink = getDBLink();

	$hash = $isEdit ? $_POST['hash'] : bin2hex(random_bytes(16));
	$author = addslashes(trim($_POST['author']));
	$name = addslashes(trim($_POST['name']));
	$description = addslashes(trim($_POST['description']));
	$url = addslashes(trim($_POST['url']));
	$date = trim($_POST['date']);
	$mode = $_POST['mode'];
	$sampleRate = trim($_POST['samplerate']);
	$sampleRate = $sampleRate && is_numeric($sampleRate) ? $sampleRate : 8000;
	$code = str_replace("\r", '', addslashes($_POST['code']));;
	$codeMinified = str_replace("\r", '', addslashes($_POST['code_minified']));
	$codeFormatted = str_replace("\r", '', addslashes($_POST['code_formatted']));
	$coverName = addslashes(trim($_POST['cover_name']));
	$coverUrl = addslashes(trim($_POST['cover_url']));
	$rating = $_POST['rating'];

	// Drawing
	$drawingMode = $_POST['drawing_mode'];
	$drawingScale = trim($_POST['drawing_scale']);
	$drawingScale = $drawingScale && is_numeric($drawingScale) ? $drawingScale : NULL;
	$drawing = $drawingMode || isset($drawingScale) ? addslashes('{' .
		($drawingMode ? '"mode":"' . $drawingMode . '"' : '') .
		(isset($drawingScale) ? ($drawingMode ? ',' : '') . '"scale":"' . $drawingScale . '"' : '') .
	'}') : '';

	// Set tags field
	if ($isEdit) {
		$tagsStr = addslashes(trim($_POST['tags']));
	} else {
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
		$tagsStr = addslashes('["' . implode('","', $tagsArr) . '"]');
	}

	if ($isEdit) {
		// Update existed song
		mysqli_query($dbLink, 'UPDATE `songs` SET
			`hash` = "' . $hash . '"' .
			', `author` = ' . ($author ? '"' . $author . '"': 'NULL') .
			', `name` = ' . ($name ? '"' . $name . '"' : 'NULL') .
			', `description` = ' . ($description ? '"' . $description . '"' : 'NULL') .
			', `url` = ' . ($url ? '"' . $url . '"' : 'NULL') .
			', `date` = ' . ($date ? '"' . $date . '"' : 'NULL') .
			', `mode` = "' . $mode . '"' .
			', `sampleRate` = ' . $sampleRate .
			', `stereo` = ' . (isset($_POST['stereo']) ? 1 : 'NULL') .
			', `code` = ' . ($code ? '"' . $code . '"' : 'NULL') .
			', `code_minified` = ' . ($codeMinified ? '"' . $codeMinified . '"' : 'NULL') .
			', `code_formatted` = ' . ($codeFormatted ? '"' . $codeFormatted . '"' : 'NULL') .
			', `cover_name` = ' . ($coverName ? '"' . $coverName . '"' : 'NULL') .
			', `cover_url` = ' . ($coverUrl ? '"' . $coverUrl . '"' : 'NULL') .
			', `drawing` = ' . ($drawing ? '"' . $drawing . '"' : 'NULL') .
			', `tags` = "' . $tagsStr . '"' .
			', `rating` = ' . ($rating ? $rating : 'NULL') . '
		WHERE `hash` = "' . $hash . '";');
	} else {
		// Adding a new song
		mysqli_query($dbLink, 'INSERT INTO `songs` (' .
			'`hash`' .
			($author ? ', `author`' : '') .
			($name ? ', `name`' : '') .
			($description ? ', `description`' : '') .
			($url ? ', `url`' : '') .
			($date ? ', `date`' : '') .
			', `mode`, `samplerate`' .
			(isset($_POST['stereo']) ? ', `stereo`' : '') .
			($code ? ', `code`' : '') .
			($codeMinified ? ', `code_minified`' : '') . '' .
			($codeFormatted  ? ', `code_formatted`' : '') .
			($coverName  ? ', `cover_name`' : '') .
			($coverUrl  ? ', `cover_url`' : '') .
			($drawing ? ', `drawing`' : '') .
			', `tags`' .
			($rating ? ', `rating`' : '') .
		') VALUES ("' .
			$hash . '"' .
			($author ? ', "' . $author . '"' : '') .
			($name ? ', "' . $name . '"' : '') .
			($description ? ', "' . $description . '"' : '') .
			($url ? ', "' . $url . '"' : '') .
			($date ? ', "' . $date . '"' : '') .
			', "' . $mode . '"' .
			', ' . $sampleRate .
			(isset($_POST['stereo']) ? ', 1' : '') .
			($code ? ', "' . $code . '"' : '') .
			($codeMinified ? ', "' . $codeMinified . '"' : '') .
			($codeFormatted ? ', "' . $codeFormatted . '"' : '') .
			($coverName ? ', "' . $coverName . '"' : '') .
			($coverUrl ? ', "' . $coverUrl . '"' : '') .
			($drawing ? ', "' . $drawing . '"' : '') .
			', "' . $tagsStr . '"' .
			($rating ? ', ' . $rating : '') . ');');
	}

	$sources = $_POST['remix'];
	// Deleting old entries from `remixes` table
	mysqli_query($dbLink,
		'DELETE FROM `remixes`
		WHERE `song` = "' . $hash . '";');
	// Adding sources for remixes into `remixes` table
	foreach ($sources as $source) {
		if ($source) {
			mysqli_query($dbLink,
				'INSERT INTO `remixes` (song, source)
				VALUES ("' . $hash . '", "' . $source . '");');
		}
	}

	mysqli_close($dbLink);
	return 'Song ' . ($isEdit ? 'added' : 'edited') . ' successfully!<br>
		' . managementRequest();
}

// Request to delete a song from the database
function deleteSong() {
	$dbLink = getDBLink();
	$hash = $_POST['hash'];
	mysqli_query($dbLink,
		'DELETE FROM `songs`
		WHERE `hash` = "' . $hash . '";');
	mysqli_query($dbLink,
		'DELETE FROM `remixes`
		WHERE `song` = "' . $hash . '";');
	mysqli_close($dbLink);
	return 'Song deleted!<br>
		' . managementRequest();
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
		setcookie('bytebeat_access', '1', time() + 2592000, '/'); // 30 days
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

// Request to copy songs from library files into the database
if (isset($_GET['files_to_db'])) {
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