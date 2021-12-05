
module.exports.getDate = function () {
    const today = new Date();
    const options = {
        day: "numeric",
        weekday: "long",
        month: "long",
    }

    return today.toLocaleDateString("en-Ng", options);
}

module.exports.getDay = function getDay() {
    const today = new Date();
    const options = {
        weekday: "long",
    }

    return today.toLocaleDateString("en-Ng", options);

}