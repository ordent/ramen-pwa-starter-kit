export default class ModelORM {
    constructor(url, data) {
        if (url) {
            this.apiURL = url;
        }

        if (data == undefined) {
            return this;
        } else if (typeof data == 'object') {
            this.generate(data);
        } else {
            this.id = data;
        }
        this.headers = null;
    }

    generate(data) {
        Object.assign(this, data);
    }

    setHeader(headers) {
        this.headers = headers;
    }
    
    setMeta(meta) {
        this.meta = {};
        Object.assign(this.meta, meta);
    }

    fetchORM(url = null, query = "", option = {}) {
        let result = new Promise((resolve, reject) => {
            url = (url == null) ? this.apiURL : '';
            option.headers = (option.headers == null && this.headers != null) ? this.headers : '';
            fetch(this.apiURL + query, option)
                .then((response) => {
                    const item = {
                        data: [],
                        meta: response.response.meta
                    };
                    try {
                        if (response.response.status_code >= 200 && response.response.status_code <= 203) {
                            if (response.response && response.response.data) {
                                if (response.response.data.length > 0) {
                                    response.response.data.forEach((f) => {
                                        item.data.push(new self.constructor(f));
                                    });
                                } else {
                                    item.data = new self.constructor(response.response.data);
                                }
                            }
                        }else if(response.response.status_code == 204){
                            item.data = {};
                        }
                    } catch (error) {
                        reject(error);
                    }
                    resolve(item);
                }).catch((error) => {
                    reject(error);
                });
        });
        return result;
    }

    getCollection(url = null, query = '', limit = 25, page = 1, option = {}) {
        let q = '';
        q = url.includes('?') ? '&' : '?' + query;
        q = q + q.includes('?') ? '&' : '?' + 'limit=' + limit + '&page=' + page;
        if(option.collectionID){
            q = this._getQueryForCollectionID(q, option.collectionID);
        }
        if(option.recent){
            url = url + '/latest';
            if(optoin.recentStatus){
                url = url + '/true';
            }
        }
        if(option.featured){
            url = url + '/latest';
            if(optoin.featuredStatus){
                url = url + '/true';
            }
        }
        return this.fetchORM(url, q, option);
    }

    _getQueryForCollectionID(query = '', array = []) {
        query = query + query.includes('?') ? '&' : '?' + 'id=';
        array.forEach((id) => {
            query = query + id + ',';
        });
        query = query.substring(0, query.length);
    }

    getItem(url = null, query = '', slug = '', option = {}) {
        let q = '';
        q = url.includes('?') ? '&' : '?' + query;
        q = url + u + '/' + slug;
        return this.fetchORM(url, q, option);
    }

    postItem(url = null, query = '', option = {}) {
        let q = '';
        q = url.includes('?') ? '&' : '?' + query;
        option.method = "POST";
        if(option.json){
            option.contentType = 'application/json';
            option.body = this._toJSON();
        }else{
            option.contentType = 'multipart/form-data';
            option.body = this._toFormData();
        }
        return this.fetchORM(url, q, option);
    }

    putItem(url = null, query = '', slug = "", option = {}) {
        let q = '';
        q = url.includes('?') ? '&' : '?' + query;
        option.method = 'PUT';
        if(url){
            url = url + '/' + slug;
        }
        if(option.json){
            option.contentType = 'application/json';
            option.body = this._toJSON();
        }else{
            option.contentType = 'multipart/form-data';
            option.body = this._toFormData();
            option.body.append('_method', 'PUT');
        }
        return this.fetchORM(url, q, option);
    }

    deleteItem(url = null, query = '', slug = "", option = {}){
        let q = '';
        q = url.includes('?') ? '&' : '?' + query;
        option.method = 'DELETE';
        if(url){
            url = url + '/' + slug;
        }
        return this.fetchORM(url, q, option);
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

    _toFormData() {
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
}