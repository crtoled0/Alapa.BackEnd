let sessObj = {
     session: null,
     logger: null,
};

class GlobObjs {
    constructor(sessionObj = null, loggerObj = null) {
          if (sessionObj)
               sessObj.session = sessionObj;
          if (loggerObj)
               sessObj.logger = loggerObj;
    }
    public set(key: any, value: Object): void {
         sessObj.session[key] = value;
    }
    public get(key: any): any {
        return sessObj.session[key] || null;
    }
    public getLogger(): any {
         return sessObj.logger;
    }
}

export default GlobObjs;
