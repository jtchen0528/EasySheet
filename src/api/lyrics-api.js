import axios from 'axios';

// TODO replace the key with yours
const baseUrl = `https://api.itooi.cn/music/netease/search?key=579621905`;
const lyricsUrl = `https://api.itooi.cn/music/netease/lrc?`

export function getWeatherGroup(code) {
    let group = 'na';
    if (200 <= code && code < 300) {
        group = 'thunderstorm';
    } else if (300 <= code && code < 400) {
        group = 'drizzle';
    } else if (500 <= code && code < 600) {
        group = 'rain';
    } else if (600 <= code && code < 700) {
        group = 'snow';
    } else if (700 <= code && code < 800) {
        group = 'atmosphere';
    } else if (800 === code) {
        group = 'clear';
    } else if (801 <= code && code < 900) {
        group = 'clouds';
    }
    return group;
}

export function capitalize(string) {
    return string.replace(/\b\w/g, l => l.toUpperCase());
}

let lyricsSource = axios.CancelToken.source();

export function getLyrics(song) {
    var url = `${baseUrl}&s=${song}&type=song&limit=5`;

    console.log(`Making request to: ${url}`);

    return axios.get(url).then(function(res) {
        if (res.data.result!=="SUCCESS") {
            throw new Error(res.data.message);
        } else {
            console.log(res.data.data[0].name);
            return {
                data: res.data.data
            };
        }
    }).catch(function(err) {
        if (axios.isCancel(err)) {
            console.error(err.message, err);
        } else {
            throw err;
        }
    });
}

export function getSinger(singer) {
    var url = `${baseUrl}&s=${singer}&type=singer&limit=100`;

    console.log(`Making request to: ${url}`);

    return axios.get(url).then(function(res) {
        if (res.data.result!=="SUCCESS") {
            throw new Error(res.data.message);
        } else {
           console.log(res.data.data.artists[0].name);
            return {
                singercn: res.data.data.artists[0].name
            };
        }
    }).catch(function(err) {
        if (axios.isCancel(err)) {
            console.error(err.message, err);
        } else {
            throw err;
        }
    });
}


export function getLyricsfromID(songID) {
        var url = `${lyricsUrl}key=579621905&id=${songID}`;
    
        console.log(`Making request to: ${url}`);
    
        return axios.get(url).then(function(res) {
               console.log(res.data);
                return {
                    lyrics: res.data
                };
        }).catch(function(err) {
            if (axios.isCancel(err)) {
                console.error(err.message, err);
            } else {
                throw err;
            }
        });
    }
    
