var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
// Regex to split the tail part of the above into [*, dir, basename, ext]
var splitTailRe = /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;
// Function to split a filename into [root, dir, basename, ext]
function win32SplitPath(filename) {
    // Separate device+slash from tail
    var result = splitDeviceRe.exec(filename), device = (result[1] || '') + (result[2] || ''), tail = result[3] || '';
    // Split the tail into dir, basename and extension
    var result2 = splitTailRe.exec(tail), dir = result2[1], basename = result2[2], ext = result2[3];
    return [device, dir, basename, ext];
}

var pathModule = {
    dirname(path) {
        var result = win32SplitPath(path), root = result[0], dir = result[1];
        if (!root && !dir) {
            return '.';
        }
        if (dir) {
            dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
    },
    resolve(dir, url) {
        let arr1 = dir.split("\\");
        let arr2 = url.split("/");
        arr2.reverse();
        while (arr2[arr2.length - 1] == "..") {
            arr2.pop();
            arr1.pop();
        }
        arr2.reverse();
        let newUrl = arr1.join("/") + "/" + arr2.join("/");
        return newUrl;
    },
}

var fsModule = {
    existsSync(path) {
        return true;
    },
    readFileSync(path) {
        let str = UE.GameHelper.LoadFile(path);
        return str;
    },
}

if(puerts!=undefined)
{
	try{
		puerts.registerBuildinModule("path",pathModule);
		puerts.registerBuildinModule("fs", fsModule);
		require('source-map-support').install();
	}
	catch(error)
	{
		console.error(error)
	}
	
}