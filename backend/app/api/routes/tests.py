"""Test execution endpoints."""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime

from backend.app.schemas.test import TestRequest, TestResponse
from backend.app.services.jsnapy_service import jsnapy_service
from backend.app.core.exceptions import OpticEngineException

router = APIRouter(prefix="/run-check", tags=["tests"])


@router.post("", response_model=TestResponse)
async def run_check(request: TestRequest = None) -> TestResponse:
    """
    Run a check operation to compare pre/post snapshots.

    Args:
        request: Optional test request with device overrides

    Returns:
        TestResponse with operation status and results

    Raises:
        HTTPException: If check fails
    """
    if request is None:
        request = TestRequest()

    try:
        # Extract overrides
        device_ip = request.device
        username = request.username
        password = request.password
        test_file = request.test_file

        # Run check
        output, return_code = await jsnapy_service.run_check(
            device_ip=device_ip,
            username=username,
            password=password,
            test_file=test_file
        )

        # Determine success based on return code
        # JSNAPy returns 0 for all pass, non-zero for any failures
        message = "Check completed" if return_code == 0 else "Check completed with failures"

        return TestResponse(
            status="success",
            message=message,
            data=output,
            timestamp=datetime.utcnow()
        )

    except OpticEngineException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )
