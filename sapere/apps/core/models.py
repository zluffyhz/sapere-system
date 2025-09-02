from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class BaseModel(models.Model):
    """Base model with common fields"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='%(class)s_created',
        null=True,
        blank=True
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='%(class)s_updated',
        null=True,
        blank=True
    )
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class ClinicSettings(BaseModel):
    """Clinic configuration and settings"""
    clinic_name = models.CharField(max_length=200, default='Clínica Sapere')
    clinic_logo = models.ImageField(upload_to='clinic/', blank=True, null=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    cnpj = models.CharField(max_length=18, blank=True)
    responsible_name = models.CharField(max_length=200, blank=True)
    responsible_crp = models.CharField(max_length=20, blank=True)
    
    class Meta:
        verbose_name = 'Configuração da Clínica'
        verbose_name_plural = 'Configurações da Clínica'
    
    def __str__(self):
        return self.clinic_name