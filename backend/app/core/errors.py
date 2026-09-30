from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

class APIException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        headers: dict = None
    ):
        super().__init__(status_code=status_code, detail={"code": code, "message": message}, headers=headers)
        self.code = code
        self.message = message

def api_exception_handler(request, exc: APIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )
