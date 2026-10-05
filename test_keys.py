import sys
import os
sys.path.append(os.path.abspath("backend"))
from app.core.config import settings
print("Secret key:", settings.STRIPE_SECRET_KEY[:10] if settings.STRIPE_SECRET_KEY else "None")
