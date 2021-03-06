/**
 * Created by ahmetcan.guven on 14.06.2017.
 */

describe("TY", function() {
    it("Expect ty to be globally available", function() {
        expect(ty).toBeDefined();
    });

    it("TY debug mode should be true", function() {
        expect(ty.isTestEnv()).toEqual(true);
    });

    it("Ty Modules should be exposed to test global environment", function() {
        ty.module('moduleNameDeneme', function(){});
        expect(typeof window[ty.Constants.testClassExposePrefix+'moduleNameDeneme']).toBe('function');
        ty.tyCacheService.clearAll();
    });

    it("Ty should register to cache module", function() {
        ty.module('moduleName', function(){});
        expect(ty.tyCacheService.exists('moduleName')).toEqual(true);
        ty.tyCacheService.clearAll();
    });

    it("It should return new TyInstance", function() {
        var newTyIstance = ty.new();
        expect(typeof newTyIstance).toEqual('object');
    });
});

describe("TyInstance", function () {
    it("It should load modules by constructor parameter", function () {
        /*ty.tyCacheService.cache('constructorModule', function(){});
        var newTyIstance = ty.new(['constructorModule']);
        expect(typeof newTyIstance.constructorModule).toBe('object');
        ty.tyCacheService.clearAll();*/
        //todo find a way to test async method
    });

    it("It should load modules from cache service", function () {
       var newTyIstance = ty.new();
       ty.tyCacheService.cache('testModule', function(){});
       var remainingModules = newTyIstance.constructModuleListFromCache(['testModule']);
       expect(remainingModules).toEqual([]);
    });

    it("It should load construct class on instance", function () {
        var newTyIstance = ty.new();
        newTyIstance.constructModule('exampleModule',function(){});
        expect(typeof newTyIstance.exampleModule).toBe('object');
    });
    //todo bu kısım valid bir unit test olmayabilir. Async kurgulamak lazım.
    it("It should register onload event", function () {
        var newTyIstance = ty.new();
        newTyIstance.onLoad(function(){
            expect(true).toEqual(true);
        });
        newTyIstance.fireEvent('anyModule', ty.Constants.moduleEvents.success);
    });

    it("It should register onTimeoutEvent event", function () {
        var newTyIstance = ty.new();
        newTyIstance.onTimeout(function(){
            expect(true).toEqual(true);
        });
        newTyIstance.fireEvent('anyModule', ty.Constants.moduleEvents.timeout);
    });


    it("It should register onError event", function () {
        var newTyIstance = ty.new();
        newTyIstance.onError(function(){
            expect(true).toEqual(true);
        });
        newTyIstance.fireEvent('anyModule', ty.Constants.moduleEvents.error);
    });

    it("It should fire events", function () {
        var newTyIstance = ty.new();
        //todo jasmine inspector track for fireEvent
    });

    it("It should fire loadedAll event", function () {
        var newTyIstance = ty.new();
        newTyIstance.onLoadAll(function(){
            expect(true).toEqual(true);
        });
        newTyIstance.load(['array', 'browser']);
    });
});

describe("TyModuleWaiterQueue", function(){
    var newWaiterObject = new (function () {
        this.fireEvent = function(moduleName){
            if(moduleName == 'simpleModule'){
                expect(true).toEqual(true);
            }
        };
        this.constructModule = function(){};
    })();

    it("It should register module and instance as waiter", function () {
        ty.tyHttpService.moduleWaiterList.waiterList = [];
        ty.tyHttpService.moduleWaiterList.register('simpleModule', newWaiterObject);
        expect(ty.tyHttpService.moduleWaiterList.waiterList.length > 0).toEqual(true);
    });

    it("It should fire event of registered object", function () {
        ty.tyHttpService.moduleWaiterList.waiterList = [];
        ty.tyHttpService.moduleWaiterList.register('simpleModule2', newWaiterObject);
        ty.tyHttpService.moduleWaiterList.notifyEvent('simpleModule2', ty.Constants.moduleEvents.success);
    });

    it("It should clear waiterList", function () {
        ty.tyHttpService.moduleWaiterList.register('simpleModule2',newWaiterObject);
        ty.tyHttpService.moduleWaiterList.register('simpleModule2',newWaiterObject);
        ty.tyHttpService.moduleWaiterList.register('simpleModule2',newWaiterObject);
        ty.tyHttpService.moduleWaiterList.notifyEvent('simpleModule2', ty.Constants.moduleEvents.success);
        ty.tyHttpService.moduleWaiterList.notifyEvent('simpleModule2', ty.Constants.moduleEvents.success);
        expect(ty.tyHttpService.moduleWaiterList.waiterList.length == 0).toEqual(true);
    });
});

