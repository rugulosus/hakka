function createAxios() {
    return new Promise(function (resolve, reject) {
        browser.storage.local.get('token').then(result => {
            var axios = require('axios').create({
                baseURL: 'https://cloud.feedly.com/v3',
                responseType: 'json',
                headers: {
                    Authorization: `OAuth ${result.token}`
                }
            });
            resolve(axios);
            return;
        }, error => {
            reject(error);
        });
    });
}

export default {
    get: function(url) {
        return new Promise(function (resolve, reject) {
            createAxios().then(axios => {
                axios.get(url).then(json => resolve(json)).catch(error => reject(error));
                return;
            }, error => {
                reject(error);
            });
        });
    },
    getStreams: function(streamId, continuationId) {
        return new Promise(resolve => {
            this.get(`streams/contents?streamId=${streamId}${continuationId != '' ? '&continuation=' + continuationId : ''}`).then(json => {
                resolve({
                    feedId: json.data.id,
                    title: json.data.title,
                    url: (json.data.alternate && json.data.alternate[0].href) || '',
                    continuationId: json.data.continuation,
                    entries: json.data.items.map(entry => ({
                        id: entry.id,
                        title: entry.title,
                        published: new Date(entry.published),
                        url: entry.canonicalUrl || (entry.canonical && entry.canonical[0].href) || (entry.alternate && entry.alternate[0].href),
                        content: String((entry.content && entry.content.content) || (entry.summary && entry.summary.content) || '').replace(/\<(?!\/?p|\/?div|br ?\/?)[^>]*\>/gi, ''),
                        unread: entry.unread,
                        visual: (entry.visual && entry.visual.url) || ''
                    })),
                    readEntries: []
                });
            });
        });
    }
}
