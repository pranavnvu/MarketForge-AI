import os
import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_current_user, get_db_session
from app.models.user import User, UserRole
from app.core.config import settings

router = APIRouter()

stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/create-checkout-session")
async def create_checkout_session(current_user: User = Depends(get_current_user)):
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'DevForge AI Pro Plan',
                        'description': 'Unlimited projects, unlimited tokens, all agents.',
                    },
                    'unit_amount': 2900, # $29.00
                },
                'quantity': 1,
            }],
            mode='payment', # Use subscription mode if using stripe products, but payment is fine for a one-off lifetime/mock
            success_url="http://localhost:3000/dashboard/billing?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:3000/dashboard/billing",
            client_reference_id=str(current_user.id),
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-session")
async def verify_session(session_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == "paid":
            # Upgrade user to Pro!
            current_user.role = UserRole.PRO
            db.add(current_user)
            await db.commit()
            return {"success": True, "role": "pro"}
        return {"success": False, "status": session.payment_status}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
