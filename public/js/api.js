import {authView, utilView} from "./view.js";

export {service, itemType, url};

// const API_URL = 'https://kos-todo-backend.herokuapp.com/';
const API_URL = 'http://localhost:8087/';
const itemType = {
    PROJECT: 'project',
    TASK: 'task'
}

const provider = {
    local: 'local',
    google: 'google',
    github: 'github',
    facebook: 'facebook'
}

const REQUEST_TYPE = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
}

const ACCESS_TOKEN = 'accessToken'
const OAUTH2_REDIRECT_URI = window.origin + '/oauth2/redirect';
const url = {
    PROJECT: API_URL + itemType.PROJECT,
    TASK: API_URL + itemType.TASK,
    BASE: API_URL,
    USER_ME: API_URL + "user/me",
    LOGIN: API_URL + "auth/login",
    SING_UP: API_URL + "auth/signup",
    GOOGLE_AUTH: `${API_URL}oauth2/authorize/${provider.google}?redirect_uri=${OAUTH2_REDIRECT_URI}`,
    GITHUB_AUTH: `${API_URL}oauth2/authorize/${provider.github}?redirect_uri=${OAUTH2_REDIRECT_URI}`,
    FACEBOOK_AUTH: `${API_URL}oauth2/authorize/${provider.facebook}?redirect_uri=${OAUTH2_REDIRECT_URI}`
}

$.ajaxSetup({
    cache: false,
    processData: false,
    headers: {'Content-Type': 'application/json'}
});

const service = {
    load: () => {
        let error = getParameter('error');
        if (error) {
            utilView.notify(error, 'error')
        }
        let token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            service.request(url.USER_ME, REQUEST_TYPE.GET, authView.me)
        } else {
            $('#sign_in input:first').focus();
        }
        utilView.isAuthorized(token)
    },
    prepareData: (beforeData) => {
        let data = {};
        try {
            new FormData(beforeData).forEach((value, key) => data[key] = value)
        } catch (e) {
            data = beforeData
        }
        return JSON.stringify(data);
    },
    saveToken: (response) => localStorage.setItem(ACCESS_TOKEN, response[ACCESS_TOKEN]),
    request,
    REQUEST_TYPE,
    ACCESS_TOKEN,
    provider
}

function request(urlRequest, type, show, data) {
    $.ajax({
        url: urlRequest,
        method: type,
        type: type,
        data: data,
        beforeSend: function (xhr) {
            if (localStorage.getItem(ACCESS_TOKEN)) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN));
            }
        },
        success(response) {
            utilView.notify(response.message, response.status)
            show(response.data ? response.data : response)
            // console.log(type, '|', urlRequest, '|', new URLSearchParams(data).toString(), '|', show.name, '|', response);
            return true;
        },
        error: (response) => {
            // console.log(type, '|', urlRequest, '|', new URLSearchParams(data).toString(), '|', show.name, '|', response);
            if (response.responseJSON) {
                utilView.notify(response.responseJSON.message, response.statusText)
                if (response.responseJSON.error === "Unauthorized") {
                    localStorage.clear();
                    utilView.isAuthorized(false);
                }
            } else {
                utilView.notify('Unexpected error', response.statusText)
            }
            return false;
        }
    })
}

function getParameter(name) {
    let results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}