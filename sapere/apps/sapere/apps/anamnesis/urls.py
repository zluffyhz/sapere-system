from django.urls import path
from django.views.generic import TemplateView

app_name = 'anamnesis'

urlpatterns = [
    path('', TemplateView.as_view(template_name='anamnesis/list.html'), name='list'),
    path('create/', TemplateView.as_view(template_name='anamnesis/create.html'), name='create'),
]
