export class AppError extends Error {
    public readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "unauthorized") {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}