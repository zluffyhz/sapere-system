from django.views.generic import ListView, CreateView, DetailView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.contrib import messages
from .models import Patient


class PatientListView(LoginRequiredMixin, ListView):
    model = Patient
    template_name = 'patients/list.html'
    context_object_name = 'patients'
    paginate_by = 20
    
    def get_queryset(self):
        queryset = Patient.objects.filter(active=True).order_by('name')
        search = self.request.GET.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class PatientCreateView(LoginRequiredMixin, CreateView):
    model = Patient
    template_name = 'patients/create.html'
    fields = ['name', 'birth_date', 'gender', 'phone', 'email', 
              'neurodivergence_type', 'responsible_name', 'responsible_phone',
              'observations']
    success_url = reverse_lazy('patients:list')
    
    def form_valid(self, form):
        form.instance.created_by = self.request.user
        messages.success(self.request, 'Paciente cadastrado com sucesso!')
        return super().form_valid(form)


class PatientDetailView(LoginRequiredMixin, DetailView):
    model = Patient
    template_name = 'patients/detail.html'
    context_object_name = 'patient'


class PatientUpdateView(LoginRequiredMixin, UpdateView):
    model = Patient
    template_name = 'patients/edit.html'
    fields = ['name', 'birth_date', 'gender', 'phone', 'email', 
              'neurodivergence_type', 'responsible_name', 'responsible_phone',
              'observations']
    
    def get_success_url(self):
        return reverse_lazy('patients:detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        form.instance.updated_by = self.request.user
        messages.success(self.request, 'Paciente atualizado com sucesso!')
        return super().form_valid(form)


class PatientDeleteView(LoginRequiredMixin, DeleteView):
    model = Patient
    template_name = 'patients/delete.html'
    success_url = reverse_lazy('patients:list')
    
    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.active = False
        self.object.save()
        messages.success(request, 'Paciente removido com sucesso!')
        return super().delete(request, *args, **kwargs)