export function requestLyrics(cdn) {

    if (cdn.songName != '') {

        // '_requestLyrics' is a function which handle 2 & 3 request. PLEASE go to line 181 start to trace code
        var _requestLyrics = function (singer_name) {

            // i choose double keyword search here
            // original request -> var url =  `${baseUrl}&s=${cdn.songName}&type=song&limit=5`; 
            //var url =  `${baseUrl}&s=${cdn.songName}&type=song&limit=5`; 
            var url = `${baseUrl}&s=${cdn.songName + ((singer_name) ? ',' + singer_name : '')}&type=song&limit=5`;

            // SECOND REQUEST : possible songs in list by song name; list size is 5 (?
            console.log(`2) - Making request to: ${url}`);
            return axios.get(url).then(function (_res) {

                // this judge format refer from api. use postman to check it out
                if (_res.data.result !== "SUCCESS") {
                    return badRequest({ alert_msg: 'No result.' });
                    throw new Error(_res.data.message);
                } else {

                    // if no match result
                    if (_res.data.data.length === 0) return badRequest({ alert_msg: 'No result' });

                    // then decide request song precisely by singer, default is return list's first one result
                    var id_req = _res.data.data[0].lrc;
                    var singer = _res.data.data[0].singer;
                    var id = _res.data.data[0].id;
                    var alert_msg = '';
                    var more_accurate_id_req = _res.data.data[0].lrc;

                    for (var i = 1; i < _res.data.data.length; i++) {
                        // if singer in list matches value in user's form
                        if (_res.data.data[i].singer.search(singer_name) !== -1) {
                            id_req = _res.data.data[i].lrc;
                            singer = _res.data.data[i].singer;
                            id = _res.data.data[i].id;
                            
                            // test if singer === request singer; if is, this one has a high possible to be the ideal song
                            if (!_res.data.data[i].singer.replace(singer_name, '')) more_accurate_id_req = _res.data.data[i].lrc;
                        }
                    }
                    if (cdn.singer != singer) alert_msg = '[API ERROR] Singer you request "' + cdn.singer + '" does not exist in our reslut; direct to the singer ' + singer;

                    // determine use which lrc
                    id_req = (more_accurate_id_req != id_req) ? more_accurate_id_req : id_req;

                    // THIRD REQUEST : define function to handle last request
                    console.log(`3) - Making request to: ${id_req}`);
                    return axios.get(id_req).then(function (res) {
                        if (res.data) {
                            return {
                                lyrics: res.data,
                                singer: singer,
                                song_id: id,
                                alert_msg: alert_msg
                            }
                        } else throw new Error(res.data.message);
                    }).catch(function (err) {
                        if (axios.isCancel(err)) {
                            console.error(err.message, err);
                            return badRequest({ alert_msg: 'No result.' });
                        }
                        else {
                            return badRequest({ alert_msg: 'No result.' });
                            // origin code is below
                            // throw err
                        }
                    });
                }
            }).catch(function (err) {
                if (axios.isCancel(err)) {
                    console.error(err.message, err);
                }
                else {
                    return badRequest({ alert_msg: 'No result.' });
                    // origin code is below
                    // throw err
                }
            });
        }
        
        if (cdn.singer != '') {

            // FIRST REQUEST : search the singer user request. use first result to next request
            console.log(`1) - Making request to: ${baseUrl}&s=${cdn.singer}&type=singer&limit=1`);
            return axios.get(`${baseUrl}&s=${cdn.singer}&type=singer&limit=1`).then(function (res_singer) {
                if (res_singer.data.result !== "SUCCESS") {
                    //throw new Error(res_singer.data.message);
                    return _requestLyrics(null);
                } else {
                    console.log(res_singer.data.data.artists[0].name);
                    return _requestLyrics(res_singer.data.data.artists[0].name);
                }
            }).catch(function (err) {
                if (axios.isCancel(err)) {
                    console.error(err.message, err);
                } else {
                    throw err;
                }
            });
        } else {
            // if user didn't typing singer in form, skip second request
            return _requestLyrics(null);
        }
    } else {
        // if no song name in request form, return default value
        return badRequest({ alert_msg: 'Song name is not defined.' });
    }
}
///   ///   ///
export function o_requestLyrics(cdn) {

    // i choose double keyword search in this one
    // original request -> var url =  `${baseUrl}&s=${cdn.songName}&type=song&limit=5`; 
    var url = `${baseUrl}&s=${cdn.songName + ((cdn.singer) ? ',' + cdn.singer : '')}&type=song&limit=5`;

    // FIRST REQUEST : possible songs in list by song name; list size is 10 (?
    console.log(`2) - Making request to: ${url}`);
    return axios.get(url).then(function (_res) {

        // this judge format refer from api. use postman to check it out
        if (_res.data.result !== "SUCCESS") {
            return badRequest({ alert_msg: 'No result.' });
            throw new Error(_res.data.message);
        } else {

            // if no match result
            if (_res.data.data.length === 0) return badRequest({ alert_msg: 'No result' });

            // then decide request song precisely by singer, default is return list's first one result
            var id_req = _res.data.data[0].lrc;
            var singer = _res.data.data[0].singer;
            var id = _res.data.data[0].id;
            var alert_msg = '';
            var more_accurate_id_req = _res.data.data[0].lrc;

            // THIRD REQUEST : define function to handle last request
            var _requestLyrics = function (singer_cn) {
                for (var i = 0; i < _res.data.data.length; i++) {

                    // if singer in list matches value in user's form
                    if (_res.data.data[i].singer.search(singer_cn) !== -1) {
                        id_req = _res.data.data[i].lrc;
                        singer = _res.data.data[i].singer;
                        id = _res.data.data[i].id;

                        // test if singer === request singer
                        if (!_res.data.data[i].singer.replace(singer_cn, '')) more_accurate_id_req = _res.data.data[i].lrc;
                    }
                }
                if (cdn.singer != singer) alert_msg = '[API ERROR] Singer you request "' + cdn.singer + '" does not exist in our reslut; direct to the singer ' + singer;

                id_req = (more_accurate_id_req != id_req) ? more_accurate_id_req : id_req;

                // start request accurate song
                console.log(`3) - Making request to: ${id_req}`);
                return axios.get(id_req).then(function (res) {
                    if (res.data) {
                        return {
                            lyrics: res.data,
                            singer: singer,
                            song_id: id,
                            alert_msg: alert_msg
                        }
                    } else throw new Error(res.data.message);
                }).catch(function (err) {
                    if (axios.isCancel(err)) {
                        console.error(err.message, err);
                        return badRequest({ alert_msg: 'No result.' });
                    }
                    else {
                        return badRequest({ alert_msg: 'No result.' });
                        // origin code is below
                        // throw err
                    }
                });
            }

            if (cdn.singer != '') {

                // Second REQUEST : search the singer user request. use first result to next request
                console.log(`1) - Making request to: ${baseUrl}&s=${cdn.singer}&type=singer&limit=1`);
                return axios.get(`${baseUrl}&s=${cdn.singer}&type=singer&limit=1`).then(function (res_singer) {
                    if (res_singer.data.result !== "SUCCESS") {
                        //throw new Error(res_singer.data.message);
                        return _requestLyrics(null);
                    } else {
                        console.log(res_singer.data.data.artists[0].name);
                        return _requestLyrics(res_singer.data.data.artists[0].name);
                    }
                }).catch(function (err) {
                    if (axios.isCancel(err)) {
                        console.error(err.message, err);
                    } else {
                        throw err;
                    }
                });
            } else {
                // if user didn't typing singer in form, skip second request
                return _requestLyrics(null);
            }
        }
    }).catch(function (err) {
        if (axios.isCancel(err)) {
            console.error(err.message, err);
        }
        else {
            return badRequest({ alert_msg: 'No result.' });
            // origin code is below
            // throw err
        }
    });
}
///  ///   ///
function badRequest(opt) {
    return new Promise((res, rej) => {
        res({
            song_id: 0,
            singer: 'NA',
            lyrics: 'NA',
            alert_msg: `${(opt.alert_msg) ? '[API ERROR] ' + opt.alert_msg : '' }`
        });
    });
}

export function cancelLyrics() {
    lyricsSource.cancel('Request canceled');
}

export function getForecast(city, unit) {
    // TODO
}

export function cancelForecast() {
    // TODO
}
