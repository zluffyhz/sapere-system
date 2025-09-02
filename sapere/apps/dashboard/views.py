from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils import timezone
from datetime import datetime, timedelta


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'dashboard/home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Mock data for now - will be replaced with real queries
        context.update({
            'total_patients': 47,
            'appointments_today': 8, 
            'appointments_week': 23,
            'sessions_completed': 156,
            'recent_activity': [
                {'type': 'appointment', 'message': 'Nova consulta agendada com Maria Silva', 'time': '2 horas atrás'},
                {'type': 'patient', 'message': 'Novo paciente cadastrado: João Santos', 'time': '4 horas atrás'},
                {'type': 'session', 'message': 'Sessão concluída com Ana Costa', 'time': '1 dia atrás'},
            ]
        })
        
        return context