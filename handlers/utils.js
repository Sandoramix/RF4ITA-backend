function errorCatch(response, code, message) {
    return response.status(code).json({
        message: message,
    });
}

module.exports = {
    errorCatch,
};