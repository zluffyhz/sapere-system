from django.urls import path
from django.views.generic import TemplateView

app_name = 'sessions'

urlpatterns = [
    path('', TemplateView.as_view(template_name='sessions/list.html'), name='list'),
    path('create/', TemplateView.as_view(template_name='sessions/create.html'), name='create'),
]
