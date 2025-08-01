console.clear()
var http = require('http');
var fs = require('fs-extra');
var path = require('path');
var mime = require('mime-types');
var crypto = require('crypto')
var formidable = require('formidable');
function getHashSync(e){return fileBuffer=fs.readFileSync(e),(hash=crypto.createHash("sha256")).update(fileBuffer),hash.digest("hex")}
var prefix = `<title>dell's file dumpster</title><center><h1>dell's file dumpster</h1>`
// create data file on first run
if(!fs.existsSync(path.join(__dirname,'data.json'))) {
	fs.writeFileSync(path.join(__dirname,'data.json'), '{}');
}

// create data folders
if(!fs.existsSync(path.join(__dirname,'files'))) {
	fs.mkdirSync(path.join(__dirname,'files'));
}

if(!fs.existsSync(path.join(__dirname,'pufferfish_files'))) {
	fs.mkdirSync(path.join(__dirname,'pufferfish_files'));
}

if(!fs.existsSync(path.join(__dirname,'pufferfish_metadata'))) {
	fs.mkdirSync(path.join(__dirname,'pufferfish_metadata'));
}



http.createServer((req, res) => {
  var data = fs.readFileSync(path.join(__dirname,'data.json'));
  if(!data.admins) {
	  data.admins = [];
	  fs.writeFileSync(path.join(__dirname,'data.json'), JSON.stringify(data))
  }
  if(!data.bannedHashes) {
	  data.bannedHashes = [];
	  fs.writeFileSync(path.join(__dirname,'data.json'), JSON.stringify(data))
  }
  if(!data.bannedIPs) {
	  data.bannedIPs = [];
	  fs.writeFileSync(path.join(__dirname,'data.json'), JSON.stringify(data))
  }

  if(req.url.startsWith('/pile/')) {
	if(!data.admins.includes(req.socket.remoteAddress))) {
		console.log('[PUFFERFISH] An unauthorized user tried to view a Pufferfish file')
		res.writeHead(404, {'Content-Type': 'text/html'})
		res.end(prefix + `<b>the resource at ${req.url} could not be found :(<br><a href="/">back to home</a></b></center>`)
		return
	}
  	let file = decodeURIComponent(req.url.slice(6))
  	let filePath = path.join(__dirname, 'pufferfish_files', file);

  	fs.stat(filePath, (err, stats) => {
   		if (err) {
    			if (err.code === 'ENOENT') {
				console.log(`[VIEW] The inexistent file '${file}' was attempted to be viewed.`)
				res.writeHead(404, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>the file '${file}' could not be found in Pufferfish :(<br><a href="/">back to home</a></b></center>`)
      	 		} else {
				res.writeHead(500, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>something is breaking :(<br>if you are the owner then check the console</b></center>`)
      			}
      			return
    		}
		console.log(`[PUFFERFISH] The held file '${file}' was viewed by ${req.socket.remoteAddress}.`)
    		let mimeType = mime.lookup(filePath) || 'application/octet-stream';
   		res.setHeader('Content-Type', mimeType);
    		let fileStream = fs.createReadStream(filePath);

    		fileStream.on('error', (error) => {
      			res.statusCode = 500;
      			res.end('Server error');
    		});

    		fileStream.pipe(res);
  	});
  } else {
  if(req.url.startsWith('/file/')) {
  	let file = decodeURIComponent(req.url.slice(6))
  	let filePath = path.join(__dirname, 'files', file);

  	fs.stat(filePath, (err, stats) => {
   		if (err) {
    			if (err.code === 'ENOENT') {
				console.log(`[VIEW] The inexistent file '${file}' was attempted to be viewed by ${req.socket.remoteAddress}.`)
				res.writeHead(404, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>the file '${file}' could not be found :(<br><a href="/">back to home</a></b></center>`)
      	 		} else {
				res.writeHead(500, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>something is breaking :(<br>if you are dell then check the console</b></center>`)
      			}
      			return
    		}
		console.log(`[VIEW] The file '${file}' was viewed by ${req.socket.remoteAddress}.`)
    		let mimeType = mime.lookup(filePath) || 'application/octet-stream';
   		res.setHeader('Content-Type', mimeType);
    		let fileStream = fs.createReadStream(filePath);

    		fileStream.on('error', (error) => {
      			res.statusCode = 500;
      			res.end('Server error');
    		});

    		fileStream.pipe(res);
  	});
  } else {
	if(req.url==='/') {
		files = fs.readdirSync(path.join(__dirname, 'files'), { withFileTypes: true }); 
		list = '<a href="/pufferfish"><button>Pufferfish Dashboard</button></a>' + prefix + `<h2>Please read <a href="/rules">the rules</a> before uploading!</h2><b>PLEASE only use ASCII for uploaded filenames...</b><h3>Uploaded files:</h3><hr><br>\n`
		files.forEach(file => { 
			list += `\t<a href="/file/${file.name}">${file.name}</a><br>\n`
		}); 
		list += `<br><hr><a href="/upload"><button>Upload a file</button></a></center>`
		res.writeHead(200, {'Content-Type': 'text/html'})
		res.end(list)
		return
	}
	if(req.url==='/file') {
		res.writeHead(200, {'Content-Type': 'text/html'})
		res.end(prefix + `<b>you have found a secret<br>but i will not reward you<br><a href="/">back to home</a></b></center>`)
		return
	}
	if(req.url==='/api/admins') {
		res.writeHead(200, {'Content-Type': 'application/json'})
		res.end(JSON.stringify(admins))
		return
	}
	
	if(req.url.slice(0,9)==='/approve/') {
		if(!data.admins.includes(req.socket.remoteAddress))) {
			console.log('[PUFFERFISH] An unauthorized user tried to approve '+req.url.slice(9))
			res.writeHead(404, {'Content-Type': 'text/html'})
			res.end(prefix + `<b>the resource at ${req.url} could not be found :(<br><a href="/">back to home</a></b></center>`)
			return
		}
		file = req.url.slice(9)
		if(fs.existsSync(path.join(__dirname, 'pufferfish_files', file))) {
			fs.unlinkSync(path.join(__dirname, 'pufferfish_metadata', `ip.${file}`))
			fs.moveSync(path.join(__dirname, 'pufferfish_files', file), path.join(__dirname, 'files', file))
			res.writeHead(301, {'Location': '/pufferfish'})
			res.end()
			return
		}
		res.end('{"success":"false"}')
		
		return
	}
	
	
	if(req.url.slice(0,8)==='/delete/') {
		if(!data.admins.includes(req.socket.remoteAddress))) {
			console.log('[PUFFERFISH] An unauthorized user tried to delete a file')
			res.writeHead(404, {'Content-Type': 'text/html'})
			res.end(prefix + `<b>the resource at ${req.url} could not be found :(<br><a href="/">back to home</a></b></center>`)
			return
		}
		file = req.url.slice(8)
		if(fs.existsSync(path.join(__dirname, 'pufferfish_files', file))) {
			data.bannedIPs = JSON.parse(fs.readFileSync(path.join(__dirname,'banned_ips.json')))
			data.bannedHashes.push(getHashSync(path.join(__dirname, 'pufferfish_files', file)))
			data.bannedIPs.push(fs.readFileSync(path.join(__dirname, 'pufferfish_metadata', `ip.${file}`)).toString())
			fs.writeFileSync(path.join(__dirname,'data.json'), JSON.stringify(data))
			fs.unlinkSync(path.join(__dirname, 'pufferfish_metadata', `ip.${file}`))
			fs.unlinkSync(path.join(__dirname, 'pufferfish_files', file))
			res.writeHead(301, {'Location': '/pufferfish'})
			res.end()
			return
		}
		res.end('{"success":"false"}')
		return
	}
	
	
	if(req.url==='/pufferfish') {
		if(!data.admins.includes(req.socket.remoteAddress))) {
			console.log('[PUFFERFISH] An unauthorized user tried to view the Pufferfish dashboard')
			res.writeHead(404, {'Content-Type': 'text/html'})
			res.end(prefix + `<b>the resource at ${req.url} could not be found :(<br><a href="/">back to home</a></b></center>`)
			return
		}
		console.log('[PUFFERFISH] Someone viewed the dashboard!')
		files = fs.readdirSync(path.join(__dirname, 'pufferfish_files'), { withFileTypes: true }); 
		list = prefix + '<h2>Pufferfish</h2><h3>Files held for review:</h3><hr><br>\n'
		files.forEach(file => { 
			list += `	<a href="/pile/${file.name}">${file.name}</a><b style="text-indent:50px;word-spacing:50px"><form style="display:inline-block" action="/approve/${file.name}" method="post" enctype="multipart/form-data"><input name="ip" required style="display:none" value="${fields.ip[0]}"></input><input type="submit" value="Approve"/></form><form style="display:inline-block" action="/delete/${file.name}" method="post" enctype="multipart/form-data"><input name="ip" required style="display:none" value="${fields.ip[0]}"></input><input type="submit" value="Delete"/></form> IP:</b><b> ${fs.readFileSync(path.join(__dirname, 'pufferfish_metadata', `ip.${file.name}`)).toString()}</b><br>\n`
		}); 
		list += `<br><hr><br><b>PLEASE DO NOT APPROVE FILES THAT BREAK <a href="/rules">THE RULES</a>!</b></center>`
		res.writeHead(200, {'Content-Type': 'text/html'})
		res.end(list)
		return
	}
	if(req.url==='/rules') {
		res.writeHead(200, {'Content-Type': 'text/html'})
		res.end(prefix + `<h2>Please follow these rules</h2><p>1. Please DO NOT upload NSFW. Please. Don't.</p><br><a href="/">back to home</a></b></center>`)
		return
	}
	if(req.url==='/upload-file') {
		if(req.method.toLowerCase() === 'post') {
			let form = new formidable.IncomingForm();
			var ip = req.connection.remoteAddress;
			form.uploadDir = path.join(__dirname, 'files');
			form.keepExtensions = true;
			form.parse(req, (err, fields, files) => {
				if(err) {
					res.writeHead(500, {'Content-Type': 'text/html'})
					res.end(prefix + `<b>something is breaking :(<br>if you are dell then check the console</b></center>`)
					return
				}
				if(data.bannedIPs.includes(ip)) {
					fs.unlinkSync(files.upload[0].filepath)
					res.writeHead(401, {'Content-Type': 'text/html'})
					res.end('<h1>401 Unauthorized</h1><p>nsfw does not belong on fbin</p>')
					return
				}
				
				
				hash = getHashSync(files.upload[0].filepath)
				if(data.bannedHashes.includes(hash)) {
					fs.unlinkSync(files.upload[0].filepath)
					res.writeHead(401, {'Content-Type': 'text/html'})
					res.end('<h1>401 Unauthorized</h1><p>nsfw does not belong on fbin</p>')
					data.bannedIPs.push(ip)
					fs.writeFileSync(path.join(__dirname,'data.json'), JSON.stringify(data))
					return
				}
				fs.renameSync(files.upload[0].filepath, path.join(__dirname, 'files', files.upload[0].originalFilename))
				
				if((files.upload[0].originalFilename.endsWith('.jpg'))||(files.upload[0].originalFilename.endsWith('.png'))||(files.upload[0].originalFilename.endsWith('.jpeg'))||(files.upload[0].originalFilename.endsWith('.bmp'))||(files.upload[0].originalFilename.endsWith('.mov'))||(files.upload[0].originalFilename.endsWith('.avi'))||(files.upload[0].originalFilename.endsWith('.mp4'))) {
					console.log(`[UPLOAD] File ${files.upload[0].originalFilename} has been uploaded by a user with the IP of ${ip}, but is held for manual review.`)
					fs.moveSync(path.join(__dirname, 'files', files.upload[0].originalFilename), path.join(__dirname, 'pufferfish_files', files.upload[0].originalFilename))
					fs.writeFileSync(path.join(__dirname, 'pufferfish_metadata', 'ip.'+files.upload[0].originalFilename), ip)
					res.writeHead(200, {'Content-Type':'text/html'})
					res.end(`<h1>This file is being held for manual review.</h1><b>If this file is considered NSFW, you will be banned from uploading.</b>`)
				} else {
					console.log(`[UPLOAD] File ${files.upload[0].originalFilename} has been uploaded by a user with the IP of ${ip}`)
					res.writeHead(301, {'Location': '/'})
					res.end()
				}
			});
		} else {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(`${prefix}<b>nope<br><a href="/">back to home</a></b></center>`);
		}
		return
	}
	if(req.url==='/upload') {
		res.end(`${prefix}<b>PLEASE only use ASCII for uploaded filenames...</b><h3>Upload a file</h3><form action="/upload-file" method="post" enctype="multipart/form-data"><input type="file" name="upload" required><br><br><input type="submit" value="Upload"></form><br><h3>By uploading to fbin, you agree to <a href="/terms">its terms</a>.</h3><br><a href="/">back to home</a></center>`);
		return
	}	


	res.writeHead(404, {'Content-Type': 'text/html'})
	res.end(prefix + `<b>the resource at ${req.url} could not be found :(<br><a href="/">back to home</a></b></center>`)
  }
  }
}).listen(80, '0.0.0.0');
console.log('[LOG] HTTP server started.')




