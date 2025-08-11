from django.urls import path
from .views import register_user
from .views import login_user
from . import views


urlpatterns = [
    path('register/', register_user),
  #  path('login/', login_view, name='login'),  
     
      path('login/', login_user),
      path('dashboard/', views.dashboard, name='dashboard'),  # Example view
]
