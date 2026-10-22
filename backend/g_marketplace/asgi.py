"""
ASGI config for g_marketplace project.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'g_marketplace.settings')

application = get_asgi_application()
