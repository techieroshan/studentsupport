"""Donor organization routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from database import get_db
from models import Donor
from schemas import DonorResponse

router = APIRouter(prefix="/donors", tags=["donors"])


@router.get("", response_model=List[DonorResponse])
async def get_donors(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get donor organizations."""
    query = select(Donor)
    
    # Filter by category
    if category:
        query = query.where(Donor.category == category)
    
    result = await db.execute(query)
    donors = result.scalars().all()
    
    return donors
