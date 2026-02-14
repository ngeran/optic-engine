"""Snapshot operation endpoints."""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from pathlib import Path

from backend.app.schemas.snapshot import SnapshotRequest, SnapshotResponse
from backend.app.services.jsnapy_service import jsnapy_service
from backend.app.core.exceptions import OpticEngineException
from backend.app.core.config import settings

router = APIRouter(prefix="/snapshots", tags=["snapshots"])


@router.get("", response_model=list[dict])
async def list_snapshots():
    """
    List all snapshot files in the snapshots directory.

    Returns:
        List of snapshot files with metadata
    """
    try:
        snapshots_dir = Path(settings.snapshots_dir)
        if not snapshots_dir.exists():
            return []

        snapshots = []
        for file_path in snapshots_dir.rglob("*.xml"):
            stat = file_path.stat()
            snapshots.append({
                "name": file_path.name,
                "path": str(file_path.relative_to(snapshots_dir)),
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })

        # Sort by modified date descending
        snapshots.sort(key=lambda x: x["modified_at"], reverse=True)
        return snapshots

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list snapshots: {str(e)}"
        )


@router.post("/pre", response_model=SnapshotResponse)
async def run_pre_snapshot(request: SnapshotRequest = None) -> SnapshotResponse:
    """
    Run a pre-change snapshot.

    Args:
        request: Optional snapshot request with device overrides

    Returns:
        SnapshotResponse with operation status

    Raises:
        HTTPException: If snapshot fails
    """
    if request is None:
        request = SnapshotRequest()

    try:
        # Extract overrides
        device_ip = request.device
        username = request.username
        password = request.password
        test_file = request.test_file

        # Run pre snapshot
        output, return_code = await jsnapy_service.run_snapshot(
            snapshot_type="pre",
            device_ip=device_ip,
            username=username,
            password=password,
            test_file=test_file
        )

        return SnapshotResponse(
            status="success",
            message="PRE snapshot completed successfully",
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


@router.post("/post", response_model=SnapshotResponse)
async def run_post_snapshot(request: SnapshotRequest = None) -> SnapshotResponse:
    """
    Run a post-change snapshot.

    Args:
        request: Optional snapshot request with device overrides

    Returns:
        SnapshotResponse with operation status

    Raises:
        HTTPException: If snapshot fails
    """
    if request is None:
        request = SnapshotRequest()

    try:
        # Extract overrides
        device_ip = request.device
        username = request.username
        password = request.password
        test_file = request.test_file

        # Run post snapshot
        output, return_code = await jsnapy_service.run_snapshot(
            snapshot_type="post",
            device_ip=device_ip,
            username=username,
            password=password,
            test_file=test_file
        )

        return SnapshotResponse(
            status="success",
            message="POST snapshot completed successfully",
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
