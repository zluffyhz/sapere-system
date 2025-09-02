from .models import ClinicSettings


def clinic_info(request):
    """Add clinic information to template context"""
    try:
        clinic = ClinicSettings.objects.filter(active=True).first()
        if not clinic:
            clinic = ClinicSettings.objects.create(
                clinic_name='Clínica Sapere',
                address='Especializada em Neurodivergência',
                phone='(11) 99999-9999'
            )
    except:
        clinic = None
    
    return {
        'clinic': clinic,
        'clinic_name': clinic.clinic_name if clinic else 'Clínica Sapere'
    }