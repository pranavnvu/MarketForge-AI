import asyncio
import os
import sys
sys.path.append(os.path.abspath("backend"))
from app.core.config import settings
import stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

async def main():
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'DevForge AI Pro Plan',
                    },
                    'unit_amount': 2900,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url="http://localhost:3000/dashboard/billing?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:3000/dashboard/billing",
        )
        print("Success:", session.url)
    except Exception as e:
        print("Error:", str(e))

asyncio.run(main())
