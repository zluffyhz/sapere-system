from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from sapere.apps.core.models import BaseModel


class Patient(BaseModel):
    """Patient model for neurodivergent individuals"""
    
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
        ('O', 'Outro'),
        ('N', 'Prefiro não informar'),
    ]
    
    NEURODIVERGENCE_TYPES = [
        ('ADHD', 'TDAH'),
        ('AUTISM', 'Autismo'),
        ('DYSLEXIA', 'Dislexia'),
        ('TOURETTE', 'Síndrome de Tourette'),
        ('OCD', 'TOC'),
        ('BIPOLAR', 'Transtorno Bipolar'),
        ('ANXIETY', 'Transtorno de Ansiedade'),
        ('DEPRESSION', 'Depressão'),
        ('OTHER', 'Outro'),
    ]
    
    # Personal Information
    name = models.CharField('Nome Completo', max_length=200)
    birth_date = models.DateField('Data de Nascimento')
    gender = models.CharField('Gênero', max_length=1, choices=GENDER_CHOICES)
    cpf = models.CharField('CPF', max_length=14, blank=True)
    rg = models.CharField('RG', max_length=20, blank=True)
    
    # Contact Information
    phone = models.CharField('Telefone', max_length=20, blank=True)
    email = models.EmailField('Email', blank=True)
    
    # Address
    address = models.CharField('Endereço', max_length=200, blank=True)
    neighborhood = models.CharField('Bairro', max_length=100, blank=True)
    city = models.CharField('Cidade', max_length=100, blank=True)
    state = models.CharField('Estado', max_length=2, blank=True)
    zip_code = models.CharField('CEP', max_length=10, blank=True)
    
    # Medical Information
    neurodivergence_type = models.CharField(
        'Tipo de Neurodivergência',
        max_length=20,
        choices=NEURODIVERGENCE_TYPES,
        blank=True
    )
    diagnosis_date = models.DateField('Data do Diagnóstico', null=True, blank=True)
    medications = models.TextField('Medicamentos', blank=True)
    allergies = models.TextField('Alergias', blank=True)
    medical_history = models.TextField('Histórico Médico', blank=True)
    
    # Emergency Contact
    emergency_contact_name = models.CharField('Nome do Contato de Emergência', max_length=200, blank=True)
    emergency_contact_phone = models.CharField('Telefone de Emergência', max_length=20, blank=True)
    emergency_contact_relationship = models.CharField('Parentesco', max_length=100, blank=True)
    
    # Responsible Person (for minors)
    responsible_name = models.CharField('Nome do Responsável', max_length=200, blank=True)
    responsible_phone = models.CharField('Telefone do Responsável', max_length=20, blank=True)
    responsible_email = models.EmailField('Email do Responsável', blank=True)
    responsible_cpf = models.CharField('CPF do Responsável', max_length=14, blank=True)
    
    # Insurance
    has_insurance = models.BooleanField('Possui Convênio', default=False)
    insurance_company = models.CharField('Convênio', max_length=200, blank=True)
    insurance_number = models.CharField('Número do Convênio', max_length=100, blank=True)
    
    # Notes
    observations = models.TextField('Observações', blank=True)
    special_needs = models.TextField('Necessidades Especiais', blank=True)
    
    class Meta:
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def age(self):
        """Calculate patient age"""
        if self.birth_date:
            today = timezone.now().date()
            return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
        return None
    
    @property
    def is_minor(self):
        """Check if patient is under 18"""
        return self.age < 18 if self.age else False
    
    def get_neurodivergence_display_color(self):
        """Return color for neurodivergence type display"""
        colors = {
            'ADHD': 'primary',
            'AUTISM': 'success',
            'DYSLEXIA': 'info',
            'TOURETTE': 'warning',
            'OCD': 'secondary',
            'BIPOLAR': 'danger',
            'ANXIETY': 'dark',
            'DEPRESSION': 'light',
            'OTHER': 'muted'
        }
        return colors.get(self.neurodivergence_type, 'secondary')