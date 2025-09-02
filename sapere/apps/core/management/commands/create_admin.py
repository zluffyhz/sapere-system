from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create default admin user for Sapere system'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@sapere.com.br',
                password='sapere2025',
                first_name='Administrador',
                last_name='Sapere'
            )
            self.stdout.write(
                self.style.SUCCESS(f'✅ Admin user created: {admin.username}')
            )
        else:
            self.stdout.write(
                self.style.WARNING('⚠️  Admin user already exists')
            )