"""
WSGI config for g_marketplace project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'g_marketplace.settings')

application = get_wsgi_application()
