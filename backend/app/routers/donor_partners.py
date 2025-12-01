from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import DonorPartner, User
from app.schemas import DonorPartnerResponse, DonorPartnerCreate
from app.auth import require_admin
from typing import List
import uuid

router = APIRouter(prefix="/donor-partners", tags=["donor-partners"])


@router.get("", response_model=List[DonorPartnerResponse])
def get_donor_partners(
    db: Session = Depends(get_db)
):
    """Get all donor partners (public endpoint)"""
    partners = db.query(DonorPartner).order_by(DonorPartner.created_at.desc()).all()
    return [DonorPartnerResponse(
        id=partner.id,
        name=partner.name,
        category=partner.category,
        tier=partner.tier,
        logo_url=partner.logo_url,
        website_url=partner.website_url,
        total_contribution_display=partner.total_contribution_display,
        is_anonymous=partner.is_anonymous,
        anonymous_name=partner.anonymous_name,
        quote=partner.quote,
        location=partner.location,
        since=partner.since,
        is_recurring=partner.is_recurring
    ) for partner in partners]


@router.post("", response_model=DonorPartnerResponse, status_code=status.HTTP_201_CREATED)
def create_donor_partner(
    partner_data: DonorPartnerCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new donor partner (admin only)"""
    new_partner = DonorPartner(
        id=str(uuid.uuid4()),
        name=partner_data.name,
        category=partner_data.category,
        tier=partner_data.tier,
        logo_url=partner_data.logo_url,
        website_url=partner_data.website_url,
        total_contribution_display=partner_data.total_contribution_display,
        is_anonymous=partner_data.is_anonymous,
        anonymous_name=partner_data.anonymous_name,
        quote=partner_data.quote,
        location=partner_data.location,
        since=partner_data.since,
        is_recurring=partner_data.is_recurring
    )
    
    db.add(new_partner)
    db.commit()
    db.refresh(new_partner)
    
    return DonorPartnerResponse(
        id=new_partner.id,
        name=new_partner.name,
        category=new_partner.category,
        tier=new_partner.tier,
        logo_url=new_partner.logo_url,
        website_url=new_partner.website_url,
        total_contribution_display=new_partner.total_contribution_display,
        is_anonymous=new_partner.is_anonymous,
        anonymous_name=new_partner.anonymous_name,
        quote=new_partner.quote,
        location=new_partner.location,
        since=new_partner.since,
        is_recurring=new_partner.is_recurring
    )


@router.delete("/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_donor_partner(
    partner_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a donor partner (admin only)"""
    partner = db.query(DonorPartner).filter(DonorPartner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Donor partner not found")
    
    db.delete(partner)
    db.commit()
    return None

