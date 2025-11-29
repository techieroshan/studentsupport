"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from database import get_db
from models import User, VerificationCode
from schemas import UserCreate, UserLogin, UserResponse, Token, VerifyEmailRequest, ResendOTPRequest
from auth import get_password_hash, verify_password, create_access_token
from email_service import email_service
from utils import generate_otp, get_otp_expiry

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user."""
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        display_name=user_data.display_name,
        role=user_data.role,
        city=user_data.city,
        state=user_data.state,
        zip_code=user_data.zip_code,
        country=user_data.country,
        phone=user_data.phone
    )
    
    db.add(new_user)
    await db.flush()
    
    # Generate and send verification code
    otp_code = generate_otp()
    verification_code = VerificationCode(
        user_id=new_user.id,
        code=otp_code,
        code_type="email",
        expires_at=get_otp_expiry()
    )
    
    db.add(verification_code)
    await db.commit()
    await db.refresh(new_user)
    
    # Send verification email
    html, text = email_service.get_email_template(
        "verification",
        code=otp_code,
        user_name=new_user.display_name
    )
    await email_service.send_email(
        to_email=new_user.email,
        subject="Verify your Student Support account",
        html_content=html,
        text_content=text
    )
    
    return new_user


@router.post("/verify-email")
async def verify_email(
    verification: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verify email with OTP code."""
    # Find user
    result = await db.execute(select(User).where(User.email == verification.email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Find valid verification code
    result = await db.execute(
        select(VerificationCode)
        .where(
            VerificationCode.user_id == user.id,
            VerificationCode.code == verification.code,
            VerificationCode.code_type == "email",
            VerificationCode.is_used == False,
            VerificationCode.expires_at > datetime.utcnow()
        )
    )
    code_obj = result.scalar_one_or_none()
    
    if not code_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    # Mark code as used and verify user
    code_obj.is_used = True
    user.email_verified = True
    user.verification_status = "VERIFIED"
    
    await db.commit()
    
    # Send welcome email
    html, text = email_service.get_email_template(
        "welcome",
        user_name=user.display_name
    )
    await email_service.send_email(
        to_email=user.email,
        subject=f"Welcome to Student Support!",
        html_content=html,
        text_content=text
    )
    
    return {"message": "Email verified successfully"}


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login user."""
    # Find user
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/resend-otp")
async def resend_otp(
    request: ResendOTPRequest,
    db: AsyncSession = Depends(get_db)
):
    """Resend OTP code."""
    if request.code_type == "email" and request.email:
        # Find user by email
        result = await db.execute(select(User).where(User.email == request.email))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate new OTP
        otp_code = generate_otp()
        verification_code = VerificationCode(
            user_id=user.id,
            code=otp_code,
            code_type="email",
            expires_at=get_otp_expiry()
        )
        
        db.add(verification_code)
        await db.commit()
        
        # Send verification email
        html, text = email_service.get_email_template(
            "verification",
            code=otp_code,
            user_name=user.display_name
        )
        await email_service.send_email(
            to_email=user.email,
            subject="Verify your Student Support account",
            html_content=html,
            text_content=text
        )
        
        return {"message": "Verification code sent to email"}
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid request"
    )
