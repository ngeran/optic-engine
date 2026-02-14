"""Device inventory endpoints."""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from pathlib import Path
import yaml

from backend.app.schemas.device import InventoryFileCreate, InventoryFile
from backend.app.core.config import settings

router = APIRouter(prefix="/inventories", tags=["inventories"])


@router.get("", response_model=list[InventoryFile])
async def list_inventories():
    """
    List all inventory YAML files in the inventories directory.

    Returns:
        List of inventory files with metadata
    """
    try:
        inventories_dir = Path(settings.inventories_dir)
        if not inventories_dir.exists():
            inventories_dir.mkdir(parents=True, exist_ok=True)
            return []

        inventory_files = []
        for file_path in inventories_dir.glob("*.yml"):
            stat = file_path.stat()
            inventory_files.append({
                "name": file_path.name,
                "path": str(file_path.relative_to(inventories_dir)),
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })

        for file_path in inventories_dir.glob("*.yaml"):
            stat = file_path.stat()
            inventory_files.append({
                "name": file_path.name,
                "path": str(file_path.relative_to(inventories_dir)),
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })

        # Sort by modified date descending
        inventory_files.sort(key=lambda x: x["modified_at"], reverse=True)
        return inventory_files

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list inventories: {str(e)}"
        )


@router.get("/{filename}", response_model=dict)
async def get_inventory(filename: str):
    """
    Get the content of a specific inventory file.

    Args:
        filename: Name of the inventory file

    Returns:
        Parsed YAML content as dictionary

    Raises:
        HTTPException: If file not found
    """
    try:
        inventories_dir = Path(settings.inventories_dir)
        file_path = inventories_dir / filename

        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inventory file '{filename}' not found"
            )

        with open(file_path, 'r') as f:
            content = yaml.safe_load(f)

        return {
            "filename": filename,
            "content": content
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read inventory: {str(e)}"
        )


@router.post("")
async def save_inventory(request: InventoryFileCreate):
    """
    Save or update an inventory file.

    Args:
        request: Inventory file with filename and YAML content

    Returns:
        Success message

    Raises:
        HTTPException: If save fails
    """
    try:
        inventories_dir = Path(settings.inventories_dir)
        inventories_dir.mkdir(parents=True, exist_ok=True)

        # Validate YAML
        try:
            yaml.safe_load(request.content)
        except yaml.YAMLError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid YAML: {str(e)}"
            )

        # Save file
        file_path = inventories_dir / request.filename
        with open(file_path, 'w') as f:
            f.write(request.content)

        return {
            "status": "success",
            "message": f"Inventory file '{request.filename}' saved successfully",
            "filename": request.filename
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save inventory: {str(e)}"
        )


@router.delete("/{filename}")
async def delete_inventory(filename: str):
    """
    Delete an inventory file.

    Args:
        filename: Name of the inventory file

    Returns:
        Success message

    Raises:
        HTTPException: If file not found or delete fails
    """
    try:
        inventories_dir = Path(settings.inventories_dir)
        file_path = inventories_dir / filename

        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inventory file '{filename}' not found"
            )

        file_path.unlink()

        return {
            "status": "success",
            "message": f"Inventory file '{filename}' deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete inventory: {str(e)}"
        )
