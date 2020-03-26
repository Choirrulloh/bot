const fetch = require("node-fetch");

const corona = () => new Promise((resolve, reject) => {
    fetch('https://abckklmn.herokuapp.com/negara/Indonesia', {
            method: 'GET'
        })
        .then(res => res.json())
        .then(res => {
            resolve(res)
        })
        .catch(err => {
            reject(err)
        });
});

module.exports = {
    corona
}