describe("TyScriptCache", function() {
    it("It should cache module", function() {
        ty.tyCacheService.cache('testModule', function(){});
        expect(ty.tyCacheService[ty.Constants.cachePrefix+'testModule']).toBeDefined();
    });

    it("It should return true if module exists", function() {
        var exist = ty.tyCacheService.exists('testModule', function(){});
        var notExist = ty.tyCacheService.exists('testModuleNotExists', function(){});
        expect(exist).toBe(true);
        expect(notExist).toBe(false);
    });

    it("It should return module", function() {
        var module = ty.tyCacheService.get('testModule', function(){});
        expect(typeof module).toBe('function');
    });

    it("It should return undefined for not cached module", function() {
        var module = ty.tyCacheService.get('testModuleNotExists', function(){});
        expect(typeof module).toBe('undefined');
    });

    it("It should clear cached module", function() {
        ty.tyCacheService.clear('testModule');
        var module = ty.tyCacheService.get('testModule', function(){});
        expect(typeof module).toBe('undefined');
    });

    it("It should return all cached module names", function() {
        ty.tyCacheService.cache('testModule1', function(){});
        ty.tyCacheService.cache('testModule2', function(){});
        ty.tyCacheService.cache('testModule3', function(){});
        var moduleList = ty.tyCacheService.getCachedModuleNames();
        expect(moduleList).toEqual(['testModule1','testModule2','testModule3']);
    });

    it("It should clear all cached modules", function() {
        ty.tyCacheService.clearAll();
        var module = ty.tyCacheService.get('testModule');
        expect(typeof module).toBe('undefined');
    });
});

describe("TyHttpLoader", function(){
    it("It should return cdn link", function() {
        expect(ty.tyHttpService.cdnLinkBuilder('module').indexOf('.js') > 0).toBe(true);
    });

    it("It should appendScript sync", function() {
        var cdnLink = ty.tyHttpService.cdnLinkBuilder('array');
        var xhrObj = ty.tyHttpService.request('array', true);
        setTimeout(function(){
            if(xhrObj.readyState == 4 && xhrObj.stats == 200){
                var script = document.querySelector('[src="'+cdnLink+'"]');
                expect(script).not.toEqual(null);
            }
        }, 500);
    });

    it("It should appendScript async", function() {
        var cdnLink = ty.tyHttpService.cdnLinkBuilder('array2');
        ty.tyHttpService.request('array2');
        var script = document.querySelector('[src="'+cdnLink+'"]');
        expect(script).not.toEqual(null);
    });

    it("It should check if async module is pending for download", function() {
        ty.tyHttpService.request('testModule');
        var isPending = ty.tyHttpService.isModulePending('testModule');
        expect(isPending).toEqual(true);
    });

    it("It should not redownload pending module", function() {
        ty.tyHttpService.request('testModule');
        var isDownloading = ty.tyHttpService.request('testModule');
        expect(isDownloading).toEqual(false);
    });

    it("It should override pending module if sync", function() {
        ty.tyHttpService.request('testModule');
        var xhr = ty.tyHttpService.request('testModule', true);
        expect(typeof xhr).toEqual('object');
    });

    it("It should register module to waiter queue", function() {
        var instance = new (function exampleClass() {})();
        ty.tyHttpService.moduleWaiterList.waiterList = [];
        ty.tyHttpService.request('Test', false, instance);
        expect(ty.tyHttpService.moduleWaiterList.waiterList.length > 0).toEqual(true);
    });
});