console.clear()
var http = require('http');
var fs = require('fs-extra');
var path = require('path');
var mime = require('mime-types');
var crypto = require('crypto')
var formidable = require('formidable');
function getHashSync(e){return fileBuffer=fs.readFileSync(e),(hash=crypto.createHash("sha256")).update(fileBuffer),hash.digest("hex")}
var prefix = `<title>dell's file dumpster</title><center><h1>dell's file dumpster</h1>`
var admins = fs.readFileSync(path.join(__dirname,'admins.json'))
http.createServer((req, res) => {
  if(req.url.startsWith('/pile/')) {
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
		console.log(`[PUFFERFISH] The held file '${file}' was viewed by ${req.connection.remoteAddress}. Hopefully by an admin.`)
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
				console.log(`[VIEW] The inexistent file '${file}' was attempted to be viewed by ${req.connection.remoteAddress}.`)
				res.writeHead(404, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>the file '${file}' could not be found :(<br><a href="/">back to home</a></b></center>`)
      	 		} else {
				res.writeHead(500, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>something is breaking :(<br>if you are dell then check the console</b></center>`)
      			}
      			return
    		}
		console.log(`[VIEW] The file '${file}' was viewed by ${req.connection.remoteAddress}.`)
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
		list = '<form id="puffer" action="/pufferfish" method="post" enctype="multipart/form-data"><input type="submit" value="Pufferfish Dashboard"/></form>' + prefix + `<script type="application/javascript">function g(json){document.querySelector('input[name="ip"]').value=json.ip;fetch('/api/admins').then(r=>r.json()).then(c=>c.includes(json.ip)?console.log('authorized user :)'):document.getElementById('puffer').remove())}</script><script type="application/javascript" src="https://api.ipify.org?format=jsonp&callback=g"></script><h2>Please read <a href="/terms">the terms</a> before uploading!</h2><b>PLEASE only use ASCII for uploaded filenames...</b><h3>Uploaded files:</h3><hr><br>\n`
		files.forEach(file => { 
			list += `	<a href="/file/${file.name}">${file.name}</a><br>\n`
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
		var form = new formidable.IncomingForm()
		form.parse(req, (err, fields, files) => {
			if(!fields.ip) {
				console.log('[PUFFERFISH] An unauthorized user tried to approve '+req.url.slice(9))
				res.writeHead(404, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>the resource at ${req.url} could not be found :(<br><a href="/">back to home</a></b></center>`)
				return
			}
			if(!admins.includes(fields.ip[0])) {
				console.log('[PUFFERFISH] An unauthorized user tried to approve '+req.url.slice(9))
				res.writeHead(404, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>the resource at ${req.url} could not be found :(<br><a href="/">back to home</a></b></center>`)
				return
			}
			file = req.url.slice(9)
			if(fs.existsSync(path.join(__dirname, 'pufferfish_files', file))) {
				fs.unlinkSync(path.join(__dirname, 'pufferfish_metadata', `ip.${file}`))
				fs.moveSync(path.join(__dirname, 'pufferfish_files', file), path.join(__dirname, 'files', file))
				res.writeHead(200, {'Content-Type': 'text/html'})
				res.end(`<form id="e" method="post" action="/pufferfish"><input type="hidden" name="ip" value="${fields.ip}" /></form><script>document.getElementById("e").submit()</script>`)
				return
			}
			res.end('{"success":"false"}')
			
		})
		return
	}
	
	
	if(req.url.slice(0,8)==='/delete/') {
		var form = new formidable.IncomingForm()
		form.parse(req, (err, fields, files) => {
			if(!fields.ip) {
				console.log('[PUFFERFISH] An unauthorized user tried to view the Pufferfish dashboard')
				res.writeHead(404, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>the resource at ${req.url} could not be found :(<br><a href="/">back to home</a></b></center>`)
				return
			}
			if(!admins.includes(fields.ip[0])) {
				console.log('[PUFFERFISH] An unauthorized user tried to delete '+req.url.slice(8))
				res.writeHead(404, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>the resource at ${req.url} could not be found :(<br><a href="/">back to home</a></b></center>`)
				return
			}
			file = req.url.slice(8)
			if(fs.existsSync(path.join(__dirname, 'pufferfish_files', file))) {
				banned_ips = JSON.parse(fs.readFileSync(path.join(__dirname,'banned_ips.json')))
				bannedhashes = JSON.parse(fs.readFileSync(path.join(__dirname,'banned_hashes.json')))
				bannedhashes.push(getHashSync(path.join(__dirname, 'pufferfish_files', file)))
				banned_ips.push(fs.readFileSync(path.join(__dirname, 'pufferfish_metadata', `ip.${file}`)).toString())
				fs.writeFileSync(path.join(__dirname,'banned_ips.json'), JSON.stringify(banned_ips))
				fs.writeFileSync(path.join(__dirname,'banned_hashes.json'), JSON.stringify(bannedhashes))
				fs.unlinkSync(path.join(__dirname, 'pufferfish_metadata', `ip.${file}`))
				fs.unlinkSync(path.join(__dirname, 'pufferfish_files', file))
				res.writeHead(200, {'Content-Type': 'text/html'})
				res.end(`<form id="e" method="post" action="/pufferfish"><input type="hidden" name="ip" value="${fields.ip}" /></form><script>document.getElementById("e").submit()</script>`)
				return
			}
			res.end('{"success":"false"}')
			
		})
		return
	}
	
	
	if(req.url==='/pufferfish') {
		var form = new formidable.IncomingForm()
		form.parse(req, (err, fields, files) => {
			if(!fields.ip) {
				console.log('[PUFFERFISH] An unauthorized user tried to view the Pufferfish dashboard')
				res.writeHead(404, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>the resource at /pufferfish could not be found :(<br><a href="/">back to home</a></b></center>`)
				return
			}
			if(!admins.includes(fields.ip[0])) {
				console.log('[PUFFERFISH] An unauthorized user tried to view the Pufferfish dashboard')
				res.writeHead(404, {'Content-Type': 'text/html'})
				res.end(prefix + `<b>the resource at /pufferfish could not be found :(<br><a href="/">back to home</a></b></center>`)
				return
			}
			console.log('[PUFFERFISH] Someone viewed the dashboard!')
			files = fs.readdirSync(path.join(__dirname, 'pufferfish_files'), { withFileTypes: true }); 
			list = prefix + '<h2>Pufferfish</h2><h3>Files held for review:</h3><hr><br>\n'
			files.forEach(file => { 
				list += `	<a href="/pile/${file.name}">${file.name}</a><b style="text-indent:50px;word-spacing:50px"><form style="display:inline-block" action="/approve/${file.name}" method="post" enctype="multipart/form-data"><input name="ip" required style="display:none" value="${fields.ip[0]}"></input><input type="submit" value="Approve"/></form><form style="display:inline-block" action="/delete/${file.name}" method="post" enctype="multipart/form-data"><input name="ip" required style="display:none" value="${fields.ip[0]}"></input><input type="submit" value="Delete"/></form> IP:</b><b> ${fs.readFileSync(path.join(__dirname, 'pufferfish_metadata', `ip.${file.name}`)).toString()}</b><br>\n`
			}); 
			list += `<br><hr><br><b>PLEASE DO NOT APPROVE FILES THAT BREAK <a href="/terms">THE TERMS</a>!</b></center>`
			res.writeHead(200, {'Content-Type': 'text/html'})
			res.end(list)
			return
		})
		return
	}
	if(req.url==='/terms') {
		res.writeHead(200, {'Content-Type': 'text/html'})
		res.end(prefix + `<h2>PLEASE FOLLOW THESE TERMS</h2><b>Inappropriate content is an eyesore and is a bannable offence.<br>Promoting inappropriate sites is also seen as an eyesore and is a bannable offence.<br>Anyone who disagrees deserves to get their PC wiped and destroyed and to get arrested for life.</b><br><a href="/">back to home</a></b></center>`)
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
				banned_ips = JSON.parse(fs.readFileSync(path.join(__dirname,'banned_ips.json')))
				if(banned_ips.includes(ip)) {
					fs.unlinkSync(files.upload[0].filepath)
					res.writeHead(401, {'Content-Type': 'text/html'})
					res.end('<h1>401 Unauthorized</h1><p>inappropriate content does not belong in fbin, sussy baka</p>')
					return
				}
				
				
				bannedhashes = JSON.parse(fs.readFileSync(path.join(__dirname,'banned_hashes.json')))
				hash = getHashSync(files.upload[0].filepath)
				if(bannedhashes.includes(hash)) {
					fs.unlinkSync(files.upload[0].filepath)
					res.writeHead(401, {'Content-Type': 'text/html'})
					res.end('<h1>401 Unauthorized</h1><p>inappropriate content does not belong in fbin, sussy baka</p>')
					banned_ips.push(ip)
					fs.writeFileSync(path.join(__dirname,'banned_ips.json'), JSON.stringify(banned_ips))
					return
				}
				fs.renameSync(files.upload[0].filepath, path.join(__dirname, 'files', files.upload[0].originalFilename))
				
				if((files.upload[0].originalFilename.endsWith('.jpg'))||(files.upload[0].originalFilename.endsWith('.png'))||(files.upload[0].originalFilename.endsWith('.jpeg'))||(files.upload[0].originalFilename.endsWith('.bmp'))||(files.upload[0].originalFilename.endsWith('.mov'))||(files.upload[0].originalFilename.endsWith('.avi'))||(files.upload[0].originalFilename.endsWith('.mp4'))) {
					console.log(`[UPLOAD] File ${files.upload[0].originalFilename} has been uploaded by a user with the IP of ${ip}, but is held for manual review.`)
					fs.moveSync(path.join(__dirname, 'files', files.upload[0].originalFilename), path.join(__dirname, 'pufferfish_files', files.upload[0].originalFilename))
					fs.writeFileSync(path.join(__dirname, 'pufferfish_metadata', 'ip.'+files.upload[0].originalFilename), ip)
					res.writeHead(200, {'Content-Type':'text/html'})
					res.end(`<h1>This file is being held for manual review.</h1><b>If this file is inappropriate, you will be banned from uploading.</b>`)
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
		res.end(`${prefix}<b>PLEASE only use ASCII for uploaded filenames...</b><h3>Upload a file</h3><form action="/upload-file" method="post" enctype="multipart/form-data"><input type="file" name="upload" required><input name="ip" required style="display:none"><script type="application/javascript">function g(json){document.querySelector('input[name="ip"]').value=json.ip}</script><script type="application/javascript" src="https://api.ipify.org?format=jsonp&callback=g"></script><br><br><input type="submit" value="Upload"></form><br><h3>By uploading to fbin, you agree to <a href="/terms">its terms</a>.</h3><br><a href="/">back to home</a></center>`);
		return
	}	


	res.writeHead(404, {'Content-Type': 'text/html'})
	res.end(prefix + `<b>the resource at ${req.url} could not be found :(<br><a href="/">back to home</a></b></center>`)
  }
  }
}).listen(80, '0.0.0.0');
console.log('[LOG] HTTP server started.')

