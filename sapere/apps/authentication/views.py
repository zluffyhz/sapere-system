from django.contrib.auth.views import LoginView
from django.shortcuts import redirect
from django.contrib.auth import login
from django.contrib import messages


class CustomLoginView(LoginView):
    template_name = 'authentication/login.html'
    redirect_authenticated_user = True
    
    def get_success_url(self):
        return '/dashboard/'
    
    def form_valid(self, form):
        user = form.get_user()
        login(self.request, user)
        messages.success(self.request, f'Bem-vindo(a), {user.first_name or user.username}!')
        return redirect(self.get_success_url())
    
    def form_invalid(self, form):
        messages.error(self.request, 'Usuário ou senha incorretos.')
        return super().form_invalid(form)