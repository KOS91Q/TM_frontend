function getParameter(name) {
    let results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
const token = getParameter('token');
const error = getParameter('error');
if (token) {
    localStorage.setItem('accessToken', token)
    window.location = origin
} else if (error) {
    window.location = origin + location.search
} else {
    window.location = origin
}

