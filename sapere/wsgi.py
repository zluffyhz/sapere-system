"""
WSGI config for Sapere Clinic Management System.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sapere.settings')

application = get_wsgi_application()