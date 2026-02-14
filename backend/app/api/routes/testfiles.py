"""Test file management endpoints."""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from pathlib import Path

from backend.app.core.config import settings

router = APIRouter(prefix="/testfiles", tags=["testfiles"])


@router.get("", response_model=list[dict])
async def list_testfiles():
    """
    List all test YAML files in the testfiles directory.

    Returns:
        List of test files with metadata
    """
    try:
        testfiles_dir = Path(settings.testfiles_dir)
        if not testfiles_dir.exists():
            return []

        testfiles = []
        for file_path in testfiles_dir.rglob("*.yml"):
            stat = file_path.stat()
            testfiles.append({
                "name": file_path.name,
                "path": str(file_path.relative_to(testfiles_dir)),
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })
        # Also check for .yaml files
        for file_path in testfiles_dir.rglob("*.yaml"):
            stat = file_path.stat()
            testfiles.append({
                "name": file_path.name,
                "path": str(file_path.relative_to(testfiles_dir)),
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })

        # Sort by modified date descending
        testfiles.sort(key=lambda x: x["modified_at"], reverse=True)
        return testfiles

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list test files: {str(e)}"
        )


@router.get("/{filename}", response_model=dict)
async def get_testfile(filename: str):
    """
    Get a specific test file content.

    Args:
        filename: Name of the test file

    Returns:
        Test file content

    Raises:
        HTTPException: If file not found or read fails
    """
    try:
        testfiles_dir = Path(settings.testfiles_dir)
        file_path = testfiles_dir / filename

        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test file '{filename}' not found"
            )

        content = file_path.read_text()
        stat = file_path.stat()

        return {
            "filename": filename,
            "content": content,
            "size": stat.st_size
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read test file: {str(e)}"
        )


@router.post("", response_model=dict)
async def save_testfile(request: dict):
    """
    Save a test file.

    Args:
        request: Dictionary with filename and content

    Returns:
        Success message with filename

    Raises:
        HTTPException: If save fails
    """
    try:
        testfiles_dir = Path(settings.testfiles_dir)
        testfiles_dir.mkdir(parents=True, exist_ok=True)

        filename = request.get("filename")
        content = request.get("content")

        if not filename or not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both filename and content are required"
            )

        file_path = testfiles_dir / filename
        file_path.write_text(content)

        return {
            "status": "success",
            "message": f"Test file '{filename}' saved successfully",
            "filename": filename
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save test file: {str(e)}"
        )


@router.delete("/{filename}", response_model=dict)
async def delete_testfile(filename: str):
    """
    Delete a test file.

    Args:
        filename: Name of the test file

    Returns:
        Success message

    Raises:
        HTTPException: If file not found or delete fails
    """
    try:
        testfiles_dir = Path(settings.testfiles_dir)
        file_path = testfiles_dir / filename

        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test file '{filename}' not found"
            )

        file_path.unlink()

        return {
            "status": "success",
            "message": f"Test file '{filename}' deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete test file: {str(e)}"
        )
