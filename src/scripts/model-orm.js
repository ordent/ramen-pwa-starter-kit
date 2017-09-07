class ModelOrm{
    constructor(url, data) {
        if(url){
            this.apiURL = url;
        }

        if (data == undefined) {
            return this;
        } else if (typeof data == 'object') {
            this.generate(data);
        } else {
            this.id = data;
        }
    }

    generate(data) {
        Object.assign(this, data);
    }

    fetchORM(url = null, query = "", option = {}){
        let result = new Promise((resolve, reject) => {
            if(url == null){
                url = this.apiURL;
            }
            fetch(this.apiURL + query, option)
                .then((response) => {
                    const item = {
                        data:[]
                    };
                    try{
                        if(response.response && response.response.data){
                            if(response.response.data.length > 0){
                                response.response.data.forEach((f)=>{
                                    item.data.push(new self.constructor(f));
                                });
                            }else{
                                item.data = new self.constructor(response.response.data);
                            }
                        }  
                    }catch(error){
                        reject(error);
                    }
                    resolve(item);
                }).catch((error) => {
                    reject(error);
                });
        });
        return result;
    }

    getCollection(url = null, query = "", limit = 25, page = 1, options = {}){
        let q = '';
        q = query.includes('?') ? "&" : "?";
        q = query + q;
        q = q + 'limit='+limit+'&page='+page;
        if(options.collectionID){
            q = q + '&id=';
            options.collectionID.forEach((id) => {
                q = q + id + ',';
            });
            q = q.substring(0, q.length);
        }
        return this.fetchORM(url, q);
    }


    resetData() {
        let url = this.apiURL;
        for (let key in this) {
            if (this.hasOwnProperty(key)) {
                delete this[key];
            }
        }
        this.apiURL = url;
    }

    _getAllURL(limit) {
        if (limit == null) {
            limit = 100;
        }
        return this.apiURL + '?limit=' + limit;
    }

    _getItemURL(id, param) {
        if (param != undefined) {
            return this.apiURL + '/' + id + param;
        } else {
            return this.apiURL + '/' + id;
        }
    }

    _postItemURL() {
        return this.apiURL;
    }

    _putItemURL(id) {
        return this.apiURL + '/' + id;
    }

    deleteItemURL(id) {
        return this.apiURL + '/' + id;
    }

    getCollection(param) {
        let url = this.apiURL;
        if (param != undefined) {
            url = this.apiURL + param;
        }

        let request = {
            method: 'GET',
            url: url,
            contentType: 'application/json',
        };

        let self = this;

        let result = new Promise((resolve, reject) => {
            let xhr = this.createRequest(request);
            xhr.completes.then(function(e) {
                // console.log(e.response);
                let data = {
                    data: [],
                };
                let temp = e.response.data;
                temp.forEach(function(f) {
                    // console.log(new poly.constructor(f));
                    data.data.push(new self.constructor(f));
                });
                // console.log(data);
                resolve(data);
            }).catch(function(f) {
                reject(xhr);
            });
        });
        return result;
    }

    getArray(url, param) {
        // if (url == null || url == undefined) {
        //     url = this.apiURL;
        // }
        if (param != undefined) {
            if(url == null) {
                url = param;
            }else{
                url = url + param;
            }
        }
        let request = {};
        request.method = 'GET';
        request.url = this.apiURL + url;

        request.contentType = 'application/json';
        let poly = this;
        let result = new Promise((resolve, reject) => {
            // console.log(window.app.app);
            let xhr = this.createRequest(request);
            xhr.completes.then(function(e) {
                let data = [];
                e.response.data.forEach(function(f) {
                    data.push(new poly.constructor(f));
                });
                let result = {
                    data: data,
                    meta: e.response.meta,
                };
                resolve(result);
            }).catch(function(f) {
                reject(xhr);
            });
        });
        return result;
    }

    getArrayById(url, id=[]) {
        let param = '?id=';
        id.forEach(function(item, index) {
            if(index != id.length -1) {
                param += item+',';
            }else{
                param += item;
            }
        });
        let result = new Promise((resolve, reject) => {
            this.getArray(url, param)
                .then(function(e) {
                    let data = [];
                    let temp = null;
                    id.forEach(function(i) {
                        temp = e.data.filter(function(f) {
                            return f.id == i;
                        });
                        data.push(temp.pop());
                    });
                    let d = {
                        data: data,
                        meta: e.meta,
                    };
                    resolve(d);
                }).catch(function(f) {
                    reject(f);
                });
        });
        return result;
        // return this.getArray(url, param);
    }
    // return promise    
    getAll(limit, q) {
        let request = {};
        request.method = 'GET';
        request.url = this._getAllURL(limit);
        if (q != undefined) {
            request.url += '&' + q;
        }
        request.contentType = 'application/json';
        let poly = this;
        let result = new Promise((resolve, reject) => {
            let xhr = this.createRequest(request);
            xhr.completes.then(function(e) {
                let data = [];
                try {
                    e.response.data.forEach(function(f) {
                        data.push(new poly.constructor(f));
                    });
                } catch (e) {
                    console.log(e);
                }
                resolve(data);
            }).catch(function(f) {
                reject(xhr);
            });
        });
        return result;
    }

    // return promise
    getItem(id, param) {
        let request = {};
        request.method = 'GET';
        request.url = this._getItemURL(id);
        request.contentType = 'application/json';
        let self = this;
        if (param != undefined) {
            request.url = request.url + param;
        }
        let result = new Promise((resolve, reject) => {
            let xhr = this.createRequest(request);
            xhr.completes.then(function(e) {
                let result = new self.constructor(e.response.data);
                result.setMeta(e.response.meta);
                resolve(result);
            }).catch(function(f) {
                reject(xhr);
            });
        });
        return result;
    }

    getRecentItem(limit = 1) {
        let request = {};
        request.method = 'GET';
        request.url = this.apiURL + '/latest/true/';
        request.contentType = 'application/json';
        let self = this;
        let result = new Promise((resolve, reject) => {
            let xhr = this.createRequest(request);
            xhr.completes.then(function(e) {
                let result = null;
                if(Array.isArray(e.response.data)){
                    if(e.response.data.length > 1) {
                        result = [];
                        e.reponse.data.forEach(function(element) {
                            result.push(new self.constructor(element));
                        });
                    }else{
                        if(e.response.data[0]!=undefined){
                            result = new self.constructor(e.response.data[0]);                                
                        }
                    }
                }
                
                resolve(result);
            }).catch(function(f) {
                reject(xhr);
            });
        });
        return result;
    }

    setMeta(meta) {
        this.meta = {};
        Object.assign(this.meta, meta);
    }

    _toJSON() {
        let result = Object.assign({}, this);
        for (const key in result) {
            if (result.hasOwnProperty(key)) {
                const element = result[key];
                if (element == undefined || element == null) {
                    delete result[key];
                }
            }
        }

        return JSON.stringify(result);
    }

    getFormData() {
        // create form data return
        let fData = new FormData();
        // check every key inside the object
        for (var i in this) {
            // make sure the key is exist
            if (this.hasOwnProperty(i)) {
                // get the value from the key
                var element = this[i];
                // make sure the the value is not undefined or null
                if (element != null) {
                    // check if the value is array and have value
                    if (Array.isArray(element) && element.length > 0) {
                        // crate form data based on array rule of form data
                        if (element[0].constructor === File) {
                            if (element.length > 1) {
                                for (var j = 0; j < element.length; j++) {
                                    var x = element[j];
                                    console.log(i + '[]', x);
                                    fData.append(i + '[]', x);
                                }
                            } else {
                                console.log(i, element[0]);
                                fData.append(i, element[0]);
                            }
                        }
                        // check if the value is object
                    } else if (typeof element == 'object') {
                        if (element.constructor === File) {
                            console.log(i, element);
                            fData.append(i, element);
                        } else {
                            // console.log(i, JSON.stringify(element));
                            fData.append(i, JSON.stringify(element));
                        }
                        // if all else just put the value inside
                    } else {
                        // console.log(i, element);
                        fData.append(i, element);
                    }
                }
            }
        }
        return fData;
    }

    // return promise
    postItem(json) {
        let request = {};
        request.method = 'POST';
        request.url = this._postItemURL();
        if (json) {
            request.body = this._toJSON();
            request.contentType = 'application/json';
            // console.log(request.body);
        } else {
            request.body = this.getFormData();
            for (var value of request.body.values()) {
                // console.log(value);
            }
        }

        let poly = this;
        let result = new Promise((resolve, reject) => {
            let xhr = this.createRequest(request);
            xhr.completes.then(function(e) {
                resolve(new poly.constructor(e.response.data));
            }).catch(function(f) {
                console.log(f);
                reject(xhr);
            });
        });
        return result;
    }

    putItem(id, json) {
        let request = {};
        request.method = 'POST';
        request.url = this._putItemURL(id);
        if (json) {
            this._method = 'PUT';
            // json.method = "_PUT";
            request.body = JSON.stringify(json);
            request.contentType = 'application/json';
        } else {
            request.body = this.getFormData();
            request.body.append('_method', 'PUT');
        }
        request.method = "PUT";

        let poly = this;
        let result = new Promise((resolve, reject) => {
            let xhr = this.createRequest(request);
            xhr.completes.then(function(e) {
                resolve(new poly.constructor(e.response.data));
            }).catch(function(f) {
                reject(xhr);
            });
        });
        return result;
    }

    deleteItem(id) {
        let request = {};
        request.method = 'DELETE';
        request.url = this.deleteItemURL(id);
        request.contentType = 'application/json';
        let poly = this;
        let result = new Promise((resolve, reject) => {
            let xhr = this.createRequest(request);
            xhr.completes.then(function(e) {
                if (e.response != null) {
                    resolve(e.response.data);
                } else {
                    resolve(e);
                }
            }).catch(function(f) {
                reject(xhr);
            });
        });
        return result;
    }

    createRequest(data, headers) {
        let defaultRequest = {
            method: 'GET',
            url: '',
        };
        let request = Object.assign({}, defaultRequest, data);
        let ajax = Object.assign(this.xhr, request);
        if (request.contentType == 'application/x-www-form-urlencoded' || request.contentType == 'application/json') {
            ajax.contentType = request.contentType;
            if (typeof request.body != 'string') {
                ajax.body = JSON.stringify(request.body);
            } else {
                ajax.body = request.body;
            }
        }
        
        // ajax.withCredentials = true;
        if (headers != null) {
            ajax.headers = headers;
        }
        let xhr = ajax.generateRequest();
        xhr.send();
        return xhr;
    }
}