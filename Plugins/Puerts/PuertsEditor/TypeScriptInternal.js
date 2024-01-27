"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSourceFilePathInNewDir = exports.removeExtension = exports.removeFileExtension = exports.matchFiles = exports.getDirectoryPath = exports.getBaseFileName = exports.normalizePath = exports.getAccessibleFileSystemEntries = exports.realpath = exports.createDirectory = exports.directoryExists = exports.resolvePath = exports.combinePaths = void 0;
var UE = require("ue");
function some(array, predicate) {
    if (array) {
        if (predicate) {
            for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                var v = array_1[_i];
                if (predicate(v)) {
                    return true;
                }
            }
        }
        else {
            return array.length > 0;
        }
    }
    return false;
}
var directorySeparator = "/";
var altDirectorySeparator = "\\";
var urlSchemeSeparator = "://";
var backslashRegExp = /\\/g;
var reservedCharacterPattern = /[^\w\s\/]/g;
var commonPackageFolders = ["node_modules", "bower_components", "jspm_packages"];
var implicitExcludePathRegexPattern = "(?!(".concat(commonPackageFolders.join("|"), ")(/|$))");
function normalizeSlashes(path) {
    return path.replace(backslashRegExp, directorySeparator);
}
function isVolumeCharacter(charCode) {
    return (charCode >= 97 /* CharacterCodes.a */ && charCode <= 122 /* CharacterCodes.z */) ||
        (charCode >= 65 /* CharacterCodes.A */ && charCode <= 90 /* CharacterCodes.Z */);
}
function getFileUrlVolumeSeparatorEnd(url, start) {
    var ch0 = url.charCodeAt(start);
    if (ch0 === 58 /* CharacterCodes.colon */)
        return start + 1;
    if (ch0 === 37 /* CharacterCodes.percent */ && url.charCodeAt(start + 1) === 51 /* CharacterCodes._3 */) {
        var ch2 = url.charCodeAt(start + 2);
        if (ch2 === 97 /* CharacterCodes.a */ || ch2 === 65 /* CharacterCodes.A */)
            return start + 3;
    }
    return -1;
}
function getEncodedRootLength(path) {
    if (!path)
        return 0;
    var ch0 = path.charCodeAt(0);
    // POSIX or UNC
    if (ch0 === 47 /* CharacterCodes.slash */ || ch0 === 92 /* CharacterCodes.backslash */) {
        if (path.charCodeAt(1) !== ch0)
            return 1; // POSIX: "/" (or non-normalized "\")
        var p1 = path.indexOf(ch0 === 47 /* CharacterCodes.slash */ ? directorySeparator : altDirectorySeparator, 2);
        if (p1 < 0)
            return path.length; // UNC: "//server" or "\\server"
        return p1 + 1; // UNC: "//server/" or "\\server\"
    }
    // DOS
    if (isVolumeCharacter(ch0) && path.charCodeAt(1) === 58 /* CharacterCodes.colon */) {
        var ch2 = path.charCodeAt(2);
        if (ch2 === 47 /* CharacterCodes.slash */ || ch2 === 92 /* CharacterCodes.backslash */)
            return 3; // DOS: "c:/" or "c:\"
        if (path.length === 2)
            return 2; // DOS: "c:" (but not "c:d")
    }
    // URL
    var schemeEnd = path.indexOf(urlSchemeSeparator);
    if (schemeEnd !== -1) {
        var authorityStart = schemeEnd + urlSchemeSeparator.length;
        var authorityEnd = path.indexOf(directorySeparator, authorityStart);
        if (authorityEnd !== -1) { // URL: "file:///", "file://server/", "file://server/path"
            // For local "file" URLs, include the leading DOS volume (if present).
            // Per https://www.ietf.org/rfc/rfc1738.txt, a host of "" or "localhost" is a
            // special case interpreted as "the machine from which the URL is being interpreted".
            var scheme = path.slice(0, schemeEnd);
            var authority = path.slice(authorityStart, authorityEnd);
            if (scheme === "file" && (authority === "" || authority === "localhost") &&
                isVolumeCharacter(path.charCodeAt(authorityEnd + 1))) {
                var volumeSeparatorEnd = getFileUrlVolumeSeparatorEnd(path, authorityEnd + 2);
                if (volumeSeparatorEnd !== -1) {
                    if (path.charCodeAt(volumeSeparatorEnd) === 47 /* CharacterCodes.slash */) {
                        // URL: "file:///c:/", "file://localhost/c:/", "file:///c%3a/", "file://localhost/c%3a/"
                        return ~(volumeSeparatorEnd + 1);
                    }
                    if (volumeSeparatorEnd === path.length) {
                        // URL: "file:///c:", "file://localhost/c:", "file:///c$3a", "file://localhost/c%3a"
                        // but not "file:///c:d" or "file:///c%3ad"
                        return ~volumeSeparatorEnd;
                    }
                }
            }
            return ~(authorityEnd + 1); // URL: "file://server/", "http://server/"
        }
        return ~path.length; // URL: "file://server", "http://server"
    }
    // relative
    return 0;
}
function getRootLength(path) {
    var rootLength = getEncodedRootLength(path);
    return rootLength < 0 ? ~rootLength : rootLength;
}
function hasTrailingDirectorySeparator(path) {
    if (path.length === 0)
        return false;
    var ch = path.charCodeAt(path.length - 1);
    return ch === 47 /* CharacterCodes.slash */ || ch === 92 /* CharacterCodes.backslash */;
}
function ensureTrailingDirectorySeparator(path) {
    if (!hasTrailingDirectorySeparator(path)) {
        return path + directorySeparator;
    }
    return path;
}
function combinePaths(path) {
    var paths = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        paths[_i - 1] = arguments[_i];
    }
    if (path)
        path = normalizeSlashes(path);
    for (var _a = 0, paths_1 = paths; _a < paths_1.length; _a++) {
        var relativePath = paths_1[_a];
        if (!relativePath)
            continue;
        relativePath = normalizeSlashes(relativePath);
        if (!path || getRootLength(relativePath) !== 0) {
            path = relativePath;
        }
        else {
            path = ensureTrailingDirectorySeparator(path) + relativePath;
        }
    }
    return path;
}
exports.combinePaths = combinePaths;
function lastOrUndefined(array) {
    return array.length === 0 ? undefined : array[array.length - 1];
}
function pathComponents(path, rootLength) {
    var root = path.substring(0, rootLength);
    var rest = path.substring(rootLength).split(directorySeparator);
    if (rest.length && !lastOrUndefined(rest))
        rest.pop();
    return __spreadArray([root], rest, true);
}
function getPathComponents(path, currentDirectory) {
    if (currentDirectory === void 0) { currentDirectory = ""; }
    path = combinePaths(currentDirectory, path);
    var rootLength = getRootLength(path);
    return pathComponents(path, rootLength);
}
function reducePathComponents(components) {
    if (!some(components))
        return [];
    var reduced = [components[0]];
    for (var i = 1; i < components.length; i++) {
        var component = components[i];
        if (!component)
            continue;
        if (component === ".")
            continue;
        if (component === "..") {
            if (reduced.length > 1) {
                if (reduced[reduced.length - 1] !== "..") {
                    reduced.pop();
                    continue;
                }
            }
            else if (reduced[0])
                continue;
        }
        reduced.push(component);
    }
    return reduced;
}
function getPathFromPathComponents(pathComponents) {
    if (pathComponents.length === 0)
        return "";
    var root = pathComponents[0] && ensureTrailingDirectorySeparator(pathComponents[0]);
    return root + pathComponents.slice(1).join(directorySeparator);
}
function resolvePath(path) {
    var paths = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        paths[_i - 1] = arguments[_i];
    }
    var combined = some(paths) ? combinePaths.apply(void 0, __spreadArray([path], paths, false)) : normalizeSlashes(path);
    var normalized = getPathFromPathComponents(reducePathComponents(getPathComponents(combined)));
    return normalized && hasTrailingDirectorySeparator(combined) ? ensureTrailingDirectorySeparator(normalized) : normalized;
}
exports.resolvePath = resolvePath;
function directoryExists(path) {
    var res = UE.FileSystemOperation.DirectoryExists(path);
    return res;
}
exports.directoryExists = directoryExists;
function createDirectory(path) {
    UE.FileSystemOperation.CreateDirectory(path);
}
exports.createDirectory = createDirectory;
function realpath(path) {
    return path;
}
exports.realpath = realpath;
var emptyArray = [];
var emptyFileSystemEntries = {
    files: emptyArray,
    directories: emptyArray
};
function getAccessibleFileSystemEntries(path) {
    try {
        var files = [];
        var directories = [];
        var dirArray = UE.FileSystemOperation.GetDirectories(path);
        for (var i = 0; i < dirArray.Num(); i++) {
            directories.push(dirArray.Get(i));
        }
        var fileArray = UE.FileSystemOperation.GetFiles(path);
        for (var i = 0; i < fileArray.Num(); i++) {
            files.push(fileArray.Get(i));
        }
        return { files: files, directories: directories };
    }
    catch (e) {
        return emptyFileSystemEntries;
    }
}
exports.getAccessibleFileSystemEntries = getAccessibleFileSystemEntries;
function normalizePath(path) {
    return resolvePath(path);
}
exports.normalizePath = normalizePath;
function map(array, f) {
    var result;
    if (array) {
        result = [];
        for (var i = 0; i < array.length; i++) {
            result.push(f(array[i], i));
        }
    }
    return result;
}
function isArray(value) {
    return Array.isArray ? Array.isArray(value) : value instanceof Array;
}
function toOffset(array, offset) {
    return offset < 0 ? array.length + offset : offset;
}
function addRange(to, from, start, end) {
    if (from === undefined || from.length === 0)
        return to;
    if (to === undefined)
        return from.slice(start, end);
    start = start === undefined ? 0 : toOffset(from, start);
    end = end === undefined ? from.length : toOffset(from, end);
    for (var i = start; i < end && i < from.length; i++) {
        if (from[i] !== undefined) {
            to.push(from[i]);
        }
    }
    return to;
}
function append(to, value) {
    if (value === undefined)
        return to;
    if (to === undefined)
        return [value];
    to.push(value);
    return to;
}
function flatMap(array, mapfn) {
    var result;
    if (array) {
        for (var i = 0; i < array.length; i++) {
            var v = mapfn(array[i], i);
            if (v) {
                if (isArray(v)) {
                    result = addRange(result, v);
                }
                else {
                    result = append(result, v);
                }
            }
        }
    }
    return result || emptyArray;
}
function getNormalizedPathComponents(path, currentDirectory) {
    return reducePathComponents(getPathComponents(path, currentDirectory));
}
function last(array) {
    return array[array.length - 1];
}
function removeTrailingDirectorySeparator(path) {
    if (hasTrailingDirectorySeparator(path)) {
        return path.substr(0, path.length - 1);
    }
    return path;
}
function isImplicitGlob(lastPathComponent) {
    return !/[.*?]/.test(lastPathComponent);
}
function getSubPatternFromSpec(spec, basePath, usage, _a) {
    var singleAsteriskRegexFragment = _a.singleAsteriskRegexFragment, doubleAsteriskRegexFragment = _a.doubleAsteriskRegexFragment, replaceWildcardCharacter = _a.replaceWildcardCharacter;
    var subpattern = "";
    var hasWrittenComponent = false;
    var components = getNormalizedPathComponents(spec, basePath);
    var lastComponent = last(components);
    if (usage !== "exclude" && lastComponent === "**") {
        return undefined;
    }
    // getNormalizedPathComponents includes the separator for the root component.
    // We need to remove to create our regex correctly.
    components[0] = removeTrailingDirectorySeparator(components[0]);
    if (isImplicitGlob(lastComponent)) {
        components.push("**", "*");
    }
    var optionalCount = 0;
    for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
        var component = components_1[_i];
        if (component === "**") {
            subpattern += doubleAsteriskRegexFragment;
        }
        else {
            if (usage === "directories") {
                subpattern += "(";
                optionalCount++;
            }
            if (hasWrittenComponent) {
                subpattern += directorySeparator;
            }
            if (usage !== "exclude") {
                var componentPattern = "";
                // The * and ? wildcards should not match directories or files that start with . if they
                // appear first in a component. Dotted directories and files can be included explicitly
                // like so: **/.*/.*
                if (component.charCodeAt(0) === 42 /* CharacterCodes.asterisk */) {
                    componentPattern += "([^./]" + singleAsteriskRegexFragment + ")?";
                    component = component.substr(1);
                }
                else if (component.charCodeAt(0) === 63 /* CharacterCodes.question */) {
                    componentPattern += "[^./]";
                    component = component.substr(1);
                }
                componentPattern += component.replace(reservedCharacterPattern, replaceWildcardCharacter);
                // Patterns should not include subfolders like node_modules unless they are
                // explicitly included as part of the path.
                //
                // As an optimization, if the component pattern is the same as the component,
                // then there definitely were no wildcard characters and we do not need to
                // add the exclusion pattern.
                if (componentPattern !== component) {
                    subpattern += implicitExcludePathRegexPattern;
                }
                subpattern += componentPattern;
            }
            else {
                subpattern += component.replace(reservedCharacterPattern, replaceWildcardCharacter);
            }
        }
        //modify by john, 如果使用相对路径，最后面的pattern会添加一个/到开头，导致匹配失败
        // hasWrittenComponent = !!component;
        //modify by zombie，上述改动会导致Mac无法watch到TS文件，据车神说现在已经不用相对路径，因此回滚
        hasWrittenComponent = true;
    }
    while (optionalCount > 0) {
        subpattern += ")?";
        optionalCount--;
    }
    return subpattern;
}
function replaceWildcardCharacter(match, singleAsteriskRegexFragment) {
    return match === "*" ? singleAsteriskRegexFragment : match === "?" ? "[^/]" : "\\" + match;
}
var filesMatcher = {
    /**
     * Matches any single directory segment unless it is the last segment and a .min.js file
     * Breakdown:
     *  [^./]                   # matches everything up to the first . character (excluding directory separators)
     *  (\\.(?!min\\.js$))?     # matches . characters but not if they are part of the .min.js file extension
     */
    singleAsteriskRegexFragment: "([^./]|(\\.(?!min\\.js$))?)*",
    /**
     * Regex for the ** wildcard. Matches any number of subdirectories. When used for including
     * files or directories, does not match subdirectories that start with a . character
     */
    doubleAsteriskRegexFragment: "(/".concat(implicitExcludePathRegexPattern, "[^/.][^/]*)*?"),
    replaceWildcardCharacter: function (match) { return replaceWildcardCharacter(match, filesMatcher.singleAsteriskRegexFragment); }
};
var directoriesMatcher = {
    singleAsteriskRegexFragment: "[^/]*",
    /**
     * Regex for the ** wildcard. Matches any number of subdirectories. When used for including
     * files or directories, does not match subdirectories that start with a . character
     */
    doubleAsteriskRegexFragment: "(/".concat(implicitExcludePathRegexPattern, "[^/.][^/]*)*?"),
    replaceWildcardCharacter: function (match) { return replaceWildcardCharacter(match, directoriesMatcher.singleAsteriskRegexFragment); }
};
var excludeMatcher = {
    singleAsteriskRegexFragment: "[^/]*",
    doubleAsteriskRegexFragment: "(/.+?)?",
    replaceWildcardCharacter: function (match) { return replaceWildcardCharacter(match, excludeMatcher.singleAsteriskRegexFragment); }
};
var wildcardMatchers = {
    files: filesMatcher,
    directories: directoriesMatcher,
    exclude: excludeMatcher
};
function getRegularExpressionsForWildcards(specs, basePath, usage) {
    if (specs === undefined || specs.length === 0) {
        return undefined;
    }
    return flatMap(specs, function (spec) {
        return spec && getSubPatternFromSpec(spec, basePath, usage, wildcardMatchers[usage]);
    });
}
function getRegularExpressionForWildcard(specs, basePath, usage) {
    var patterns = getRegularExpressionsForWildcards(specs, basePath, usage);
    if (!patterns || !patterns.length) {
        return undefined;
    }
    var pattern = patterns.map(function (pattern) { return "(".concat(pattern, ")"); }).join("|");
    // If excluding, match "foo/bar/baz...", but if including, only allow "foo".
    var terminator = usage === "exclude" ? "($|/)" : "$";
    return "^(".concat(pattern, ")").concat(terminator);
}
function isRootedDiskPath(path) {
    return getEncodedRootLength(path) > 0;
}
function contains(array, value, equalityComparer) {
    if (equalityComparer === void 0) { equalityComparer = equateValues; }
    if (array) {
        for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
            var v = array_2[_i];
            if (equalityComparer(v, value)) {
                return true;
            }
        }
    }
    return false;
}
function equateStringsCaseInsensitive(a, b) {
    return a === b
        || a !== undefined
            && b !== undefined
            && a.toUpperCase() === b.toUpperCase();
}
function equateValues(a, b) {
    return a === b;
}
function equateStringsCaseSensitive(a, b) {
    return equateValues(a, b);
}
function startsWith(str, prefix) {
    return str.lastIndexOf(prefix, 0) === 0;
}
function getAnyExtensionFromPathWorker(path, extensions, stringEqualityComparer) {
    if (typeof extensions === "string")
        extensions = [extensions];
    for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
        var extension = extensions_1[_i];
        if (!startsWith(extension, "."))
            extension = "." + extension;
        if (path.length >= extension.length && path.charAt(path.length - extension.length) === ".") {
            var pathExtension = path.slice(path.length - extension.length);
            if (stringEqualityComparer(pathExtension, extension)) {
                return pathExtension;
            }
        }
    }
    return "";
}
function getAnyExtensionFromPath(path, extensions, ignoreCase) {
    // Retrieves any string from the final "." onwards from a base file name.
    // Unlike extensionFromPath, which throws an exception on unrecognized extensions.
    if (extensions) {
        return getAnyExtensionFromPathWorker(path, extensions, ignoreCase ? equateStringsCaseInsensitive : equateStringsCaseSensitive);
    }
    var baseFileName = getBaseFileName(path);
    var extensionIndex = baseFileName.lastIndexOf(".");
    if (extensionIndex >= 0) {
        return baseFileName.substring(extensionIndex);
    }
    return "";
}
function getBaseFileName(path, extensions, ignoreCase) {
    path = normalizeSlashes(path);
    // if the path provided is itself the root, then it has not file name.
    var rootLength = getRootLength(path);
    if (rootLength === path.length)
        return "";
    // return the trailing portion of the path starting after the last (non-terminal) directory
    // separator but not including any trailing directory separator.
    path = removeTrailingDirectorySeparator(path);
    var name = path.slice(Math.max(getRootLength(path), path.lastIndexOf(directorySeparator) + 1));
    var extension = extensions !== undefined && ignoreCase !== undefined ? getAnyExtensionFromPath(name, extensions, ignoreCase) : undefined;
    return extension ? name.slice(0, name.length - extension.length) : name;
}
exports.getBaseFileName = getBaseFileName;
function stringContains(str, substring) {
    return str.indexOf(substring) !== -1;
}
function hasExtension(fileName) {
    return stringContains(getBaseFileName(fileName), ".");
}
function indexOfAnyCharCode(text, charCodes, start) {
    for (var i = start || 0; i < text.length; i++) {
        if (contains(charCodes, text.charCodeAt(i))) {
            return i;
        }
    }
    return -1;
}
var wildcardCharCodes = [42 /* CharacterCodes.asterisk */, 63 /* CharacterCodes.question */];
function getDirectoryPath(path) {
    path = normalizeSlashes(path);
    // If the path provided is itself the root, then return it.
    var rootLength = getRootLength(path);
    if (rootLength === path.length)
        return path;
    // return the leading portion of the path up to the last (non-terminal) directory separator
    // but not including any trailing directory separator.
    path = removeTrailingDirectorySeparator(path);
    return path.slice(0, Math.max(rootLength, path.lastIndexOf(directorySeparator)));
}
exports.getDirectoryPath = getDirectoryPath;
function getIncludeBasePath(absolute) {
    var wildcardOffset = indexOfAnyCharCode(absolute, wildcardCharCodes);
    if (wildcardOffset < 0) {
        // No "*" or "?" in the path
        return !hasExtension(absolute)
            ? absolute
            : removeTrailingDirectorySeparator(getDirectoryPath(absolute));
    }
    return absolute.substring(0, absolute.lastIndexOf(directorySeparator, wildcardOffset));
}
function compareComparableValues(a, b) {
    return a === b ? 0 /* Comparison.EqualTo */ :
        a === undefined ? -1 /* Comparison.LessThan */ :
            b === undefined ? 1 /* Comparison.GreaterThan */ :
                a < b ? -1 /* Comparison.LessThan */ :
                    1 /* Comparison.GreaterThan */;
}
function compareStringsCaseInsensitive(a, b) {
    if (a === b)
        return 0 /* Comparison.EqualTo */;
    if (a === undefined)
        return -1 /* Comparison.LessThan */;
    if (b === undefined)
        return 1 /* Comparison.GreaterThan */;
    a = a.toUpperCase();
    b = b.toUpperCase();
    return a < b ? -1 /* Comparison.LessThan */ : a > b ? 1 /* Comparison.GreaterThan */ : 0 /* Comparison.EqualTo */;
}
function compareStringsCaseSensitive(a, b) {
    return compareComparableValues(a, b);
}
function getStringComparer(ignoreCase) {
    return ignoreCase ? compareStringsCaseInsensitive : compareStringsCaseSensitive;
}
function containsPath(parent, child, currentDirectory, ignoreCase) {
    if (typeof currentDirectory === "string") {
        parent = combinePaths(currentDirectory, parent);
        child = combinePaths(currentDirectory, child);
    }
    else if (typeof currentDirectory === "boolean") {
        ignoreCase = currentDirectory;
    }
    if (parent === undefined || child === undefined)
        return false;
    if (parent === child)
        return true;
    var parentComponents = reducePathComponents(getPathComponents(parent));
    var childComponents = reducePathComponents(getPathComponents(child));
    if (childComponents.length < parentComponents.length) {
        return false;
    }
    var componentEqualityComparer = ignoreCase ? equateStringsCaseInsensitive : equateStringsCaseSensitive;
    for (var i = 0; i < parentComponents.length; i++) {
        var equalityComparer = i === 0 ? equateStringsCaseInsensitive : componentEqualityComparer;
        if (!equalityComparer(parentComponents[i], childComponents[i])) {
            return false;
        }
    }
    return true;
}
function every(array, callback) {
    if (array) {
        for (var i = 0; i < array.length; i++) {
            if (!callback(array[i], i)) {
                return false;
            }
        }
    }
    return true;
}
function getBasePaths(path, includes, useCaseSensitiveFileNames) {
    // Storage for our results in the form of literal paths (e.g. the paths as written by the user).
    var basePaths = [path];
    if (includes) {
        // Storage for literal base paths amongst the include patterns.
        var includeBasePaths = [];
        for (var _i = 0, includes_1 = includes; _i < includes_1.length; _i++) {
            var include = includes_1[_i];
            // We also need to check the relative paths by converting them to absolute and normalizing
            // in case they escape the base path (e.g "..\somedirectory")
            var absolute = isRootedDiskPath(include) ? include : normalizePath(combinePaths(path, include));
            // Append the literal and canonical candidate base paths.
            includeBasePaths.push(getIncludeBasePath(absolute));
        }
        // Sort the offsets array using either the literal or canonical path representations.
        includeBasePaths.sort(getStringComparer(!useCaseSensitiveFileNames));
        var _loop_1 = function (includeBasePath) {
            if (every(basePaths, function (basePath) { return !containsPath(basePath, includeBasePath, path, !useCaseSensitiveFileNames); })) {
                basePaths.push(includeBasePath);
            }
        };
        // Iterate over each include base path and include unique base paths that are not a
        // subpath of an existing base path
        for (var _a = 0, includeBasePaths_1 = includeBasePaths; _a < includeBasePaths_1.length; _a++) {
            var includeBasePath = includeBasePaths_1[_a];
            _loop_1(includeBasePath);
        }
    }
    return basePaths;
}
function getFileMatcherPatterns(path, excludes, includes, useCaseSensitiveFileNames, currentDirectory) {
    path = normalizePath(path);
    currentDirectory = normalizePath(currentDirectory);
    var absolutePath = combinePaths(currentDirectory, path);
    return {
        includeFilePatterns: map(getRegularExpressionsForWildcards(includes, absolutePath, "files"), function (pattern) { return "^".concat(pattern, "$"); }),
        includeFilePattern: getRegularExpressionForWildcard(includes, absolutePath, "files"),
        includeDirectoryPattern: getRegularExpressionForWildcard(includes, absolutePath, "directories"),
        excludePattern: getRegularExpressionForWildcard(excludes, absolutePath, "exclude"),
        basePaths: getBasePaths(path, includes, useCaseSensitiveFileNames)
    };
}
function getRegexFromPattern(pattern, useCaseSensitiveFileNames) {
    return new RegExp(pattern, useCaseSensitiveFileNames ? "" : "i");
}
function createMap() {
    return new Map();
}
function identity(x) { return x; }
function toLowerCase(x) { return x.toLowerCase(); }
function createGetCanonicalFileName(useCaseSensitiveFileNames) {
    return useCaseSensitiveFileNames ? identity : toLowerCase;
}
function flatten(array) {
    var result = [];
    for (var _i = 0, array_3 = array; _i < array_3.length; _i++) {
        var v = array_3[_i];
        if (v) {
            if (isArray(v)) {
                addRange(result, v);
            }
            else {
                result.push(v);
            }
        }
    }
    return result;
}
function endsWith(str, suffix) {
    var expectedPos = str.length - suffix.length;
    return expectedPos >= 0 && str.indexOf(suffix, expectedPos) === expectedPos;
}
function fileExtensionIs(path, extension) {
    return path.length > extension.length && endsWith(path, extension);
}
function fileExtensionIsOneOf(path, extensions) {
    for (var _i = 0, extensions_2 = extensions; _i < extensions_2.length; _i++) {
        var extension = extensions_2[_i];
        if (fileExtensionIs(path, extension)) {
            return true;
        }
    }
    return false;
}
function sort(array, comparer) {
    return (array.length === 0 ? array : array.slice().sort(comparer));
}
function findIndex(array, predicate, startIndex) {
    for (var i = startIndex || 0; i < array.length; i++) {
        if (predicate(array[i], i)) {
            return i;
        }
    }
    return -1;
}
function matchFiles(path, extensions, excludes, includes, useCaseSensitiveFileNames, currentDirectory, depth, getFileSystemEntries, realpath) {
    path = normalizePath(path);
    currentDirectory = normalizePath(currentDirectory);
    var patterns = getFileMatcherPatterns(path, excludes, includes, useCaseSensitiveFileNames, currentDirectory);
    var includeFileRegexes = patterns.includeFilePatterns && patterns.includeFilePatterns.map(function (pattern) { return getRegexFromPattern(pattern, useCaseSensitiveFileNames); });
    var includeDirectoryRegex = patterns.includeDirectoryPattern && getRegexFromPattern(patterns.includeDirectoryPattern, useCaseSensitiveFileNames);
    var excludeRegex = patterns.excludePattern && getRegexFromPattern(patterns.excludePattern, useCaseSensitiveFileNames);
    // Associate an array of results with each include regex. This keeps results in order of the "include" order.
    // If there are no "includes", then just put everything in results[0].
    var results = includeFileRegexes ? includeFileRegexes.map(function () { return []; }) : [[]];
    var visited = createMap();
    var toCanonical = createGetCanonicalFileName(useCaseSensitiveFileNames);
    for (var _i = 0, _a = patterns.basePaths; _i < _a.length; _i++) {
        var basePath = _a[_i];
        visitDirectory(basePath, combinePaths(currentDirectory, basePath), depth);
    }
    return flatten(results);
    function visitDirectory(path, absolutePath, depth) {
        var canonicalPath = toCanonical(realpath(absolutePath));
        if (visited.has(canonicalPath))
            return;
        visited.set(canonicalPath, true);
        var _a = getFileSystemEntries(path), files = _a.files, directories = _a.directories;
        var _loop_2 = function (current) {
            var name_1 = combinePaths(path, current);
            var absoluteName = combinePaths(absolutePath, current);
            if (extensions && !fileExtensionIsOneOf(name_1, extensions))
                return "continue";
            if (excludeRegex && excludeRegex.test(absoluteName))
                return "continue";
            if (!includeFileRegexes) {
                results[0].push(name_1);
            }
            else {
                var includeIndex = findIndex(includeFileRegexes, function (re) { return re.test(absoluteName); });
                if (includeIndex !== -1) {
                    results[includeIndex].push(name_1);
                }
            }
        };
        for (var _i = 0, _b = sort(files, compareStringsCaseSensitive); _i < _b.length; _i++) {
            var current = _b[_i];
            _loop_2(current);
        }
        if (depth !== undefined) {
            depth--;
            if (depth === 0) {
                return;
            }
        }
        for (var _c = 0, _d = sort(directories, compareStringsCaseSensitive); _c < _d.length; _c++) {
            var current = _d[_c];
            var name_2 = combinePaths(path, current);
            var absoluteName = combinePaths(absolutePath, current);
            if ((!includeDirectoryRegex || includeDirectoryRegex.test(absoluteName)) &&
                (!excludeRegex || !excludeRegex.test(absoluteName))) {
                visitDirectory(name_2, absoluteName, depth);
            }
        }
    }
}
exports.matchFiles = matchFiles;
var extensionsToRemove = [".d.ts" /* Extension.Dts */, ".ts" /* Extension.Ts */, ".js" /* Extension.Js */, ".tsx" /* Extension.Tsx */, ".jsx" /* Extension.Jsx */, ".json" /* Extension.Json */];
function removeFileExtension(path) {
    for (var _i = 0, extensionsToRemove_1 = extensionsToRemove; _i < extensionsToRemove_1.length; _i++) {
        var ext = extensionsToRemove_1[_i];
        var extensionless = tryRemoveExtension(path, ext);
        if (extensionless !== undefined) {
            return extensionless;
        }
    }
    return path;
}
exports.removeFileExtension = removeFileExtension;
function tryRemoveExtension(path, extension) {
    return fileExtensionIs(path, extension) ? removeExtension(path, extension) : undefined;
}
function removeExtension(path, extension) {
    return path.substring(0, path.length - extension.length);
}
exports.removeExtension = removeExtension;
function getSourceFilePathInNewDir(fileName, currentDirectory, commonSourceDirectory, newDirPath) {
    return getSourceFilePathInNewDirWorker(fileName, newDirPath, currentDirectory, commonSourceDirectory, createGetCanonicalFileName(true));
}
exports.getSourceFilePathInNewDir = getSourceFilePathInNewDir;
function getNormalizedAbsolutePath(fileName, currentDirectory) {
    return getPathFromPathComponents(getNormalizedPathComponents(fileName, currentDirectory));
}
function getSourceFilePathInNewDirWorker(fileName, newDirPath, currentDirectory, commonSourceDirectory, getCanonicalFileName) {
    var sourceFilePath = getNormalizedAbsolutePath(fileName, currentDirectory);
    var isSourceFileInCommonSourceDirectory = getCanonicalFileName(sourceFilePath).indexOf(getCanonicalFileName(commonSourceDirectory)) === 0;
    sourceFilePath = isSourceFileInCommonSourceDirectory ? sourceFilePath.substring(commonSourceDirectory.length) : sourceFilePath;
    return combinePaths(newDirPath, sourceFilePath);
}
//-----------------------end copy form typescript--------------------
