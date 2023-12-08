export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
    }
}

export function asyncHandler(fun) {
    return (req, res, next) => {
        fun(req, res, next).catch(err => {
            next(err)
        })
    }
}

export const globalErrorHandel = (err, req, res, next) => {
    if (process.env.MODE == "DEV") {
        devMode(err, res)
    } else {
        prodMode(err, res)
    }
}

const prodMode = (err, res) => {
    const code = err.statusCode || 400
    res.status(code).json({ msg: err.message, statusCode: code })
}
const devMode = (err, res) => {
    const code = err.statusCode || 400
    res.status(code).json({ msg: err.message, statusCode: code, stack: err.stack })
}