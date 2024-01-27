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
var UE = require("ue");
var puerts_1 = require("puerts");
var ts = require("typescript");
var tsi = require("./TypeScriptInternal");
var uemeta = require("./UEMeta");
var cpp = require("cpp");
function getCustomSystem() {
    var customSystem = {
        args: [],
        newLine: '\n',
        useCaseSensitiveFileNames: true,
        write: write,
        readFile: readFile,
        writeFile: writeFile,
        resolvePath: tsi.resolvePath,
        fileExists: fileExists,
        directoryExists: tsi.directoryExists,
        createDirectory: tsi.createDirectory,
        getExecutingFilePath: getExecutingFilePath,
        getCurrentDirectory: getCurrentDirectory,
        getDirectories: getDirectories,
        readDirectory: readDirectory,
        exit: exit,
    };
    function fileExists(path) {
        var res = UE.FileSystemOperation.FileExists(path);
        //console.log(`${path} exists? ${res}`);
        return res;
    }
    function write(s) {
        console.log(s);
    }
    function readFile(path, encoding) {
        var data = (0, puerts_1.$ref)(undefined);
        var res = UE.FileSystemOperation.ReadFile(path, data);
        if (res) {
            return (0, puerts_1.$unref)(data);
        }
        else {
            console.warn("readFile: read file fail! path=" + path + ", stack:" + new Error().stack);
            return undefined;
        }
    }
    function writeFile(path, data, writeByteOrderMark) {
        throw new Error("forbiden!");
    }
    /*function resolvePath(path: string): string {
        throw new Error("resolvePath no supported!");
    }*/
    function readDirectory(path, extensions, excludes, includes, depth) {
        //throw new Error("readDirectory no supported!");
        return tsi.matchFiles(path, extensions, excludes, includes, true, getCurrentDirectory(), depth, tsi.getAccessibleFileSystemEntries, tsi.realpath);
    }
    function exit(exitCode) {
        throw new Error("exit with code:" + exitCode);
    }
    function getExecutingFilePath() {
        return getCurrentDirectory() + "Content/JavaScript/PuertsEditor/node_modules/typescript/lib/tsc.js";
    }
    function getCurrentDirectory() {
        return UE.FileSystemOperation.GetCurrentDirectory();
    }
    function getDirectories(path) {
        var result = [];
        var dirs = UE.FileSystemOperation.GetDirectories(path);
        for (var i = 0; i < dirs.Num(); i++) {
            result.push(dirs.Get(i));
        }
        return result;
    }
    //for debug only
    /*return new Proxy({}, {
        get: function(target, name) {
            if (!(name in target)) {
                if (typeof name === 'string') {
                    if (!(name in tgamejsSystem)) {
                        return undefined;
                    }
                    let maybeFunc = tgamejsSystem[name];
                    if (typeof maybeFunc === 'function') {
                        target[name] = function(...args: any[]) {
                            const res = maybeFunc(...args);
                            console.log("method:", name, ", args:", JSON.stringify(args), ",res:", res);
                            return res;
                        }
                    } else {
                        target[name] = tgamejsSystem[name];
                    }
                }
            }

            return target[name]
        }
    }) as ts.System;*/
    return customSystem;
}
var customSystem = getCustomSystem();
if (!ts.sys) {
    var t = ts;
    t.sys = customSystem;
}
function logErrors(allDiagnostics) {
    allDiagnostics.forEach(function (diagnostic) {
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        if (diagnostic.file) {
            var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
            console.error("  Error ".concat(diagnostic.file.fileName, " (").concat(line + 1, ",").concat(character + 1, "): ").concat(message));
        }
        else {
            console.error("  Error: ".concat(message));
        }
    });
}
var FunctionFlags = {
    FUNC_None: 0x00000000,
    FUNC_Final: 0x00000001, // Function is final (prebindable, non-overridable function).
    FUNC_RequiredAPI: 0x00000002, // Indicates this function is DLL exported/imported.
    FUNC_BlueprintAuthorityOnly: 0x00000004, // Function will only run if the object has network authority
    FUNC_BlueprintCosmetic: 0x00000008, // Function is cosmetic in nature and should not be invoked on dedicated servers
    // FUNC_				: 0x00000010,   // unused.
    // FUNC_				: 0x00000020,   // unused.
    FUNC_Net: 0x00000040, // Function is network-replicated.
    FUNC_NetReliable: 0x00000080, // Function should be sent reliably on the network.
    FUNC_NetRequest: 0x00000100, // Function is sent to a net service
    FUNC_Exec: 0x00000200, // Executable from command line.
    FUNC_Native: 0x00000400, // Native function.
    FUNC_Event: 0x00000800, // Event function.
    FUNC_NetResponse: 0x00001000, // Function response from a net service
    FUNC_Static: 0x00002000, // Static function.
    FUNC_NetMulticast: 0x00004000, // Function is networked multicast Server -> All Clients
    FUNC_UbergraphFunction: 0x00008000, // Function is used as the merge 'ubergraph' for a blueprint, only assigned when using the persistent 'ubergraph' frame
    FUNC_MulticastDelegate: 0x00010000, // Function is a multi-cast delegate signature (also requires FUNC_Delegate to be set!)
    FUNC_Public: 0x00020000, // Function is accessible in all classes (if overridden, parameters must remain unchanged).
    FUNC_Private: 0x00040000, // Function is accessible only in the class it is defined in (cannot be overridden, but function name may be reused in subclasses.  IOW: if overridden, parameters don't need to match, and Super.Func() cannot be accessed since it's private.)
    FUNC_Protected: 0x00080000, // Function is accessible only in the class it is defined in and subclasses (if overridden, parameters much remain unchanged).
    FUNC_Delegate: 0x00100000, // Function is delegate signature (either single-cast or multi-cast, depending on whether FUNC_MulticastDelegate is set.)
    FUNC_NetServer: 0x00200000, // Function is executed on servers (set by replication code if passes check)
    FUNC_HasOutParms: 0x00400000, // function has out (pass by reference) parameters
    FUNC_HasDefaults: 0x00800000, // function has structs that contain defaults
    FUNC_NetClient: 0x01000000, // function is executed on clients
    FUNC_DLLImport: 0x02000000, // function is imported from a DLL
    FUNC_BlueprintCallable: 0x04000000, // function can be called from blueprint code
    FUNC_BlueprintEvent: 0x08000000, // function can be overridden/implemented from a blueprint
    FUNC_BlueprintPure: 0x10000000, // function can be called from blueprint code, and is also pure (produces no side effects). If you set this, you should set FUNC_BlueprintCallable as well.
    FUNC_EditorOnly: 0x20000000, // function can only be called from an editor scrippt.
    FUNC_Const: 0x40000000, // function can be called from blueprint code, and only reads state (never writes state)
    FUNC_NetValidate: 0x80000000, // function must supply a _Validate implementation
    FUNC_AllFlags: 0xFFFFFFFF,
};
var PropertyFlags = {
    CPF_None: 0,
    CPF_Edit: 0x0000000000000001, ///< Property is user-settable in the editor.
    CPF_ConstParm: 0x0000000000000002, ///< This is a constant function parameter
    CPF_BlueprintVisible: 0x0000000000000004, ///< This property can be read by blueprint code
    CPF_ExportObject: 0x0000000000000008, ///< Object can be exported with actor.
    CPF_BlueprintReadOnly: 0x0000000000000010, ///< This property cannot be modified by blueprint code
    CPF_Net: 0x0000000000000020, ///< Property is relevant to network replication.
    CPF_EditFixedSize: 0x0000000000000040, ///< Indicates that elements of an array can be modified, but its size cannot be changed.
    CPF_Parm: 0x0000000000000080, ///< Function/When call parameter.
    CPF_OutParm: 0x0000000000000100, ///< Value is copied out after function call.
    CPF_ZeroConstructor: 0x0000000000000200, ///< memset is fine for construction
    CPF_ReturnParm: 0x0000000000000400, ///< Return value.
    CPF_DisableEditOnTemplate: 0x0000000000000800, ///< Disable editing of this property on an archetype/sub-blueprint
    //CPF_      						: 0x0000000000001000,	///< 
    CPF_Transient: 0x0000000000002000, ///< Property is transient: shouldn't be saved or loaded, except for Blueprint CDOs.
    CPF_Config: 0x0000000000004000, ///< Property should be loaded/saved as permanent profile.
    //CPF_								: 0x0000000000008000,	///< 
    CPF_DisableEditOnInstance: 0x0000000000010000, ///< Disable editing on an instance of this class
    CPF_EditConst: 0x0000000000020000, ///< Property is uneditable in the editor.
    CPF_GlobalConfig: 0x0000000000040000, ///< Load config from base class, not subclass.
    CPF_InstancedReference: 0x0000000000080000, ///< Property is a component references.
    //CPF_								: 0x0000000000100000,	///<
    CPF_DuplicateTransient: 0x0000000000200000, ///< Property should always be reset to the default value during any type of duplication (copy/paste, binary duplication, etc.)
    CPF_SubobjectReference: 0x0000000000400000, ///< Property contains subobject references (TSubobjectPtr)
    //CPF_    							: 0x0000000000800000,	///< 
    CPF_SaveGame: 0x0000000001000000, ///< Property should be serialized for save games, this is only checked for game-specific archives with ArIsSaveGame
    CPF_NoClear: 0x0000000002000000, ///< Hide clear (and browse) button.
    //CPF_  							: 0x0000000004000000,	///<
    CPF_ReferenceParm: 0x0000000008000000, ///< Value is passed by reference; CPF_OutParam and CPF_Param should also be set.
    CPF_BlueprintAssignable: 0x0000000010000000, ///< MC Delegates only.  Property should be exposed for assigning in blueprint code
    CPF_Deprecated: 0x0000000020000000, ///< Property is deprecated.  Read it from an archive, but don't save it.
    CPF_IsPlainOldData: 0x0000000040000000, ///< If this is set, then the property can be memcopied instead of CopyCompleteValue / CopySingleValue
    CPF_RepSkip: 0x0000000080000000, ///< Not replicated. For non replicated properties in replicated structs 
    CPF_RepNotify: 0x0000000100000000, ///< Notify actors when a property is replicated
    CPF_Interp: 0x0000000200000000, ///< interpolatable property for use with matinee
    CPF_NonTransactional: 0x0000000400000000, ///< Property isn't transacted
    CPF_EditorOnly: 0x0000000800000000, ///< Property should only be loaded in the editor
    CPF_NoDestructor: 0x0000001000000000, ///< No destructor
    //CPF_								: 0x0000002000000000,	///<
    CPF_AutoWeak: 0x0000004000000000, ///< Only used for weak pointers, means the export type is autoweak
    CPF_ContainsInstancedReference: 0x0000008000000000, ///< Property contains component references.
    CPF_AssetRegistrySearchable: 0x0000010000000000, ///< asset instances will add properties with this flag to the asset registry automatically
    CPF_SimpleDisplay: 0x0000020000000000, ///< The property is visible by default in the editor details view
    CPF_AdvancedDisplay: 0x0000040000000000, ///< The property is advanced and not visible by default in the editor details view
    CPF_Protected: 0x0000080000000000, ///< property is protected from the perspective of script
    CPF_BlueprintCallable: 0x0000100000000000, ///< MC Delegates only.  Property should be exposed for calling in blueprint code
    CPF_BlueprintAuthorityOnly: 0x0000200000000000, ///< MC Delegates only.  This delegate accepts (only in blueprint) only events with BlueprintAuthorityOnly.
    CPF_TextExportTransient: 0x0000400000000000, ///< Property shouldn't be exported to text format (e.g. copy/paste)
    CPF_NonPIEDuplicateTransient: 0x0000800000000000, ///< Property should only be copied in PIE
    CPF_ExposeOnSpawn: 0x0001000000000000, ///< Property is exposed on spawn
    CPF_PersistentInstance: 0x0002000000000000, ///< A object referenced by the property is duplicated like a component. (Each actor should have an own instance.)
    CPF_UObjectWrapper: 0x0004000000000000, ///< Property was parsed as a wrapper class like TSubclassOf<T>, FScriptInterface etc., rather than a USomething*
    CPF_HasGetValueTypeHash: 0x0008000000000000, ///< This property can generate a meaningful hash value.
    CPF_NativeAccessSpecifierPublic: 0x0010000000000000, ///< Public native access specifier
    CPF_NativeAccessSpecifierProtected: 0x0020000000000000, ///< Protected native access specifier
    CPF_NativeAccessSpecifierPrivate: 0x0040000000000000, ///< Private native access specifier
    CPF_SkipSerialization: 0x0080000000000000, ///< Property shouldn't be serialized, can still be exported to text
};
var ELifetimeCondition = {
    "COND_InitialOnly": 1, // This property will only attempt to send on the initial bunch
    "COND_OwnerOnly": 2, // This property will only send to the actor's owner
    "COND_SkipOwner": 3, // This property send to every connection EXCEPT the owner
    "COND_SimulatedOnly": 4, // This property will only send to simulated actors
    "COND_AutonomousOnly": 5, // This property will only send to autonomous actors
    "COND_SimulatedOrPhysics": 6, // This property will send to simulated OR bRepPhysics actors
    "COND_InitialOrOwner": 7, // This property will send on the initial packet, or to the actors owner
    "COND_Custom": 8, // This property has no particular condition, but wants the ability to toggle on/off via SetCustomIsActiveOverride
    "COND_ReplayOrOwner": 9, // This property will only send to the replay connection, or to the actors owner
    "COND_ReplayOnly": 10, // This property will only send to the replay connection
    "COND_SimulatedOnlyNoReplay": 11, // This property will send to actors only, but not to replay connections
    "COND_SimulatedOrPhysicsNoReplay": 12, // This property will send to simulated Or bRepPhysics actors, but not to replay connections
    "COND_SkipReplay": 13, // This property will not send to the replay connection
    "COND_Never": 15, // This property will never be replicated						
};
function readAndParseConfigFile(configFilePath) {
    var readResult = ts.readConfigFile(configFilePath, customSystem.readFile);
    return ts.parseJsonConfigFileContent(readResult.config, {
        useCaseSensitiveFileNames: true,
        readDirectory: customSystem.readDirectory,
        fileExists: customSystem.fileExists,
        readFile: customSystem.readFile,
        trace: function (s) { return console.log(s); }
    }, customSystem.getCurrentDirectory());
}
function watch(configFilePath) {
    var _a = readAndParseConfigFile(configFilePath), fileNames = _a.fileNames, options = _a.options;
    console.log("start watch..", JSON.stringify({ fileNames: fileNames, options: options }));
    var versionsFilePath = tsi.getDirectoryPath(configFilePath) + "/ts_file_versions_info.json";
    var fileVersions = {};
    var beginTime = new Date().getTime();
    fileNames.forEach(function (fileName) {
        fileVersions[fileName] = { version: UE.FileSystemOperation.FileMD5Hash(fileName), processed: false, isBP: false };
    });
    console.log("calc md5 using " + (new Date().getTime() - beginTime) + "ms");
    function getDefaultLibLocation() {
        return tsi.getDirectoryPath(tsi.normalizePath(customSystem.getExecutingFilePath()));
    }
    var scriptSnapshotsCache = new Map();
    // Create the language service host to allow the LS to communicate with the host
    var servicesHost = {
        getScriptFileNames: function () { return fileNames; },
        getScriptVersion: function (fileName) {
            if (fileName in fileVersions) {
                return fileVersions[fileName] && fileVersions[fileName].version.toString();
            }
            else {
                var md5 = UE.FileSystemOperation.FileMD5Hash(fileName);
                fileVersions[fileName] = { version: md5, processed: false };
                return md5;
            }
        },
        getScriptSnapshot: function (fileName) {
            if (!customSystem.fileExists(fileName)) {
                console.error("getScriptSnapshot: file not existed! path=" + fileName);
                return undefined;
            }
            if (!(fileName in fileVersions)) {
                fileVersions[fileName] = { version: UE.FileSystemOperation.FileMD5Hash(fileName), processed: false };
            }
            if (!scriptSnapshotsCache.has(fileName)) {
                var sourceFile = customSystem.readFile(fileName);
                if (!sourceFile) {
                    console.error("getScriptSnapshot: read file failed! path=" + fileName);
                    return undefined;
                }
                scriptSnapshotsCache.set(fileName, {
                    version: fileVersions[fileName].version,
                    scriptSnapshot: ts.ScriptSnapshot.fromString(sourceFile)
                });
            }
            var scriptSnapshotsInfo = scriptSnapshotsCache.get(fileName);
            if (scriptSnapshotsInfo.version != fileVersions[fileName].version) {
                var sourceFile = customSystem.readFile(fileName);
                if (!sourceFile) {
                    console.error("getScriptSnapshot: read file failed! path=" + fileName);
                    return undefined;
                }
                scriptSnapshotsInfo.version = fileVersions[fileName].version;
                scriptSnapshotsInfo.scriptSnapshot = ts.ScriptSnapshot.fromString(sourceFile);
            }
            //console.log("getScriptSnapshot:"+ fileName + ",in:" + new Error().stack)
            return scriptSnapshotsInfo.scriptSnapshot;
        },
        getCurrentDirectory: customSystem.getCurrentDirectory,
        getCompilationSettings: function () { return options; },
        getDefaultLibFileName: function (options) { return tsi.combinePaths(getDefaultLibLocation(), ts.getDefaultLibFileName(options)); },
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory,
        directoryExists: ts.sys.directoryExists,
        getDirectories: ts.sys.getDirectories,
    };
    var service = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
    function getProgramFromService() {
        while (true) {
            try {
                return service.getProgram();
            }
            catch (e) {
                console.error(e);
            }
            //异常了从新创建Language Service，有可能不断失败,UE的文件读取偶尔会失败，失败后ts增量编译会不断的在tryReuseStructureFromOldProgram那断言失败
            service = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
        }
    }
    var pendingBlueprintRefleshJobs = [];
    function isChildOf(a, b) {
        var baseTypes = a.getBaseTypes();
        if (baseTypes.indexOf(b) >= 0) {
            return true;
        }
        for (var i = 0; i < baseTypes.length; ++i) {
            if (isChildOf(baseTypes[i], b)) {
                return true;
            }
        }
        return false;
    }
    function topologicalSort(classes) {
        var visited = new Set();
        var result = [];
        function visit(node) {
            if (!visited.has(node)) {
                visited.add(node);
                for (var _i = 0, classes_2 = classes; _i < classes_2.length; _i++) {
                    var other = classes_2[_i];
                    if (isChildOf(node.type, other.type)) {
                        visit(other);
                    }
                }
                result.push(node);
            }
        }
        for (var _i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
            var cls = classes_1[_i];
            visit(cls);
        }
        return result;
    }
    function refreshBlueprints() {
        if (pendingBlueprintRefleshJobs.length > 0) {
            pendingBlueprintRefleshJobs = topologicalSort(pendingBlueprintRefleshJobs);
            pendingBlueprintRefleshJobs.forEach(function (job) {
                job.op();
            });
            pendingBlueprintRefleshJobs = [];
        }
    }
    beginTime = new Date().getTime();
    var program = getProgramFromService();
    console.log("full compile using " + (new Date().getTime() - beginTime) + "ms");
    var diagnostics = ts.getPreEmitDiagnostics(program);
    var restoredFileVersions = {};
    var changed = false;
    var versionsFileExisted = customSystem.fileExists(versionsFilePath);
    if (versionsFileExisted) {
        try {
            restoredFileVersions = JSON.parse(customSystem.readFile(versionsFilePath));
            console.log("restore versions from ", versionsFilePath);
        }
        catch (_b) { }
    }
    if (diagnostics.length > 0) {
        fileNames.forEach(function (fileName) {
            fileVersions[fileName] = restoredFileVersions[fileName] || fileVersions[fileName];
        });
        logErrors(diagnostics);
    }
    else {
        function getClassPathInfo(sourceFilePath) {
            var modulePath = undefined;
            var moduleFileName = undefined;
            if (sourceFilePath.endsWith(".ts")) {
                if (options.baseUrl && sourceFilePath.startsWith(options.baseUrl)) {
                    moduleFileName = sourceFilePath.substr(options.baseUrl.length + 1);
                    modulePath = tsi.getDirectoryPath(moduleFileName);
                    moduleFileName = tsi.removeExtension(moduleFileName, ".ts");
                }
            }
            return { moduleFileName: moduleFileName, modulePath: modulePath };
        }
        fileNames.forEach(function (fileName) {
            if (!(fileName in restoredFileVersions) || restoredFileVersions[fileName].version != fileVersions[fileName].version || !restoredFileVersions[fileName].processed) {
                onSourceFileAddOrChange(fileName, false, program, true, false);
                changed = true;
            }
            else {
                fileVersions[fileName].processed = true;
            }
            if (fileName in restoredFileVersions) {
                fileVersions[fileName].isBP = restoredFileVersions[fileName].isBP;
            }
        });
        fileNames.forEach(function (fileName) {
            if (versionsFileExisted && (!(fileName in restoredFileVersions)))
                return;
            if (versionsFileExisted && (!restoredFileVersions[fileName].isBP))
                return;
            var _a = getClassPathInfo(fileName), moduleFileName = _a.moduleFileName, modulePath = _a.modulePath;
            var BPExisted = false;
            if (moduleFileName) {
                BPExisted = UE.PEBlueprintAsset.Existed(moduleFileName, modulePath);
            }
            if (!versionsFileExisted || restoredFileVersions[fileName].version != fileVersions[fileName].version || !restoredFileVersions[fileName].processed || !BPExisted) {
                onSourceFileAddOrChange(fileName, false, program, false);
                changed = true;
            }
            else {
                fileVersions[fileName].processed = true;
            }
        });
        refreshBlueprints();
        if (changed) {
            UE.FileSystemOperation.WriteFile(versionsFilePath, JSON.stringify(fileVersions, null, 4));
        }
    }
    var dirWatcher = new UE.PEDirectoryWatcher();
    global.__dirWatcher = dirWatcher; //防止被释放?
    dirWatcher.OnChanged.Add(function (added, modified, removed) {
        setTimeout(function () {
            var changed = false;
            var modifiedFiles = [];
            for (var i = 0; i < modified.Num(); i++) {
                modifiedFiles.push(modified.Get(i));
            }
            var removedSet = new Set();
            for (var i = 0; i < removed.Num(); i++) {
                removedSet.add(removed.Get(i));
            }
            var addFiles = [];
            for (var i = 0; i < added.Num(); i++) {
                var fileName = added.Get(i);
                //remove and add is the same as modified
                if (removedSet.has(fileName)) {
                    modifiedFiles.push(fileName);
                }
                else {
                    addFiles.push(fileName);
                }
            }
            if (addFiles.length > 0) {
                onFileAdded();
                changed = true;
            }
            modifiedFiles.forEach(function (fileName) {
                if (fileName in fileVersions) {
                    var md5 = UE.FileSystemOperation.FileMD5Hash(fileName);
                    if (md5 === fileVersions[fileName].version) {
                        console.log(fileName + " md5 not changed, so skiped!");
                    }
                    else {
                        console.log("".concat(fileName, " md5 from ").concat(fileVersions[fileName].version, " to ").concat(md5));
                        fileVersions[fileName].version = md5;
                        onSourceFileAddOrChange(fileName, true);
                        changed = true;
                    }
                }
            });
            refreshBlueprints();
            if (changed) {
                console.log("versions saved to " + versionsFilePath);
                UE.FileSystemOperation.WriteFile(versionsFilePath, JSON.stringify(fileVersions, null, 4));
            }
        }, 100); //延时100毫秒，防止因为读冲突而文件读取失败
    });
    dirWatcher.Watch(customSystem.getCurrentDirectory());
    function onFileAdded() {
        var cmdLine = readAndParseConfigFile(configFilePath);
        var newFiles = [];
        cmdLine.fileNames.forEach(function (fileName) {
            if (!(fileName in fileVersions)) {
                console.log("new file: ".concat(fileName, " ..."));
                newFiles.push(fileName);
                fileVersions[fileName] = { version: UE.FileSystemOperation.FileMD5Hash(fileName), processed: false };
            }
        });
        if (newFiles.length > 0) {
            fileNames = cmdLine.fileNames;
            options = cmdLine.options;
            program = getProgramFromService();
            newFiles.forEach(function (fileName) { return onSourceFileAddOrChange(fileName, true, program); });
        }
    }
    function onSourceFileAddOrChange(sourceFilePath, reload, program, doEmitJs, doEmitBP) {
        if (doEmitJs === void 0) { doEmitJs = true; }
        if (doEmitBP === void 0) { doEmitBP = true; }
        if (!program) {
            var beginTime_1 = new Date().getTime();
            program = getProgramFromService();
            console.log("incremental compile " + sourceFilePath + " using " + (new Date().getTime() - beginTime_1) + "ms");
        }
        var sourceFile = program.getSourceFile(sourceFilePath);
        if (sourceFile) {
            var diagnostics_1 = __spreadArray(__spreadArray([], program.getSyntacticDiagnostics(sourceFile), true), program.getSemanticDiagnostics(sourceFile), true);
            var checker_1 = program.getTypeChecker();
            if (diagnostics_1.length > 0) {
                logErrors(diagnostics_1);
            }
            else {
                if (doEmitBP) {
                    fileVersions[sourceFilePath].isBP = false;
                }
                fileVersions[sourceFilePath].processed = true;
                if (!sourceFile.isDeclarationFile) {
                    var emitOutput = service.getEmitOutput(sourceFilePath);
                    if (!emitOutput.emitSkipped) {
                        var modulePath_1 = undefined;
                        var moduleFileName_1 = undefined;
                        var jsSource_1 = undefined;
                        emitOutput.outputFiles.forEach(function (output) {
                            if (doEmitJs) {
                                console.log("write ".concat(output.name, " ..."));
                                UE.FileSystemOperation.WriteFile(output.name, output.text);
                            }
                            if (output.name.endsWith(".js") || output.name.endsWith(".mjs")) {
                                jsSource_1 = output.text;
                                if (options.outDir && output.name.startsWith(options.outDir)) {
                                    moduleFileName_1 = output.name.substr(options.outDir.length + 1);
                                    modulePath_1 = tsi.getDirectoryPath(moduleFileName_1);
                                    moduleFileName_1 = tsi.removeExtension(moduleFileName_1, output.name.endsWith(".js") ? ".js" : ".mjs");
                                }
                            }
                        });
                        if (moduleFileName_1 && reload) {
                            UE.FileSystemOperation.PuertsNotifyChange(moduleFileName_1, jsSource_1);
                        }
                        if (!doEmitBP)
                            return;
                        var foundType_1 = undefined;
                        var foundBaseTypeUClass_1 = undefined;
                        ts.forEachChild(sourceFile, function (node) {
                            if (ts.isExportAssignment(node) && ts.isIdentifier(node.expression)) {
                                var type = checker_1.getTypeAtLocation(node.expression);
                                if (!type || !type.getSymbol())
                                    return;
                                if (type.getSymbol().getName() != tsi.getBaseFileName(moduleFileName_1)) {
                                    //console.error("type name must the same as file name!");
                                    return;
                                }
                                var baseTypes = type.getBaseTypes();
                                if (!baseTypes || baseTypes.length != 1)
                                    return;
                                var structOfType = getUClassOfType(baseTypes[0]);
                                var baseTypeUClass = undefined;
                                if (!structOfType) {
                                    return;
                                }
                                if (structOfType.GetClass().IsChildOf(UE.Class.StaticClass())) {
                                    baseTypeUClass = structOfType;
                                }
                                else {
                                    console.warn("do not support UStruct:" + checker_1.typeToString(type));
                                    return;
                                }
                                if (baseTypeUClass) {
                                    if (isSubclassOf(type, "Subsystem")) {
                                        console.error("do not support Subsystem " + checker_1.typeToString(type));
                                        return;
                                    }
                                    if (!baseTypeUClass.IsNative()) {
                                        var moduleNames = getModuleNames(baseTypes[0]);
                                        if (moduleNames.length > 1 && moduleNames[0] == 'ue') {
                                            console.error("".concat(checker_1.typeToString(type), " extends a blueprint"));
                                            return;
                                        }
                                    }
                                    foundType_1 = type;
                                    foundBaseTypeUClass_1 = baseTypeUClass;
                                }
                                else {
                                    console.warn("can not find base for " + checker_1.typeToString(type));
                                }
                            }
                        });
                        if (foundType_1 && foundBaseTypeUClass_1) {
                            fileVersions[sourceFilePath].isBP = true;
                            //onBlueprintTypeAddOrChange(foundBaseTypeUClass, foundType, modulePath);
                            pendingBlueprintRefleshJobs.push({ type: foundType_1, op: function () { return onBlueprintTypeAddOrChange(foundBaseTypeUClass_1, foundType_1, modulePath_1); } });
                        }
                    }
                }
            }
            function typeNameToString(node) {
                if (ts.isIdentifier(node)) {
                    return node.text;
                }
                else {
                    return node.right.text;
                }
            }
            function isSubclassOf(type, baseTypeName) {
                var baseTypes = type.getBaseTypes();
                if (baseTypes.length != 1)
                    return false;
                if (baseTypes[0].getSymbol().getName() == baseTypeName) {
                    return true;
                }
                return isSubclassOf(baseTypes[0], baseTypeName);
            }
            function getUClassOfType(type) {
                if (!type)
                    return undefined;
                var moduleNames = getModuleNames(type);
                if (moduleNames.length > 0 && moduleNames[0] == 'ue') {
                    if (moduleNames.length == 1) {
                        try {
                            var jsCls = UE[type.symbol.getName()];
                            if (typeof jsCls.StaticClass == 'function') {
                                return jsCls.StaticClass();
                            }
                        }
                        catch (e) {
                            console.error("load ue type [".concat(type.symbol.getName(), "], throw: ").concat(e));
                        }
                    }
                    else if (moduleNames.length == 2) {
                        var classPath = '/' + moduleNames[1] + '.' + type.symbol.getName();
                        return UE.Field.Load(classPath, true);
                    }
                }
                else if (type.symbol && type.symbol.valueDeclaration) {
                    //eturn undefined;
                    var baseTypes = type.getBaseTypes();
                    if (!baseTypes || baseTypes.length != 1)
                        return undefined;
                    var baseTypeUClass = getUClassOfType(baseTypes[0]);
                    if (!baseTypeUClass)
                        return undefined;
                    //console.error("modulePath:", getModulePath(type.symbol.valueDeclaration.getSourceFile().fileName));
                    var sourceFile_1 = type.symbol.valueDeclaration.getSourceFile();
                    var sourceFileName_1;
                    program.emit(sourceFile_1, writeFile, undefined, false, undefined);
                    function writeFile(fileName, text, writeByteOrderMark) {
                        if (fileName.endsWith('.js')) {
                            sourceFileName_1 = tsi.removeExtension(fileName, '.js');
                        }
                    }
                    if (tsi.getBaseFileName(sourceFileName_1) != type.symbol.getName()) {
                        console.error("type name must the same as file name!");
                        return undefined;
                    }
                    if (options.outDir && sourceFileName_1.startsWith(options.outDir)) {
                        var moduleFileName = sourceFileName_1.substr(options.outDir.length + 1);
                        var modulePath = tsi.getDirectoryPath(moduleFileName);
                        var bp = new UE.PEBlueprintAsset();
                        bp.LoadOrCreate(type.getSymbol().getName(), modulePath, baseTypeUClass, 0, 0);
                        bp.Save();
                        return bp.GeneratedClass;
                    }
                }
            }
            function getSymbolTypeNode(symbol) {
                if (symbol.valueDeclaration) {
                    for (var i = symbol.valueDeclaration.getChildCount() - 1; i >= 0; i--) {
                        var child = symbol.valueDeclaration.getChildAt(i);
                        if (child.kind == ts.SyntaxKind.TypeReference) {
                            return child;
                        }
                    }
                }
            }
            function tsTypeToPinType(type, node) {
                if (!type)
                    return undefined;
                try {
                    var typeNode = checker_1.typeToTypeNode(type, undefined, undefined);
                    //console.log(checker.typeToString(type), tds)
                    if (ts.isTypeReferenceNode(typeNode) && type.symbol) {
                        var typeName = type.symbol.getName();
                        if (typeName == 'BigInt') {
                            var category = "int64";
                            var pinType = new UE.PEGraphPinType(category, undefined, UE.EPinContainerType.None, false, false);
                            return { pinType: pinType };
                        }
                        if (!typeNode.typeArguments || typeNode.typeArguments.length == 0) {
                            var category = "object";
                            var uclass = getUClassOfType(type);
                            if (!uclass) {
                                var uenum = UE.Enum.Find(type.symbol.getName());
                                if (uenum) {
                                    return { pinType: new UE.PEGraphPinType("byte", uenum, UE.EPinContainerType.None, false, false) };
                                }
                                console.warn("can not find type of " + typeName);
                                return undefined;
                            }
                            var pinType = new UE.PEGraphPinType(category, uclass, UE.EPinContainerType.None, false, false);
                            return { pinType: pinType };
                        }
                        else { //TArray, TSet, TMap
                            var typeRef = type;
                            var children = [];
                            var typeArguments = typeRef.typeArguments || typeRef.aliasTypeArguments;
                            if (typeRef.aliasTypeArguments && typeRef.aliasSymbol) {
                                typeName = typeRef.aliasSymbol.getName();
                            }
                            if (!typeArguments) {
                                console.warn("can not find type arguments of " + node.getFullText());
                                return undefined;
                            }
                            if (node) {
                                node.forEachChild(function (child) {
                                    children.push(child);
                                });
                            }
                            var result = tsTypeToPinType(typeArguments[0], children[1]);
                            if (!result || result.pinType.PinContainerType != UE.EPinContainerType.None && typeName != '$Ref' && typeName != '$InRef') {
                                console.warn("can not find pin type of typeArguments[0] " + typeName);
                                return undefined;
                            }
                            if (children[1]) {
                                postProcessPinType(children[1], result.pinType, false);
                            }
                            if (typeName == 'TArray' || typeName == 'TSet') {
                                result.pinType.PinContainerType = typeName == 'TArray' ? UE.EPinContainerType.Array : UE.EPinContainerType.Set;
                                return result;
                            }
                            else if (typeName == 'TSubclassOf') {
                                var category = "class";
                                result.pinType.PinCategory = category;
                                return result;
                            }
                            else if (typeName == 'TSoftObjectPtr') {
                                var category = "softobject";
                                result.pinType.PinCategory = category;
                                return result;
                            }
                            else if (typeName == 'TSoftClassPtr') {
                                var category = "softclass";
                                result.pinType.PinCategory = category;
                                return result;
                            }
                            else if (typeName == '$Ref') {
                                result.pinType.bIsReference = true;
                                return result;
                            }
                            else if (typeName == '$InRef') {
                                result.pinType.bIsReference = true;
                                result.pinType.bIn = true;
                                return result;
                            }
                            else if (typeName == 'TMap') {
                                var valuePinType = tsTypeToPinType(typeArguments[1], undefined);
                                if (!valuePinType || valuePinType.pinType.PinContainerType != UE.EPinContainerType.None) {
                                    console.warn("can not find pin type of typeArguments[1] " + typeName);
                                    return undefined;
                                }
                                if (children[2]) {
                                    postProcessPinType(children[2], valuePinType.pinType, false);
                                }
                                result.pinType.PinContainerType = UE.EPinContainerType.Map;
                                result.pinValueType = new UE.PEGraphTerminalType(valuePinType.pinType.PinCategory, valuePinType.pinType.PinSubCategoryObject);
                                return result;
                            }
                            else {
                                console.warn("not support generic type: " + typeName);
                                return undefined;
                            }
                        }
                    }
                    else {
                        //"bool" | "class" | "int64" | "string" | "object" | "struct" | "float";
                        var category = void 0;
                        switch (typeNode.kind) {
                            case ts.SyntaxKind.NumberKeyword:
                                category = "float";
                                break;
                            case ts.SyntaxKind.StringKeyword:
                                category = 'string';
                                break;
                            case ts.SyntaxKind.BigIntKeyword:
                                category = 'int64';
                                break;
                            case ts.SyntaxKind.BooleanKeyword:
                                category = 'bool';
                                break;
                            default:
                                console.warn("not support kind: " + typeNode.kind);
                                return undefined;
                        }
                        var pinType = new UE.PEGraphPinType(category, undefined, UE.EPinContainerType.None, false, false);
                        return { pinType: pinType };
                    }
                }
                catch (e) {
                    console.error(e.stack || e);
                    return undefined;
                }
            }
            function manualSkip(valueDeclaration) {
                var commentRanges = ts.getLeadingCommentRanges(sourceFile.getFullText(), valueDeclaration.getFullStart());
                return !!(commentRanges && commentRanges.find(function (r) { return sourceFile.getFullText().slice(r.pos, r.end).indexOf("@no-blueprint") > 0; })) || hasDecorator(valueDeclaration, "no_blueprint");
            }
            function tryGetAnnotation(valueDeclaration, key, leading) {
                var commentRanges = (leading ? ts.getLeadingCommentRanges : ts.getTrailingCommentRanges)(sourceFile.getFullText(), valueDeclaration.getFullStart() + (leading ? 0 : valueDeclaration.getFullWidth()));
                if (commentRanges) {
                    var ret_1;
                    commentRanges.forEach(function (r) {
                        var m = sourceFile.getFullText().slice(r.pos, r.end).match(new RegExp("@".concat(key, ":([^*]*)")));
                        if (m) {
                            ret_1 = m[1].trim();
                        }
                    });
                    return ret_1;
                }
            }
            function postProcessPinType(valueDeclaration, pinType, leading) {
                if (pinType.PinContainerType == UE.EPinContainerType.None) {
                    var pc = pinType.PinCategory;
                    if (pc === "float") {
                        var cppType = tryGetAnnotation(valueDeclaration, "cpp", leading);
                        if (cppType === "int" || cppType === "byte") {
                            pinType.PinCategory = cppType;
                        }
                    }
                    else if (pc === "string") {
                        var cppType = tryGetAnnotation(valueDeclaration, "cpp", leading);
                        if (cppType === "name" || cppType === "text") {
                            pinType.PinCategory = cppType;
                        }
                    }
                }
            }
            function getFlagsValue(str, flagsDef) {
                if (!str)
                    return 0;
                return str.split("|").map(function (x) { return x.trim(); }).map(function (x) { return x in flagsDef ? flagsDef[x] : 0; }).reduce(function (x, y) { return x | y; });
            }
            function getDecoratorFlagsValue(valueDeclaration, posfix, flagsDef) {
                if (valueDeclaration && valueDeclaration.decorators) {
                    var decorators = valueDeclaration.decorators;
                    var ret_2 = 0n;
                    decorators.forEach(function (decorator, index) {
                        var expression = decorator.expression;
                        if (ts.isCallExpression(expression)) {
                            if (expression.expression.getFullText() == posfix || expression.expression.getFullText().endsWith('.' + posfix)) {
                                expression.arguments.forEach(function (value, index) {
                                    var e = value.getFullText().split("|").map(function (x) { return x.trim().replace(/^.*[\.]/, ''); })
                                        .map(function (x) { return x in flagsDef ? BigInt(flagsDef[x]) : 0n; })
                                        .reduce(function (x, y) { return BigInt(x) | BigInt(y); });
                                    ret_2 = ret_2 | e;
                                });
                            }
                        }
                    });
                    return ret_2;
                }
                else {
                    return 0n;
                }
            }
            function hasDecorator(valueDeclaration, posfix) {
                var ret = false;
                if (valueDeclaration && valueDeclaration.decorators) {
                    var decorators = valueDeclaration.decorators;
                    decorators.forEach(function (decorator, index) {
                        var expression = decorator.expression;
                        if (ts.isCallExpression(expression)) {
                            if (expression.expression.getFullText() == posfix || expression.expression.getFullText().endsWith('.' + posfix)) {
                                ret = true;
                            }
                        }
                    });
                }
                return ret;
            }
            function onBlueprintTypeAddOrChange(baseTypeUClass, type, modulePath) {
                console.log("gen blueprint for ".concat(type.getSymbol().getName(), ", path: ").concat(modulePath));
                var lsFunctionLibrary = baseTypeUClass && baseTypeUClass.GetName() === "BlueprintFunctionLibrary";
                var bp = new UE.PEBlueprintAsset();
                bp.LoadOrCreateWithMetaData(type.getSymbol().getName(), modulePath, baseTypeUClass, 0, 0, uemeta.compileClassMetaData(type));
                var hasConstructor = false;
                var properties = [];
                type.symbol.valueDeclaration.forEachChild(function (x) {
                    if (ts.isMethodDeclaration(x) && !manualSkip(x)) {
                        var isStatic = !!(ts.getCombinedModifierFlags(x) & ts.ModifierFlags.Static);
                        if (isStatic && !lsFunctionLibrary) {
                            console.warn("do not support static function [".concat(x.name.getText(), "]"));
                            return;
                        }
                        if (!isStatic && lsFunctionLibrary) {
                            console.warn("do not support non-static function [".concat(x.name.getText(), "] in BlueprintFunctionLibrary"));
                            return;
                        }
                        if (x.name.getText() === 'ReceiveInit') {
                            if (baseTypeUClass == UE.GameInstance.StaticClass() || baseTypeUClass.IsChildOf(UE.GameInstance.StaticClass())) {
                                console.warn("do not support override GameInstance.ReceiveInit in ".concat(type.getSymbol().getName()));
                                return;
                            }
                        }
                        properties.push(checker_1.getSymbolAtLocation(x.name));
                    }
                    else if (ts.isPropertyDeclaration(x) && !manualSkip(x)) {
                        var isStatic = !!(ts.getCombinedModifierFlags(x) & ts.ModifierFlags.Static);
                        if (isStatic) {
                            console.warn("static property:" + x.name.getText() + ' not support');
                            return;
                        }
                        properties.push(checker_1.getSymbolAtLocation(x.name));
                    }
                });
                var attachments = UE.NewMap(UE.BuiltinName, UE.BuiltinName);
                properties
                    .filter(function (x) { return ts.isClassDeclaration(x.valueDeclaration.parent) && checker_1.getSymbolAtLocation(x.valueDeclaration.parent.name) == type.symbol; })
                    .forEach(function (symbol) {
                    if (ts.isMethodDeclaration(symbol.valueDeclaration)) {
                        if (symbol.getName() === 'Constructor') {
                            hasConstructor = true;
                            return;
                        }
                        var methodType = checker_1.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
                        var signatures = checker_1.getSignaturesOfType(methodType, ts.SignatureKind.Call);
                        if (!signatures) {
                            console.warn("can not find signature for ".concat(symbol.getName(), " "));
                            return;
                        }
                        if (signatures.length != 1) {
                            console.warn("find more than one signature for ".concat(symbol.getName(), " "));
                            return;
                        }
                        var signature = signatures[0];
                        for (var i = 0; i < signature.parameters.length; i++) {
                            var paramType = checker_1.getTypeOfSymbolAtLocation(signature.parameters[i], signature.parameters[i].valueDeclaration);
                            var paramPinType = tsTypeToPinType(paramType, getSymbolTypeNode(signature.parameters[i]));
                            if (!paramPinType) {
                                console.warn(symbol.getName() + " of " + checker_1.typeToString(type) + " has not supported parameter!");
                                bp.ClearParameter();
                                return;
                            }
                            postProcessPinType(signature.parameters[i].valueDeclaration, paramPinType.pinType, false);
                            // bp.AddParameter(signature.parameters[i].getName(), paramPinType.pinType, paramPinType.pinValueType);
                            bp.AddParameterWithMetaData(signature.parameters[i].getName(), paramPinType.pinType, paramPinType.pinValueType, uemeta.compileParamMetaData(signature.parameters[i]));
                        }
                        //console.log("add function", symbol.getName());
                        var sflags = tryGetAnnotation(symbol.valueDeclaration, "flags", true);
                        var flags = getFlagsValue(sflags, FunctionFlags);
                        var clearFlags = 0;
                        if (symbol.valueDeclaration && symbol.valueDeclaration.decorators) {
                            flags |= Number(getDecoratorFlagsValue(symbol.valueDeclaration, "flags", FunctionFlags));
                            flags |= Number(getDecoratorFlagsValue(symbol.valueDeclaration, "set_flags", FunctionFlags));
                            clearFlags = Number(getDecoratorFlagsValue(symbol.valueDeclaration, "clear_flags", FunctionFlags));
                        }
                        if (symbol.valueDeclaration.type && (ts.SyntaxKind.VoidKeyword === symbol.valueDeclaration.type.kind)) {
                            // bp.AddFunction(symbol.getName(), true, undefined, undefined, flags, clearFlags);
                            bp.AddFunctionWithMetaData(symbol.getName(), true, undefined, undefined, flags, clearFlags, uemeta.compileFunctionMetaData(symbol));
                        }
                        else {
                            var returnType = signature.getReturnType();
                            var resultPinType = tsTypeToPinType(returnType, getSymbolTypeNode(symbol));
                            if (!resultPinType) {
                                console.warn(symbol.getName() + " of " + checker_1.typeToString(type) + " has not supported return type!");
                                bp.ClearParameter();
                                return;
                            }
                            postProcessPinType(symbol.valueDeclaration, resultPinType.pinType, true);
                            // bp.AddFunction(symbol.getName(), false, resultPinType.pinType, resultPinType.pinValueType, flags, clearFlags);
                            bp.AddFunctionWithMetaData(symbol.getName(), false, resultPinType.pinType, resultPinType.pinValueType, flags, clearFlags, uemeta.compileFunctionMetaData(symbol));
                        }
                        bp.ClearParameter();
                    }
                    else {
                        var propType = checker_1.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
                        var propPinType = tsTypeToPinType(propType, getSymbolTypeNode(symbol));
                        if (!propPinType) {
                            console.warn(symbol.getName() + " of " + checker_1.typeToString(type) + " not support!");
                        }
                        else {
                            postProcessPinType(symbol.valueDeclaration, propPinType.pinType, true);
                            //console.log("add member variable", symbol.getName());
                            var sflags = tryGetAnnotation(symbol.valueDeclaration, "flags", true);
                            var flags = BigInt(getFlagsValue(sflags, PropertyFlags));
                            var cond = 0;
                            if (symbol.valueDeclaration && symbol.valueDeclaration.decorators) {
                                cond = Number(getDecoratorFlagsValue(symbol.valueDeclaration, "condition", ELifetimeCondition));
                                if (cond != 0) {
                                    flags = flags | BigInt(PropertyFlags.CPF_Net);
                                }
                                flags = flags | getDecoratorFlagsValue(symbol.valueDeclaration, "flags", PropertyFlags);
                                symbol.valueDeclaration.decorators.forEach(function (decorator) {
                                    var expression = decorator.expression;
                                    if (ts.isCallExpression(expression)) {
                                        if (expression.expression.getFullText().endsWith("uproperty.attach")) {
                                            expression.arguments.forEach(function (value) {
                                                attachments.Add(symbol.getName(), value.getFullText().slice(1, -1));
                                            });
                                        }
                                    }
                                });
                            }
                            if (!hasDecorator(symbol.valueDeclaration, "edit_on_instance")) {
                                flags = flags | BigInt(PropertyFlags.CPF_DisableEditOnInstance);
                            }
                            // bp.AddMemberVariable(symbol.getName(), propPinType.pinType, propPinType.pinValueType, Number(flags & 0xffffffffn), Number(flags >> 32n), cond);
                            bp.AddMemberVariableWithMetaData(symbol.getName(), propPinType.pinType, propPinType.pinValueType, Number(flags & 0xffffffffn), Number(flags >> 32n), cond, uemeta.compilePropertyMetaData(symbol));
                        }
                    }
                });
                bp.RemoveNotExistedComponent();
                bp.RemoveNotExistedMemberVariable();
                bp.RemoveNotExistedFunction();
                bp.SetupAttachments(attachments);
                bp.HasConstructor = hasConstructor;
                bp.Save();
            }
            function getModuleNames(type) {
                var ret = [];
                if (type.symbol && type.symbol.valueDeclaration && type.symbol.valueDeclaration.parent && ts.isModuleBlock(type.symbol.valueDeclaration.parent)) {
                    var moduleBody = type.symbol.valueDeclaration.parent;
                    while (moduleBody) {
                        var moduleDeclaration = moduleBody.parent;
                        var nameOfModule = undefined;
                        while (moduleDeclaration) {
                            var ns = moduleDeclaration.name.text;
                            ns = ns.startsWith("$") ? ns.substring(1) : ns;
                            nameOfModule = nameOfModule ? (ns + '/' + nameOfModule) : ns;
                            if (ts.isModuleDeclaration(moduleDeclaration.parent)) {
                                moduleDeclaration = moduleDeclaration.parent;
                            }
                            else {
                                break;
                            }
                        }
                        ret.push(nameOfModule);
                        if (moduleDeclaration && ts.isModuleBlock(moduleDeclaration.parent)) {
                            moduleBody = moduleDeclaration.parent;
                        }
                        else {
                            break;
                        }
                    }
                }
                return ret.reverse();
            }
        }
    }
    //function getOwnEmitOutputFilePath(fileName: string) {
    function getModulePath(fileName) {
        var compilerOptions = options;
        var emitOutputFilePathWithoutExtension;
        if (compilerOptions.outDir) {
            emitOutputFilePathWithoutExtension = tsi.removeFileExtension(tsi.getSourceFilePathInNewDir(fileName, customSystem.getCurrentDirectory(), program.getCommonSourceDirectory(), options.outDir));
        }
        else {
            emitOutputFilePathWithoutExtension = tsi.removeFileExtension(fileName);
        }
        return emitOutputFilePathWithoutExtension;
    }
    function list(pattern) {
        var re = new RegExp(pattern ? pattern : '.*');
        console.log("id\t\t\t\t\t\t\t\t\tprocessed\tisBP\tpath");
        for (var key in fileVersions) {
            var value = fileVersions[key];
            if (!pattern || re.test(key)) {
                console.log("".concat(value.version, "\t").concat(!!value.processed, "\t\t").concat(!!value.isBP, "\t").concat(key));
            }
        }
    }
    function compile(id) {
        for (var key in fileVersions) {
            var value = fileVersions[key];
            if (value.version === id.trim()) {
                console.log("compiling ".concat(key, " ..."));
                onSourceFileAddOrChange(key, true);
            }
        }
        refreshBlueprints();
    }
    function dispatchCmd(cmd, args) {
        if (cmd == 'ls') {
            list(args);
        }
        else if (cmd == 'compile') {
            compile(args);
        }
        else {
            console.error("unknow command for Puerts ".concat(cmd));
        }
    }
    cpp.FPuertsEditorModule.SetCmdCallback(dispatchCmd);
}
watch(customSystem.getCurrentDirectory() + "tsconfig.json");
