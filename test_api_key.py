import asyncio
import hashlib
import secrets
import sys
import os

sys.path.append(os.path.abspath("backend"))

from backend.app.core.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.auth import ApiKey
from sqlalchemy import select

async def main():
    async with SessionLocal() as db:
        # Get first user
        result = await db.execute(select(User))
        user = result.scalars().first()
        if not user:
            print("No user found!")
            return
            
        print(f"Testing with User: {user.email}")
        
        # Create API key
        raw_key = f"df_test_{secrets.token_hex(16)}"
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        
        new_key = ApiKey(
            user_id=user.id,
            name="CI/CD External Integration Test",
            key_hash=key_hash,
            prefix=raw_key[:10] + "..."
        )
        db.add(new_key)
        await db.commit()
        
        print(f"Created API Key: {raw_key}")
        
        # Write to file so we can read it easily
        with open("temp_key.txt", "w") as f:
            f.write(raw_key)

if __name__ == "__main__":
    asyncio.run(main())
